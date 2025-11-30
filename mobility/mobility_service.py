from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict

# --- 1. Pydantic Models for Data Structure and Validation ---

class Schedule(BaseModel):
    """Represents a specific scheduled time."""
    time: str = Field(..., example="08:15 AM")
    destination: str = Field(..., example="Central Station")
    platform: int = Field(..., example=3)

class Line(BaseModel):
    """Represents a public transport line."""
    line_id: str = Field(..., example="BUS-1A")
    name: str = Field(..., example="Avenue Habib Bourguiba to Marsa Plage")
    type: str = Field(..., example="Bus") # Bus, Metro, Train

class TrafficUpdate(BaseModel):
    """Represents a real-time traffic status update."""
    location: str = Field(..., example="Bab Saadoun Intersection")
    status: str = Field(..., example="Heavy Delay") # On Time, Minor Delay, Heavy Delay, Cancelled
    details: str = Field(None, example="Road blockage due to maintenance.")

class LineSchedule(BaseModel):
    """Response model for a line's schedule."""
    line_id: str
    schedules: List[Schedule]

# --- 2. FastAPI Application Setup ---

app = FastAPI(
    title="Madina-Connect Mobility Service",
    description="Provides real-time transport schedules and traffic status via REST.",
    version="1.0.0"
)

# --- 3. Mock Data (In a real app, this would be a database connection) ---

# Mock data for transport lines
MOCK_LINES: Dict[str, Line] = {
    "BUS-1A": Line(line_id="BUS-1A", name="Line A: Tunis Sud Express", type="Bus"),
    "METRO-3": Line(line_id="METRO-3", name="Metro 3: Tunis Marine", type="Metro"),
    "TRAIN-S5": Line(line_id="TRAIN-S5", name="Train S5: Sahel Express", type="Train"),
}

# Mock data for schedules
MOCK_SCHEDULES: Dict[str, List[Schedule]] = {
    "BUS-1A": [
        Schedule(time="07:00 AM", destination="Central Station", platform=1),
        Schedule(time="07:30 AM", destination="Manar 2", platform=1),
    ],
    "METRO-3": [
        Schedule(time="08:15 AM", destination="Khaznadar", platform=3),
        Schedule(time="08:30 AM", destination="Bab Souika", platform=3),
    ]
}

# Mock data for traffic updates
MOCK_TRAFFIC: List[TrafficUpdate] = [
    TrafficUpdate(
        location="Lac 1 Bridge",
        status="Minor Delay",
        details="Unexpected volume, expect 5-10 min delay."
    ),
    TrafficUpdate(
        location="Aéroport Tunis-Carthage (Bus stops)",
        status="On Time",
        details="All services running normally."
    ),
]


# --- 4. Endpoints (Routes) Implementation ---

@app.get("/api/mobility/lines", response_model=List[Line], tags=["Lines"])
def get_all_lines():
    """
    Retrieves a list of all available public transport lines in the city.
    """
    return list(MOCK_LINES.values())

@app.get("/api/mobility/lines/{line_id}/schedule", response_model=LineSchedule, tags=["Lines"])
def get_line_schedule(line_id: str):
    """
    Consults the upcoming schedule for a specific line ID.
    """
    if line_id not in MOCK_LINES:
        raise HTTPException(status_code=404, detail=f"Line ID '{line_id}' not found.")

    schedules = MOCK_SCHEDULES.get(line_id, [])
    if not schedules:
        # Simulate a case where a line is found but has no current schedule
        return LineSchedule(line_id=line_id, schedules=[])

    return LineSchedule(line_id=line_id, schedules=schedules)

@app.get("/api/mobility/traffic", response_model=List[TrafficUpdate], tags=["Traffic"])
def get_traffic_status():
    """
    Provides real-time status of traffic and transport disruptions across the network.
    """
    return MOCK_TRAFFIC

@app.get("/api/mobility/interconnect", response_model=List[str], tags=["Interoperability"])
def get_interconnect_options():
    """
    Provides information on key transport hubs and available connections (e.g., Bus to Metro).
    """
    return [
        "Jardin Thameur: Metro 2, 4, 5, Bus lines 10, 20.",
        "Tunis Marine: Metro 3, 5, TGM train line.",
        "Central Station: Train S5, Bus lines 1A, 1B, 20.",
    ]

# --- 5. Application Startup (for Docker) ---

# Uvicorn is the ASGI server for running FastAPI
if __name__ == "__main__":
    import uvicorn
    # The default port 8000 is used for consistency in the project
    uvicorn.run(app, host="0.0.0.0", port=8000)

# IMPORTANT NOTE FOR OPENAPI:
# After running the service, the OpenAPI (Swagger) documentation
# required for your submission is automatically generated here:
# http://127.0.0.1:8000/docs