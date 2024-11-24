import React from 'react';
import { 
  Gauge, 
  Thermometer, 
  Wind, 
  Timer, 
  Navigation, 
  BarChart2,
  ArrowUp
} from 'lucide-react';
import DroneMetricsChart from './DroneMetricsChart';

interface DroneMetrics {
  id: string;
  altitude: number;      // meters
  speed: number;         // km/h
  temperature: number;   // Celsius
  windSpeed: number;     // km/h
  flightTime: number;    // minutes
  heading: number;       // degrees
  distanceFlown: number; // kilometers
}

interface DroneMetricsProps {
  droneId: string;
  isExpanded?: boolean;
}

const DroneMetrics: React.FC<DroneMetricsProps> = ({ droneId, isExpanded = true }) => {
  // Mock data - will be replaced with real-time data
  const metrics: DroneMetrics = {
    id: droneId,
    altitude: 120,
    speed: 35,
    temperature: 24,
    windSpeed: 15,
    flightTime: 45,
    heading: 275,
    distanceFlown: 12.5
  };

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    unit, 
    warning?: boolean 
  }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg
      ${warning ? 'bg-red-50' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        <Icon size={18} className={warning ? 'text-red-500' : 'text-gray-600'} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className={`font-medium ${warning ? 'text-red-600' : 'text-gray-800'}`}>
        {value} {unit}
      </div>
    </div>
  );

  if (!isExpanded) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        <MetricCard
          icon={ArrowUp}
          label="ALT"
          value={metrics.altitude}
          unit="m"
          warning={metrics.altitude > 150}
        />
        <MetricCard
          icon={Gauge}
          label="SPD"
          value={metrics.speed}
          unit="km/h"
          warning={metrics.speed > 40}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2 border-t border-gray-200">
      <h4 className="font-medium text-gray-700 px-2">Real-time Metrics</h4>
      
      <div className="grid gap-2">
        {/* Altitude */}
        <MetricCard
          icon={ArrowUp}
          label="Altitude"
          value={metrics.altitude}
          unit="m"
          warning={metrics.altitude > 150}
        />

        {/* Speed */}
        <MetricCard
          icon={Gauge}
          label="Speed"
          value={metrics.speed}
          unit="km/h"
          warning={metrics.speed > 40}
        />

        {/* Temperature */}
        <MetricCard
          icon={Thermometer}
          label="Temperature"
          value={metrics.temperature}
          unit="°C"
          warning={metrics.temperature > 35}
        />

        {/* Wind Speed */}
        <MetricCard
          icon={Wind}
          label="Wind Speed"
          value={metrics.windSpeed}
          unit="km/h"
          warning={metrics.windSpeed > 25}
        />

        {/* Flight Time */}
        <MetricCard
          icon={Timer}
          label="Flight Time"
          value={metrics.flightTime}
          unit="min"
        />

        {/* Heading */}
        <MetricCard
          icon={Navigation}
          label="Heading"
          value={metrics.heading}
          unit="°"
        />

        {/* Distance Flown */}
        <MetricCard
          icon={BarChart2}
          label="Distance Flown"
          value={metrics.distanceFlown}
          unit="km"
        />
      </div>

      {/* Metrics Chart */}
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 px-2 mb-2">Performance History</h4>
        <DroneMetricsChart droneId={droneId} />
      </div>
    </div>
  );
};

export default DroneMetrics;