from pydantic import BaseModel
from typing import Optional, List, Any

# --- Request Model ---
class TourRequest(BaseModel):
    user_preferences: str
    # Example: "I like history and outdoor walking" or "I am asthmatic, prefer indoors"

# --- Response Models ---
class ServiceStatus(BaseModel):
    service_name: str
    status: str
    data: Any

class ItineraryResponse(BaseModel):
    planner_status: str
    generated_plan: str
    raw_data_summary: List[ServiceStatus]