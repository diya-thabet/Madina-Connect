from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from sqlalchemy import create_engine, Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, declarative_base, relationship
from contextlib import asynccontextmanager
import os

# --- 1. Database Configuration (SQLite) ---
DATABASE_URL = "sqlite:///./mobility.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. Database Entities (Tables) ---

class TransportLineDB(Base):
    __tablename__ = "transport_lines"
    line_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # Bus, Metro, Train
    is_active = Column(Boolean, default=True)

class ScheduleDB(Base):
    """
    Requirement 1: Consultation des horaires (Schedules)
    """
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(String, ForeignKey("transport_lines.line_id"))
    departure_time = Column(String) # e.g., "08:15"
    direction = Column(String) # e.g., "Vers La Marsa"

class TrafficDB(Base):
    """
    Requirement 2: Suivi de l'état du trafic (Traffic Status)
    """
    __tablename__ = "traffic_events"
    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(String, ForeignKey("transport_lines.line_id"), nullable=True)
    status = Column(String) # "Normal", "Delayed", "Cancelled"
    message = Column(String) # e.g., "Retard de 10 min suite panne technique"
    location = Column(String) # e.g., "Station Bardo"

class HubDB(Base):
    """
    Requirement 3: Correspondances (Interconnections)
    """
    __tablename__ = "transport_hubs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # e.g., "Place de Barcelone"
    connections = Column(String) # e.g., "Metro 1, 2, 4, 5, 6 | Trains SNCFT"

# Create tables
Base.metadata.create_all(bind=engine)

# --- 3. Pydantic Models ---

# --- Lines ---
class LineCreate(BaseModel):
    line_id: str
    name: str
    type: str

class LineResponse(LineCreate):
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# --- Schedules ---
class ScheduleCreate(BaseModel):
    line_id: str
    departure_time: str
    direction: str

