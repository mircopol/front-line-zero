from enum import Enum
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
from .config import FLZConfig
from .risk_analyzer import RiskAssessment

class DroneStatus(Enum):
    IDLE = "idle"
    LAUNCHING = "launching"
    ON_MISSION = "on_mission"
    RETURNING = "returning"
    CHARGING = "charging"
    MAINTENANCE = "maintenance"

class MissionPriority(Enum):
    LOW = 0
    MEDIUM = 1
    HIGH = 2
    CRITICAL = 3

@dataclass
class DroneSpecs:
    model: str
    max_flight_time: int  # minutes
    max_range: float      # kilometers
    cruise_speed: float   # meters/second
    min_battery: int      # percentage
    camera_types: List[str]
    
@dataclass
class Mission:
    id: str
    target_area: str
    priority: MissionPriority
    start_time: datetime
    estimated_duration: int  # minutes
    target_coords: Tuple[float, float]
    status: str
    drone_id: Optional[str] = None
    completion_time: Optional[datetime] = None
    
@dataclass
class Drone:
    id: str
    name: str
    specs: DroneSpecs
    status: DroneStatus
    battery_level: int
    current_coords: Tuple[float, float]
    home_nest: str
    current_mission_id: Optional[str] = None
    last_maintenance: datetime = datetime.now()

class EagleNestsNetwork:
    def __init__(self):
        self.drones: Dict[str, Drone] = {}
        self.missions: Dict[str, Mission] = {}
        self.nests: Dict[str, Tuple[float, float]] = {
            "fundao_nest": (40.1397, -7.5006),
            "castelo_novo_nest": (40.0789, -7.4947)
        }
        self._initialize_fleet()
    
    def _initialize_fleet(self):
        """Initialize the drone fleet with predefined drones"""
        drone_specs = {
            "sentinel": DroneSpecs(
                model="ENN-Sentinel-1",
                max_flight_time=45,
                max_range=10.0,
                cruise_speed=15.0,
                min_battery=20,
                camera_types=["RGB", "Thermal", "Multispectral"]
            ),
            "scout": DroneSpecs(
                model="ENN-Scout-1",
                max_flight_time=30,
                max_range=5.0,
                cruise_speed=20.0,
                min_battery=15,
                camera_types=["RGB", "Thermal"]
            )
        }
        
        # Initialize drones for each nest
        for nest_id, coords in self.nests.items():
            # Add a Sentinel drone
            sentinel_id = f"sentinel_{nest_id}"
            self.drones[sentinel_id] = Drone(
                id=sentinel_id,
                name=f"Sentinel-{nest_id.split('_')[0].title()}",
                specs=drone_specs["sentinel"],
                status=DroneStatus.IDLE,
                battery_level=100,
                current_coords=coords,
                home_nest=nest_id
            )
            
            # Add a Scout drone
            scout_id = f"scout_{nest_id}"
            self.drones[scout_id] = Drone(
                id=scout_id,
                name=f"Scout-{nest_id.split('_')[0].title()}",
                specs=drone_specs["scout"],
                status=DroneStatus.IDLE,
                battery_level=100,
                current_coords=coords,
                home_nest=nest_id
            )
    
    def create_mission(self, risk_assessment: RiskAssessment) -> Optional[str]:
        """Create a new mission based on risk assessment"""
        mission_id = f"mission_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Determine mission priority based on risk level
        priority = MissionPriority.LOW
        if risk_assessment.alert_level == "CRITICAL":
            priority = MissionPriority.CRITICAL
        elif risk_assessment.alert_level == "HIGH":
            priority = MissionPriority.HIGH
        elif risk_assessment.alert_level == "MEDIUM":
            priority = MissionPriority.MEDIUM
            
        # Create mission
        mission = Mission(
            id=mission_id,
            target_area=risk_assessment.area_name,
            priority=priority,
            start_time=datetime.now(),
            estimated_duration=30,  # Default 30 minutes
            target_coords=risk_assessment.coordinates,
            status="PENDING"
        )
        
        self.missions[mission_id] = mission
        self._assign_drone_to_mission(mission)
        return mission_id
    
    def _assign_drone_to_mission(self, mission: Mission):
        """Assign the most suitable drone to a mission"""
        best_drone = None
        min_distance = float('inf')
        
        for drone in self.drones.values():
            if self._is_drone_available(drone):
                distance = self._calculate_distance(
                    drone.current_coords, 
                    mission.target_coords
                )
                if distance < min_distance:
                    min_distance = distance
                    best_drone = drone
        
        if best_drone:
            best_drone.status = DroneStatus.LAUNCHING
            best_drone.current_mission_id = mission.id
            mission.drone_id = best_drone.id
            mission.status = "LAUNCHING"
            
    def _is_drone_available(self, drone: Drone) -> bool:
        """Check if drone is available for mission"""
        return (
            drone.status == DroneStatus.IDLE and
            drone.battery_level > drone.specs.min_battery and
            (datetime.now() - drone.last_maintenance).days < 7
        )
    
    def _calculate_distance(self, coord1: Tuple[float, float], 
                          coord2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates in kilometers"""
        # Simple Euclidean distance for MVP
        # TODO: Implement proper haversine formula
        lat1, lon1 = coord1
        lat2, lon2 = coord2
        return np.sqrt((lat2-lat1)**2 + (lon2-lon1)**2) * 111  # rough km conversion
    
    def update_drone_status(self, drone_id: str, 
                          new_status: DroneStatus, 
                          battery_level: int,
                          current_coords: Tuple[float, float]):
        """Update drone status, battery, and position"""
        if drone_id in self.drones:
            drone = self.drones[drone_id]
            drone.status = new_status
            drone.battery_level = battery_level
            drone.current_coords = current_coords
            
            # Update mission status if applicable
            if drone.current_mission_id:
                mission = self.missions[drone.current_mission_id]
                if new_status == DroneStatus.RETURNING:
                    mission.status = "COMPLETED"
                    mission.completion_time = datetime.now()
                    drone.current_mission_id = None
    
    def get_fleet_status(self) -> Dict:
        """Get current status of all drones and missions"""
        return {
            "drones": {
                drone_id: {
                    "name": drone.name,
                    "status": drone.status.value,
                    "battery": drone.battery_level,
                    "coords": drone.current_coords,
                    "mission": drone.current_mission_id
                }
                for drone_id, drone in self.drones.items()
            },
            "active_missions": {
                mission_id: {
                    "area": mission.target_area,
                    "priority": mission.priority.value,
                    "status": mission.status,
                    "drone": mission.drone_id
                }
                for mission_id, mission in self.missions.items()
                if mission.completion_time is None
            }
        }