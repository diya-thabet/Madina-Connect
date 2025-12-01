from fastapi import FastAPI, HTTPException
from .models import TourRequest, ItineraryResponse, ServiceStatus
from .clients import fetch_all_services
from .llm_engine import generate_smart_plan
import uvicorn

app = FastAPI(
    title="Madina Smart Planner Orchestrator",
    description="Microservice 4: Consumes REST, SOAP, and GraphQL to feed an AI Agent.",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "Day Planner Service is Online"}

@app.post("/plan-day", response_model=ItineraryResponse)
async def plan_day_tour(request: TourRequest):
    # Step 1: Orchestration - Collect Data
    print("⏳ Contacting Mobility, Air Quality, and Events services...")
    aggregated_data = await fetch_all_services()
    
    # Step 2: Intelligence - Process with LLM
    print("🧠 Sending data to Gemini AI...")
    ai_plan = generate_smart_plan(aggregated_data, request.user_preferences)
    
    # Step 3: Format Response
    summary = [
        ServiceStatus(service_name="Mobility (REST)", status="Fetched", data=aggregated_data['mobility']),
        ServiceStatus(service_name="Air Quality (SOAP)", status="Fetched", data=aggregated_data['air_quality']),
        ServiceStatus(service_name="Events (GraphQL)", status="Fetched", data=aggregated_data['events']),
    ]
    
    return ItineraryResponse(
        planner_status="Success",
        generated_plan=ai_plan,
        raw_data_summary=summary
    )

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)