class ScheduleResponse(ScheduleCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Traffic ---
class TrafficCreate(BaseModel):
    line_id: Optional[str] = None
    status: str
    message: str
    location: str

class TrafficResponse(TrafficCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Hubs ---
class HubCreate(BaseModel):
    name: str
    connections: str

class HubResponse(HubCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- 4. Application Startup (Data Injection) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        # Force Clean & Re-Inject for Demo purposes to ensure data is always perfect
        print("--- CLEANING DATABASE FOR DEMO ---")
        db.query(ScheduleDB).delete()
        db.query(TrafficDB).delete()
        db.query(HubDB).delete()
        db.query(TransportLineDB).delete()
        db.commit()

        print("--- INJECTING REAL TUNISIAN DATA ---")
        
        # 1. Lines
        lines = [
            TransportLineDB(line_id="TGM", name="Tunis Marine - La Marsa", type="Train"),
            TransportLineDB(line_id="METRO-4", name="Place de Barcelone - Manouba", type="Metro"),
            TransportLineDB(line_id="METRO-2", name="Place de la République - Ariana", type="Metro"),
            TransportLineDB(line_id="BUS-20", name="Tunis - La Marsa", type="Bus"),
            TransportLineDB(line_id="RFR-E", name="Tunis - Bou Gatfa", type="Train"),
        ]
        db.add_all(lines)
        db.commit()

        # 2. Schedules (Horaires) - FULLY CONNECTED DATA
        schedules = [
            # TGM Schedules (Tunis Marine -> La Marsa)
            ScheduleDB(line_id="TGM", departure_time="07:00", direction="La Marsa"),
            ScheduleDB(line_id="TGM", departure_time="07:20", direction="La Marsa"),
            ScheduleDB(line_id="TGM", departure_time="07:40", direction="La Marsa"),
            ScheduleDB(line_id="TGM", departure_time="08:00", direction="La Marsa"),
            ScheduleDB(line_id="TGM", departure_time="08:20", direction="La Marsa"),
            
            # METRO-4 Schedules (Barcelone -> Manouba)
            ScheduleDB(line_id="METRO-4", departure_time="07:05", direction="Manouba"),
            ScheduleDB(line_id="METRO-4", departure_time="07:12", direction="Manouba"),
            ScheduleDB(line_id="METRO-4", departure_time="07:20", direction="Manouba"),
            ScheduleDB(line_id="METRO-4", departure_time="07:30", direction="Manouba"),

            # METRO-2 Schedules (République -> Ariana)
            ScheduleDB(line_id="METRO-2", departure_time="07:10", direction="Ariana"),
            ScheduleDB(line_id="METRO-2", departure_time="07:18", direction="Ariana"),
            ScheduleDB(line_id="METRO-2", departure_time="07:25", direction="Ariana"),
            ScheduleDB(line_id="METRO-2", departure_time="07:35", direction="Ariana"),

            # BUS-20 Schedules (Tunis -> La Marsa)
            ScheduleDB(line_id="BUS-20", departure_time="07:15", direction="La Marsa"),
            ScheduleDB(line_id="BUS-20", departure_time="07:45", direction="La Marsa"),
            ScheduleDB(line_id="BUS-20", departure_time="08:15", direction="La Marsa"),

            # RFR-E Schedules (Tunis -> Bou Gatfa)
            ScheduleDB(line_id="RFR-E", departure_time="07:15", direction="Bou Gatfa"),
            ScheduleDB(line_id="RFR-E", departure_time="07:30", direction="Bou Gatfa"),
            ScheduleDB(line_id="RFR-E", departure_time="07:45", direction="Bou Gatfa"),
        ]
        db.add_all(schedules)
        db.commit()

        # 3. Traffic Events (État du trafic)
        traffic = [
            TrafficDB(line_id="METRO-4", status="Delayed", message="Retard de 15 min (Panne signalisation)", location="Bardo"),
            TrafficDB(line_id="TGM", status="Normal", message="Trafic fluide", location="Ligne complète"),
            TrafficDB(line_id="BUS-20", status="Heavy", message="Embouteillage fort", location="Route X"),
        ]
        db.add_all(traffic)
        db.commit()

        # 4. Hubs (Correspondances)
        hubs = [
            HubDB(name="Place de Barcelone", connections="Metro 1, 2, 4, 5, 6 <-> Trains SNCFT <-> Bus"),
            HubDB(name="Tunis Marine", connections="TGM <-> Metro 1, 4 <-> Bus"),
            HubDB(name="Jardin Thameur", connections="Metro 2 <-> Bus Lignes Nord"),
        ]
        db.add_all(hubs)
        db.commit()
        
        print("--- DATA INJECTION COMPLETE ---")
    finally:
        db.close()
    yield

# --- 5. FastAPI App ---
app = FastAPI(
    title="Madina-Connect Mobility Service",
    description="Service de Mobilité Intelligente (Tunis) - REST API",
    version="3.1.0",
    lifespan=lifespan
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 6. ENDPOINTS (Functional Requirements) ---

# --- Requirement 1: Consultation des horaires ---
@app.get("/api/mobility/lines/{line_id}/schedule", response_model=List[ScheduleResponse], tags=["Horaires (Public)"])
def get_line_schedule(line_id: str, db: Session = Depends(get_db)):
    """
    Consulter les horaires pour une ligne donnée (Ex: TGM, METRO-4).
    """
    # Verify line exists first
    line = db.query(TransportLineDB).filter(TransportLineDB.line_id == line_id).first()
    if not line:
        raise HTTPException(status_code=404, detail="Ligne introuvable")
    
    schedules = db.query(ScheduleDB).filter(ScheduleDB.line_id == line_id).all()
    return schedules

# --- Requirement 2: Suivi de l'état du trafic ---
@app.get("/api/mobility/traffic", response_model=List[TrafficResponse], tags=["Trafic Info (Public)"])
def get_traffic_status(db: Session = Depends(get_db)):
    """
    Suivre l'état du trafic (retards, annulations, perturbations).
    """
    return db.query(TrafficDB).all()

# --- Requirement 3: Correspondances ---
@app.get("/api/mobility/interconnect", response_model=List[HubResponse], tags=["Correspondances (Public)"])
def get_interconnections(db: Session = Depends(get_db)):
    """
    Informations sur les correspondances (Hubs principaux).
    """
    return db.query(HubDB).all()

# --- Admin / CRUD Endpoints ---

# --- CRUD Lines ---
@app.get("/api/mobility/lines", response_model=List[LineResponse], tags=["Admin - Lines"])
def get_lines(db: Session = Depends(get_db)):
    return db.query(TransportLineDB).all()

@app.post("/api/mobility/lines", response_model=LineResponse, tags=["Admin - Lines"])
def create_line(line: LineCreate, db: Session = Depends(get_db)):
    existing = db.query(TransportLineDB).filter(TransportLineDB.line_id == line.line_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Line exists")
    new_line = TransportLineDB(**line.dict())
    db.add(new_line)
    db.commit()
    db.refresh(new_line)
    return new_line

@app.delete("/api/mobility/lines/{line_id}", tags=["Admin - Lines"])
def delete_line(line_id: str, db: Session = Depends(get_db)):
    line = db.query(TransportLineDB).filter(TransportLineDB.line_id == line_id).first()
    if not line:
        raise HTTPException(status_code=404, detail="Line not found")
    db.delete(line)
    db.commit()
    return {"message": "Line deleted"}

# --- CRUD Schedules ---
@app.post("/api/mobility/schedules", response_model=ScheduleResponse, tags=["Admin - Schedules"])
def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    # Validate line exists
    line = db.query(TransportLineDB).filter(TransportLineDB.line_id == schedule.line_id).first()
    if not line:
        raise HTTPException(status_code=404, detail="Line not found")
    
    new_schedule = ScheduleDB(**schedule.dict())
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@app.delete("/api/mobility/schedules/{schedule_id}", tags=["Admin - Schedules"])
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(ScheduleDB).filter(ScheduleDB.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted"}

# --- CRUD Traffic ---
@app.post("/api/mobility/traffic", response_model=TrafficResponse, tags=["Admin - Traffic"])
def create_traffic_alert(traffic: TrafficCreate, db: Session = Depends(get_db)):
    new_traffic = TrafficDB(**traffic.dict())
    db.add(new_traffic)
    db.commit()
    db.refresh(new_traffic)
    return new_traffic

@app.delete("/api/mobility/traffic/{traffic_id}", tags=["Admin - Traffic"])
def delete_traffic_alert(traffic_id: int, db: Session = Depends(get_db)):
    traffic = db.query(TrafficDB).filter(TrafficDB.id == traffic_id).first()
    if not traffic:
        raise HTTPException(status_code=404, detail="Traffic alert not found")
    db.delete(traffic)
    db.commit()
    return {"message": "Traffic alert deleted"}

# --- CRUD Hubs ---
@app.post("/api/mobility/hubs", response_model=HubResponse, tags=["Admin - Hubs"])
def create_hub(hub: HubCreate, db: Session = Depends(get_db)):
    new_hub = HubDB(**hub.dict())
    db.add(new_hub)
    db.commit()
    db.refresh(new_hub)
    return new_hub

@app.delete("/api/mobility/hubs/{hub_id}", tags=["Admin - Hubs"])
def delete_hub(hub_id: int, db: Session = Depends(get_db)):
    hub = db.query(HubDB).filter(HubDB.id == hub_id).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    db.delete(hub)
    db.commit()
    return {"message": "Hub deleted"}


# --- Main Entry Point ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)