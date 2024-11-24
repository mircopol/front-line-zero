from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from typing import List, Dict
import asyncio

app = FastAPI()

# Manage WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict):
        for connection in self.active_connections:
            if connection.application_state == WebSocketState.CONNECTED:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/risk-updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(10)  # Keep the connection alive.
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Simulate real-time risk updates
@app.on_event("startup")
async def simulate_risk_updates():
    while True:
        # Simulated risk update message
        risk_update = {
            "area_id": "A1",
            "risk_level": "High",
            "timestamp": "2024-11-24T12:00:00Z"
        }
        await manager.broadcast(risk_update)
        await asyncio.sleep(15)  # Frequency of updates
