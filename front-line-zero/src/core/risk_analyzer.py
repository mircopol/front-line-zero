from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from .config import FLZConfig
from .area_manager import AreaManager, MonitoredArea

@dataclass
class RiskFactor:
    name: str
    value: float
    weight: float
    timestamp: datetime
    source: str  # 'satellite' or 'drone'

@dataclass
class RiskAssessment:
    area_name: str
    total_risk_level: float
    risk_factors: List[RiskFactor]
    timestamp: datetime
    alert_level: str
    requires_drone_inspection: bool
    coordinates: Tuple[float, float]

class RiskAnalyzer:
    def __init__(self):
        self.area_manager = AreaManager()
        self.risk_history: Dict[str, List[RiskAssessment]] = {}
        self.risk_thresholds = FLZConfig.RISK_LEVELS
        
    def analyze_area(self, area_name: str) -> RiskAssessment:
        """
        Analyze risk for a specific area using satellite and drone data
        """
        area = self.area_manager.areas.get(area_name.lower())
        if not area:
            raise ValueError(f"Area {area_name} not found")
            
        # Get latest satellite data
        satellite_data = self.area_manager.get_mock_satellite_data(area_name)
        
        # Calculate risk factors
        risk_factors = [
            self._calculate_temperature_risk(satellite_data),
            self._calculate_vegetation_risk(satellite_data),
            self._calculate_historical_risk(area_name)
        ]
        
        # Calculate total risk
        total_risk = self._calculate_total_risk(risk_factors)
        
        # Determine alert level
        alert_level = self._determine_alert_level(total_risk)
        
        # Create risk assessment
        assessment = RiskAssessment(
            area_name=area.name,
            total_risk_level=total_risk,
            risk_factors=risk_factors,
            timestamp=datetime.now(),
            alert_level=alert_level,
            requires_drone_inspection=total_risk > FLZConfig.MONITORED_AREAS[area_name.lower()].risk_threshold,
            coordinates=area.center_coords
        )
        
        # Update history
        self._update_risk_history(area_name, assessment)
        
        return assessment
    
    def _calculate_temperature_risk(self, satellite_data: Dict) -> RiskFactor:
        """Calculate risk based on surface temperature"""
        temp_data = satellite_data['surface_temp']
        max_temp = np.max(temp_data)
        avg_temp = np.mean(temp_data)
        
        # Higher weight for maximum temperature
        max_temp_risk = (max_temp - 15) / (50 - 15)  # Normalize between 15°C and 50°C
        avg_temp_risk = (avg_temp - 15) / (50 - 15)
        
        temp_risk = (max_temp_risk * 0.7 + avg_temp_risk * 0.3)
        
        return RiskFactor(
            name="temperature",
            value=float(temp_risk),
            weight=0.4,
            timestamp=datetime.now(),
            source="satellite"
        )
    
    def _calculate_vegetation_risk(self, satellite_data: Dict) -> RiskFactor:
        """Calculate risk based on vegetation health (NDVI)"""
        ndvi_data = satellite_data['ndvi']
        avg_ndvi = np.mean(ndvi_data)
        
        # Lower NDVI means higher risk (drier vegetation)
        vegetation_risk = 1 - avg_ndvi
        
        return RiskFactor(
            name="vegetation",
            value=float(vegetation_risk),
            weight=0.3,
            timestamp=datetime.now(),
            source="satellite"
        )
    
    def _calculate_historical_risk(self, area_name: str) -> RiskFactor:
        """Calculate risk based on historical data"""
        if area_name not in self.risk_history:
            historical_risk = 0.0
        else:
            recent_assessments = [
                assessment.total_risk_level 
                for assessment in self.risk_history[area_name][-5:]  # Last 5 assessments
            ]
            historical_risk = np.mean(recent_assessments) if recent_assessments else 0.0
        
        return RiskFactor(
            name="historical",
            value=float(historical_risk),
            weight=0.3,
            timestamp=datetime.now(),
            source="historical"
        )
    
    def _calculate_total_risk(self, risk_factors: List[RiskFactor]) -> float:
        """Calculate total risk level from all factors"""
        weighted_risks = [
            factor.value * factor.weight 
            for factor in risk_factors
        ]
        return min(sum(weighted_risks), 1.0)
    
    def _determine_alert_level(self, risk_level: float) -> str:
        """Determine alert level based on risk level"""
        if risk_level >= self.risk_thresholds["CRITICAL"]:
            return "CRITICAL"
        elif risk_level >= self.risk_thresholds["HIGH"]:
            return "HIGH"
        elif risk_level >= self.risk_thresholds["MEDIUM"]:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _update_risk_history(self, area_name: str, assessment: RiskAssessment):
        """Update risk history for an area"""
        if area_name not in self.risk_history:
            self.risk_history[area_name] = []
            
        self.risk_history[area_name].append(assessment)
        
        # Keep only last 7 days of assessments
        cutoff_date = datetime.now() - timedelta(days=FLZConfig.ALERT_HISTORY_DAYS)
        self.risk_history[area_name] = [
            assessment for assessment in self.risk_history[area_name]
            if assessment.timestamp > cutoff_date
        ]
    
    def get_high_risk_areas(self) -> List[Tuple[str, float]]:
        """Get list of areas with risk level above HIGH threshold"""
        high_risk_areas = []
        for area_name in self.area_manager.areas.keys():
            assessment = self.analyze_area(area_name)
            if assessment.total_risk_level >= self.risk_thresholds["HIGH"]:
                high_risk_areas.append((area_name, assessment.total_risk_level))
        return sorted(high_risk_areas, key=lambda x: x[1], reverse=True)