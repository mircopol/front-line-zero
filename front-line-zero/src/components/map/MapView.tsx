import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Drone } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
// Create a custom drone icon
const createDroneIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-drone'%3E%3Cpath d='M12 22a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9zM12 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z'/%3E%3C/svg%3E`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Types
interface DroneData {
  id: string;
  name: string;
  position: [number, number];
  status: string;
  battery: number;
}

interface RiskArea {
  name: string;
  position: [number, number];
  riskLevel: number;
  radius: number;
}

const MapView: React.FC = () => {
  // Mock data - replace with real data from API
  const mockDrones: DroneData[] = [
    {
      id: "1",
      name: "Drone Fundão-1",
      position: [40.1397, -7.5006],
      status: "patrolling",
      battery: 85
    },
    {
      id: "2",
      name: "Drone Castelo Novo-1",
      position: [40.0789, -7.4947],
      status: "returning",
      battery: 45
    }
  ];

  const mockRiskAreas: RiskArea[] = [
    {
      name: "Fundão",
      position: [40.1397, -7.5006],
      riskLevel: 0.7,
      radius: 1000 // meters
    },
    {
      name: "Castelo Novo",
      position: [40.0789, -7.4947],
      riskLevel: 0.3,
      radius: 1000 // meters
    }
  ];

  const getRiskColor = (riskLevel: number): string => {
    if (riskLevel >= 0.7) return '#ef4444';     // High risk - red
    if (riskLevel >= 0.4) return '#f97316';     // Medium risk - orange
    return '#22c55e';                           // Low risk - green
  };

  const getDroneStatusColor = (status: string): string => {
    switch (status) {
      case 'patrolling': return '#22c55e';
      case 'returning': return '#f97316';
      case 'emergency': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[40.1093, -7.4977]} // Center between Fundão and Castelo Novo
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Risk Areas */}
        {mockRiskAreas.map((area) => (
          <Circle
            key={area.name}
            center={area.position}
            radius={area.radius}
            pathOptions={{
              color: getRiskColor(area.riskLevel),
              fillColor: getRiskColor(area.riskLevel),
              fillOpacity: 0.2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{area.name}</h3>
                <p>Risk Level: {(area.riskLevel * 100).toFixed(0)}%</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Render Drones */}
        {mockDrones.map((drone) => (
          <Marker
            key={drone.id}
            position={drone.position}
            icon={createDroneIcon(getDroneStatusColor(drone.status))}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{drone.name}</h3>
                <p>Status: {drone.status}</p>
                <p>Battery: {drone.battery}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;