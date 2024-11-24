import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, type LatLngExpression } from 'leaflet';
import { useWebSocket } from '../../hooks/useWebSocket';
import { AlertTriangle, Battery, Wifi } from 'lucide-react';

// Define types for our data
interface DroneData {
  id: string;
  name: string;
  position: [number, number];
  status: 'active' | 'returning' | 'charging' | 'emergency';
  battery: number;
  currentMission?: string;
  lastUpdate: string;
}

interface RiskArea {
  id: string;
  name: string;
  position: [number, number];
  riskLevel: number;
  radius: number;
  lastUpdate: string;
}

// Create custom drone icon using SVG
const createDroneIcon = (status: DroneData['status']) => {
  const getColorByStatus = (status: DroneData['status']) => {
    switch (status) {
      case 'active': return '#22c55e';     // green
      case 'returning': return '#f97316';   // orange
      case 'charging': return '#3b82f6';    // blue
      case 'emergency': return '#ef4444';   // red
      default: return '#71717a';           // gray
    }
  };

  return new Icon({
    iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='32' height='32'%3E%3Cpath fill='${getColorByStatus(status).replace('#', '%23')}' d='M22.835 8.165a4.726 4.726 0 0 0-6.64-6.64l-2.195 2.195a4.726 4.726 0 0 0-6.64 6.64l2.195 2.195a4.726 4.726 0 0 0 6.64 6.64l2.195-2.195a4.726 4.726 0 0 0 6.64-6.64l-2.195-2.195zm-3.32 3.32a2.363 2.363 0 0 1-3.32 0l-2.195-2.195a2.363 2.363 0 0 1 0-3.32l2.195-2.195a2.363 2.363 0 0 1 3.32 3.32l-2.195 2.195a2.363 2.363 0 0 1 0 3.32l2.195 2.195z'/%3E%3C/svg%3E`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const MapView: React.FC = () => {
  const { connected, drones, riskAreas, error } = useWebSocket();

  // If no real-time data, use mock data
  const mockDrones: DroneData[] = [
    {
      id: "drone-1",
      name: "Eagle-1 Fundão",
      position: [40.1397, -7.5006],
      status: "active",
      battery: 85,
      currentMission: "Patrol sector A",
      lastUpdate: new Date().toISOString()
    },
    {
      id: "drone-2",
      name: "Eagle-2 Castelo Novo",
      position: [40.0789, -7.4947],
      status: "returning",
      battery: 25,
      lastUpdate: new Date().toISOString()
    }
  ];

  const mockRiskAreas: RiskArea[] = [
    {
      id: "area-1",
      name: "Fundão",
      position: [40.1397, -7.5006],
      riskLevel: 0.75,
      radius: 1000,
      lastUpdate: new Date().toISOString()
    },
    {
      id: "area-2",
      name: "Castelo Novo",
      position: [40.0789, -7.4947],
      riskLevel: 0.35,
      radius: 1000,
      lastUpdate: new Date().toISOString()
    }
  ];

  const activeDrones = drones.length > 0 ? drones : mockDrones;
  const activeRiskAreas = riskAreas.length > 0 ? riskAreas : mockRiskAreas;

  const centerPosition: LatLngExpression = [40.1093, -7.4977]; // Between Fundão and Castelo Novo

  const getRiskColor = (riskLevel: number): string => {
    if (riskLevel >= 0.7) return '#ef4444';     // High risk - red
    if (riskLevel >= 0.4) return '#f97316';     // Medium risk - orange
    return '#22c55e';                           // Low risk - green
  };

  const getBatteryColor = (level: number): string => {
    if (level <= 20) return '#ef4444';     // Critical - red
    if (level <= 50) return '#f97316';     // Low - orange
    return '#22c55e';                      // Good - green
  };

  // Connection status component
  const ConnectionStatus = () => (
    <div className={`absolute top-4 right-4 z-[400] px-3 py-1.5 rounded-full 
      ${connected ? 'bg-green-500' : 'bg-red-500'} 
      text-white text-sm font-medium shadow-lg flex items-center gap-2`}
    >
      <Wifi size={16} />
      {connected ? 'Connected' : 'Disconnected'}
    </div>
  );

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <ConnectionStatus />
      
      {error && (
        <div className="absolute top-4 left-4 z-[400] px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium shadow-lg flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <MapContainer
        center={centerPosition}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Risk Areas */}
        {activeRiskAreas.map((area) => (
          <Circle
            key={area.id}
            center={area.position}
            radius={area.radius}
            pathOptions={{
              color: getRiskColor(area.riskLevel),
              fillColor: getRiskColor(area.riskLevel),
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Tooltip permanent direction="center" className="bg-transparent border-0 shadow-none">
              <div className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${
                area.riskLevel >= 0.7 ? 'bg-red-500' :
                area.riskLevel >= 0.4 ? 'bg-orange-500' : 'bg-green-500'
              }`}>
                {area.name}
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{area.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex items-center justify-between">
                    Risk Level: 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-white ${
                      area.riskLevel >= 0.7 ? 'bg-red-500' :
                      area.riskLevel >= 0.4 ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {(area.riskLevel * 100).toFixed(0)}%
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Monitoring radius: {(area.radius / 1000).toFixed(1)}km
                  </p>
                  <p className="text-sm text-gray-600">
                    Last update: {new Date(area.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Render Drones */}
        {activeDrones.map((drone) => (
          <Marker
            key={drone.id}
            position={drone.position}
            icon={createDroneIcon(drone.status)}
          >
            <Tooltip 
              permanent
              direction="top"
              className="bg-transparent border-0 shadow-none"
              offset={[0, -20]}
            >
              <div className={`px-2 py-0.5 rounded-full text-white text-xs font-medium flex items-center gap-1 ${
                drone.status === 'emergency' ? 'bg-red-500' :
                drone.status === 'returning' ? 'bg-orange-500' :
                drone.status === 'charging' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {drone.name}
                <Battery size={12} className={drone.battery <= 20 ? 'animate-pulse' : ''} />
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{drone.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex items-center justify-between">
                    Status: 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-white ${
                      drone.status === 'active' ? 'bg-green-500' :
                      drone.status === 'returning' ? 'bg-orange-500' :
                      drone.status === 'emergency' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {drone.status.charAt(0).toUpperCase() + drone.status.slice(1)}
                    </span>
                  </p>
                  <p className="text-sm flex items-center justify-between">
                    Battery: 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-white ${
                      drone.battery > 50 ? 'bg-green-500' :
                      drone.battery > 20 ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      {drone.battery}%
                    </span>
                  </p>
                  {drone.currentMission && (
                    <p className="text-sm text-gray-600">
                      Mission: {drone.currentMission}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Last update: {new Date(drone.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;