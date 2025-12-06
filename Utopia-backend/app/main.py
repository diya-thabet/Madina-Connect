import os
import httpx
import grpc
import sys
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any

# --- SOAP Client ---
from zeep import Client, Settings

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MadinaGateway")

# --- DYNAMIC GRPC IMPORT ---
# We point to the folder where Docker generates the code
sys.path.append("/app/generated_code")
try:
    import urgence_pb2
    import urgence_pb2_grpc
    logger.info("✅ gRPC Modules loaded successfully.")
except ImportError:
    logger.error("❌ CRITICAL: gRPC modules not found. Did the Docker build finish correctly?")

app = FastAPI(title="Madina Smart City Gateway", version="2.0")

# Enable CORS for your Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENVIRONMENT VARIABLES (Mapped to K8s Services) ---
# These defaults match your 'kubectl get services' output
MOBILITY_URL = os.getenv("MOBILITY_URL", "http://mobility-service:8000")
SOAP_WSDL_URL = os.getenv("AIR_QUALITY_WSDL_URL", "http://air-quality-service:8081/ws/airQuality.wsdl")
GRAPHQL_URL = os.getenv("EVENTS_SERVICE_URL", "http://events-service:8082/graphql")
GRPC_HOST = os.getenv("URGENCE_GRPC_HOST", "urgence-service")
GRPC_PORT = os.getenv("URGENCE_GRPC_PORT", "9090")

# =================================================================
# 1. MOBILITY SERVICE ADAPTER (REST Proxy)
# =================================================================
@app.get("/api/mobility/{path:path}")
async def proxy_mobility_requests(path: str):
    """
    Forwards any GET request from /api/mobility/... directly to the Mobility Service.
    Example: /api/mobility/lines/TGM/schedule -> http://mobility-service:8000/api/mobility/lines/TGM/schedule
    """
    target_url = f"{MOBILITY_URL}/api/mobility/{path}"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(target_url, timeout=5.0)
            return resp.json()
        except httpx.RequestError as e:
            logger.error(f"Mobility Service Error: {e}")
            raise HTTPException(status_code=503, detail="Mobility Service Unavailable")

# =================================================================
# 2. AIR QUALITY SERVICE ADAPTER (SOAP -> JSON)
# =================================================================
@app.get("/api/air-quality/{zone}")
def get_air_quality_soap_adapter(zone: str):
    """
    Translates JSON request to XML, talks to SOAP backend, and returns JSON.
    """
    try:
        # 'strict=False' is important for compatibility
        settings = Settings(strict=False, xml_huge_tree=True)
        client = Client(wsdl=SOAP_WSDL_URL, settings=settings)
        
        # Call the SOAP function 'getAirQuality'
        response = client.service.getAirQuality(zone=zone)
        
        # Serialize the Zeep object to a Python Dict
        return {
            "zone": response.zone,
            "aqi": response.aqi,
            "status": response.status,
            "pm10": response.pm10,
            "pm25": response.pm25,
            "no2": response.no2
        }
    except Exception as e:
        logger.error(f"SOAP Error: {e}")
        raise HTTPException(status_code=500, detail=f"Air Quality Service Error: {str(e)}")

# =================================================================
# 3. EVENTS SERVICE ADAPTER (GraphQL -> JSON)
# =================================================================
class GraphQLQuery(BaseModel):
    query: str
    variables: Optional[dict] = {}

@app.post("/api/events/query")
async def graphql_adapter(payload: GraphQLQuery):
    """
    Accepts a GraphQL query string and forwards it to the Events Service.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                GRAPHQL_URL, 
                json={"query": payload.query, "variables": payload.variables},
                timeout=5.0
            )
            return resp.json()
        except httpx.RequestError as e:
            logger.error(f"GraphQL Service Error: {e}")
            raise HTTPException(status_code=503, detail="Events Service Unavailable")

# =================================================================
# 4. URGENCE SERVICE ADAPTER (JSON -> gRPC)
# =================================================================
class AlertSchema(BaseModel):
    type: str
    latitude: float
    longitude: float
    description: str
    sender_cin: str

@app.post("/api/urgence/alert")
async def create_alert_grpc_adapter(alert: AlertSchema):
    """
    Transcodes JSON input into a Protobuf Binary message and sends it over gRPC.
    """
    logger.info(f"Connecting to gRPC Service at {GRPC_HOST}:{GRPC_PORT}")
    try:
        async with grpc.aio.insecure_channel(f'{GRPC_HOST}:{GRPC_PORT}') as channel:
            stub = urgence_pb2_grpc.UrgenceServiceStub(channel)
            
            # 1. Create Protobuf Message
            grpc_req = urgence_pb2.AlertRequest(
                type=alert.type,
                latitude=alert.latitude,
                longitude=alert.longitude,
                description=alert.description,
                sender_cin=alert.sender_cin
            )
            
            # 2. Call Remote Procedure
            response = await stub.CreateAlert(grpc_req)
            
            # 3. Return JSON
            return {
                "alert_id": response.alert_id,
                "status": response.status,
                "received_at": response.received_timestamp,
                "note": "Processed via gRPC"
            }
    except grpc.RpcError as e:
        logger.error(f"gRPC Error: {e}")
        raise HTTPException(status_code=500, detail=f"Urgence Service Failed: {e.details()}")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Madina Gateway"}