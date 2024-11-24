from pathlib import Path
from typing import Dict
import os
from dataclasses import dataclass

@dataclass
class AreaConfig:
    name: str
    latitude: float
    longitude: float
    radius_km: float
    risk_threshold: float

class FLZConfig:
    # Project Paths
    PROJECT_ROOT = Path(__file__).parent.parent.parent
    DATA_DIR = PROJECT_ROOT / "data"
    MOCK_DATA_DIR = DATA_DIR / "mock"
    PROCESSED_DATA_DIR = DATA_DIR / "processed"

    # System Configuration
    VERSION = "0.1.0"
    SYSTEM_NAME = "Front Line Zero"
    
    # API Configuration
    API_VERSION = "v1"
    DEFAULT_API_PORT = 8000
    WEBSOCKET_PORT = 8001
    
    # Monitoring Areas
    MONITORED_AREAS = {
        "fundao": AreaConfig(
            name="Fundão",
            latitude=40.1397,
            longitude=-7.5006,
            radius_km=5.0,
            risk_threshold=0.7
        ),
        "castelo_novo": AreaConfig(
            name="Castelo Novo",
            latitude=40.0789,
            longitude=-7.4947,
            radius_km=5.0,
            risk_threshold=0.7
        )
    }
    
    # Sentinel Data Configuration
    SENTINEL_BANDS = ['B02', 'B03', 'B04', 'B08']  # RGB + NIR
    SENTINEL_RESOLUTION = 10  # meters
    
    # Drone Configuration
    DRONE_MAX_FLIGHT_TIME_MINUTES = 30
    DRONE_SPEED_MS = 15  # meters per second
    DRONE_MIN_ALTITUDE = 30  # meters
    DRONE_MAX_ALTITUDE = 120  # meters
    
    # Risk Assessment
    RISK_LEVELS = {
        "LOW": 0.3,
        "MEDIUM": 0.6,
        "HIGH": 0.8,
        "CRITICAL": 0.9
    }
    
    # Alert Configuration
    ALERT_REFRESH_RATE = 30  # seconds
    ALERT_HISTORY_DAYS = 7
    
    @classmethod
    def get_area_configs(cls) -> Dict[str, AreaConfig]:
        return cls.MONITORED_AREAS
    
    @classmethod
    def create_required_directories(cls):
        """Create necessary directories if they don't exist"""
        directories = [
            cls.DATA_DIR,
            cls.MOCK_DATA_DIR,
            cls.PROCESSED_DATA_DIR,
            cls.MOCK_DATA_DIR / "sentinel_samples",
            cls.MOCK_DATA_DIR / "drone_samples"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def load_env_variables(cls):
        """Load environment variables or use defaults"""
        cls.API_PORT = int(os.getenv('FLZ_API_PORT', cls.DEFAULT_API_PORT))
        cls.DEBUG_MODE = os.getenv('FLZ_DEBUG', 'False').lower() == 'true'
        # Add more environment variables as needed

# Initialize required directories when config is imported
FLZConfig.create_required_directories()