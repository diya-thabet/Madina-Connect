import httpx
import asyncio
from zeep import Client, Settings
from zeep.transports import Transport
import os
from dotenv import load_dotenv

load_dotenv()

# Load URLs from env
MOBILITY_URL = os.getenv("MOBILITY_SERVICE_URL")
EVENTS_URL = os.getenv("EVENTS_SERVICE_URL")
AIR_WSDL = os.getenv("AIR_QUALITY_WSDL_URL")

async def fetch_mobility_data():
    """
    Consumes Service 1 (REST) - Madina Mobility
    Target: /api/mobility/traffic (To get delays/alerts)
    """
    async with httpx.AsyncClient() as client:
        try:
            # 1. Fetch Traffic Alerts (Crucial for planning)
            traffic_url = f"{MOBILITY_URL}/api/mobility/traffic"
            resp = await client.get(traffic_url, timeout=5.0)
            
            if resp.status_code == 200:
                alerts = resp.json()
                # If list is empty, it means "No delays"
                if not alerts:
                    return "No current traffic alerts. Public transport running on time."
                return alerts
            
            # Fallback: Check lines if traffic endpoint fails
            lines_url = f"{MOBILITY_URL}/api/mobility/lines"
            resp_lines = await client.get(lines_url, timeout=5.0)
            if resp_lines.status_code == 200:
                 return f"Traffic info unavailable, but {len(resp_lines.json())} lines are active."

            return f"Error: Mobility API returned {resp.status_code}"
        except Exception as e:
            return f"Mobility Service Unavailable: {str(e)}"

async def fetch_events_data():
    """
    Consumes Service 3 (GraphQL) - Events
    Target: getAllEvents
    """
    query = """
    query {
      getAllEvents {
        title
        date
        location
        category
        isFree
      }
    }
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                EVENTS_URL, 
                json={"query": query},
                timeout=5.0
            )
            result = resp.json()
            # The schema shows returns: { "data": { "getAllEvents": [...] } }
            events = result.get("data", {}).get("getAllEvents", [])
            return events
        except Exception as e:
            return f"Events Service Unavailable: {str(e)}"

def fetch_air_quality_data_sync():
    """
    Consumes Service 2 (SOAP) - Air Quality
    Target: getAirQuality(zone="Tunis")
    """
    try:
        # Settings to handle XML parsing loosely if needed
        settings = Settings(strict=False, xml_huge_tree=True)
        client = Client(AIR_WSDL, settings=settings)

        # Calling the operation defined in WSDL:
        # <wsdl:operation name="getAirQuality">
        #   Input: getAirQualityRequest -> zone (string)
        
        # We use 'Tunis' as the default zone
        response = client.service.getAirQuality(zone="Tunis")
        
        # FIX: Zeep auto-unwraps the 'data' element in some WSDL configurations.
        # We check if we need to access .data or if response IS the data.
        data = response.data if hasattr(response, 'data') else response

        return {
            "location": getattr(data, 'zone', 'Tunis'),
            "aqi": getattr(data, 'aqi', 0),
            "status": getattr(data, 'status', 'Unknown'),
            "pollutants": {
                "pm10": getattr(data, 'pm10', 0.0),
                "no2": getattr(data, 'no2', 0.0),
                "co2": getattr(data, 'co2', 0.0)
            }
        }

    except Exception as e:
        return {
            "error": f"SOAP Failure: {str(e)}",
            "hint": "Check if WSDL URL is http://localhost:8081/ws/airQuality.wsdl"
        }

async def fetch_all_services():
    """
    Orchestrator: Calls all services in parallel
    """
    # Create tasks
    mobility_task = fetch_mobility_data()
    events_task = fetch_events_data()
    
    # Run SOAP in a thread because it is blocking
    air_task = asyncio.to_thread(fetch_air_quality_data_sync)
    
    # Execute all
    mobility, events, air = await asyncio.gather(mobility_task, events_task, air_task)
    
    return {
        "mobility": mobility,
        "events": events,
        "air_quality": air
    }