from fastapi import FastAPI, HTTPException, WebSocket, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from datetime import datetime
import asyncio
import json
from pydantic import BaseModel, Field
from .core.config import FLZConfig
from .core.risk_analyzer import RiskAnalyzer
from .flz_drones.eagle_nests_network import EagleNestsNetwork, DroneStatus

# API models
class AreaRisk(BaseModel):
    area_name: str
    risk_level: float
    alert_level: str
    timestamp: datetime
    requires_inspection: bool
    coordinates: tuple[float, float]

class DroneInfo(BaseModel):
    id: str
    name: str
    status: str
    battery_level: int
    current_coords: tuple[float, float]
    current_mission: Optional[str]

class MissionInfo(BaseModel):
    id: str
    area: str
    priority: str
    status: str
    drone_id: Optional[str]
    target_coords: tuple[float, float]

# Initialize FastAPI app
app = FastAPI(
    title="Front Line Zero API",
    description="API for Front Line Zero early warning and monitoring system",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP - should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
API_KEY_HEADER = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key_header: str = Security(API_KEY_HEADER)):
    if api_key_header != "YOUR_API_KEY":  # Replace with secure key management
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key_header

# Initialize components
risk_analyzer = RiskAnalyzer()
eagle_nests = EagleNestsNetwork()

# Active WebSocket connections
active_connections: List[WebSocket] = []

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                await self.disconnect(connection)

manager = ConnectionManager()

# Background task for status updates
async def periodic_status_update():
    while True:
        status_update = {
            "timestamp": datetime.now().isoformat(),
            "fleet_status": eagle_nests.get_fleet_status(),
            "high_risk_areas": risk_analyzer.get_high_risk_areas()
        }
        await manager.broadcast(status_update)
        await asyncio.sleep(FLZConfig.ALERT_REFRESH_RATE)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_status_update())

# REST Endpoints

@app.get("/areas", response_model=List[str])
async def get_monitored_areas(api_key: str = Depends(get_api_key)):
    """Get list of all monitored areas"""
    return list(FLZConfig.MONITORED_AREAS.keys())

@app.get("/areas/{area_name}/risk", response_model=AreaRisk)
async def get_area_risk(area_name: str, api_key: str = Depends(get_api_key)):
    """Get current risk assessment for specific area"""
    try:
        assessment = risk_analyzer.analyze_area(area_name)
        return AreaRisk(
            area_name=assessment.area_name,
            risk_level=assessment.total_risk_level,
            alert_level=assessment.alert_level,
            timestamp=assessment.timestamp,
            requires_inspection=assessment.requires_drone_inspection,
            coordinates=assessment.coordinates
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/drones", response_model=List[DroneInfo])
async def get_drone_fleet(api_key: str = Depends(get_api_key)):
    """Get status of all drones"""
    fleet_status = eagle_nests.get_fleet_status()
    return [
        DroneInfo(
            id=drone_id,
            name=info["name"],
            status=info["status"],
            battery_level=info["battery"],
            current_coords=info["coords"],
            current_mission=info["mission"]
        )
        for drone_id, info in fleet_status["drones"].items()
    ]

@app.get("/missions/active", response_model=List[MissionInfo])
async def get_active_missions(api_key: str = Depends(get_api_key)):
    """Get all active missions"""
    fleet_status = eagle_nests.get_fleet_status()
    return [
        MissionInfo(
            id=mission_id,
            area=info["area"],
            priority=info["priority"],
            status=info["status"],
            drone_id=info["drone"],
            target_coords=risk_analyzer.area_manager.areas[info["area"]].center_coords
        )
        for mission_id, info in fleet_status["active_missions"].items()
    ]

@app.post("/drones/{drone_id}/recall")
async def recall_drone(drone_id: str, api_key: str = Depends(get_api_key)):
    """Emergency recall of a specific drone"""
    try:
        drone = eagle_nests.drones[drone_id]
        eagle_nests.update_drone_status(
            drone_id,
            DroneStatus.RETURNING,
            drone.battery_level,
            drone.current_coords
        )
        return {"status": "success", "message": f"Drone {drone_id} recalled"}
    except KeyError:
        raise HTTPException(status_code=404, detail="Drone not found")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any incoming WebSocket messages
            # Currently just echo for testing
            await websocket.send_json({"message": "received", "data": data})
    except:
        manager.disconnect(websocket)