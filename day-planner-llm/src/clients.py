import httpx
import asyncio
from zeep import Client, Settings
from zeep.transports import Transport
from zeep.helpers import serialize_object
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
    """
    async with httpx.AsyncClient() as client:
        try:
            # Try fetching traffic alerts first
            traffic_url = f"{MOBILITY_URL}/api/mobility/traffic"
            resp = await client.get(traffic_url, timeout=5.0)
            
            if resp.status_code == 200:
                alerts = resp.json()
                if not alerts:
                    return "No current traffic alerts. Public transport running on time."
                return alerts
            
            # Fallback to checking lines
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
            return result.get("data", {}).get("getAllEvents", [])
        except Exception as e:
            return f"Events Service Unavailable: {str(e)}"

def fetch_air_quality_data_sync():
    """
    Consumes Service 2 (SOAP) - Air Quality
    Target: getAirQuality(zone="Tunis")
    """
    try:
        # 1. Setup Client
        settings = Settings(strict=False, xml_huge_tree=True)
        client = Client(AIR_WSDL, settings=settings)

        # 2. Call SOAP Method
        # The WSDL expects 'zone' string.
        response = client.service.getAirQuality(zone="Tunis")
        
        # 3. DEBUG & FIX: Serialize to Python Dictionary
        # This converts the complex Zeep object into a standard Dict
        # making it much easier to find the data.
        data_dict = serialize_object(response)
        
        print(f"DEBUG SOAP RESPONSE: {data_dict}") # Check your terminal to see the structure!

        # 4. Extract Data safely (Handling potential nesting)
        # Sometimes the data is inside a 'data' key, sometimes it's at the root.
        actual_data = data_dict
        if 'data' in data_dict and isinstance(data_dict['data'], dict):
            actual_data = data_dict['data']

        return {
            "location": actual_data.get('zone', 'Tunis'),
            "aqi": actual_data.get('aqi', 0),
            "status": actual_data.get('status', 'Unknown'),
            "pollutants": {
                "pm10": actual_data.get('pm10', 0.0),
                "no2": actual_data.get('no2', 0.0),
                "co2": actual_data.get('co2', 0.0),
                "o3": actual_data.get('o3', 0.0)
            }
        }

    except Exception as e:
        print(f"SOAP ERROR: {e}")
        return {
            "error": str(e),
            "hint": "Check WSDL URL and Java Service Logs"
        }

async def fetch_all_services():
    """
    Orchestrator: Calls all services in parallel
    """
    mobility_task = fetch_mobility_data()
    events_task = fetch_events_data()
    air_task = asyncio.to_thread(fetch_air_quality_data_sync)
    
    mobility, events, air = await asyncio.gather(mobility_task, events_task, air_task)
    
    return {
        "mobility": mobility,
        "events": events,
        "air_quality": air
    }