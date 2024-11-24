import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { 
  ChevronRight, 
  ChevronLeft, 
  Battery, 
  Wifi, 
  AlertTriangle,
  RefreshCw,
  Power
} from 'lucide-react';
import DroneMetrics from './DroneMetrics';

interface DroneStatus {
  id: string;
  name: string;
  status: 'active' | 'returning' | 'charging' | 'emergency';
  battery: number;
  currentMission?: string;
  lastUpdate: string;
  signal: number; // Signal strength in percentage
}

const DroneStatusPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const { connected, drones } = useWebSocket();

  // Mock data - will be replaced with real WebSocket data
  const mockDrones: DroneStatus[] = [
    {
      id: "drone-1",
      name: "Eagle-1 Fundão",
      status: "active",
      battery: 85,
      currentMission: "Patrol sector A",
      lastUpdate: new Date().toISOString(),
      signal: 92
    },
    {
      id: "drone-2",
      name: "Eagle-2 Castelo Novo",
      status: "returning",
      battery: 25,
      lastUpdate: new Date().toISOString(),
      signal: 78
    }
  ];

  const activeDrones = drones.length > 0 ? drones : mockDrones;

  const getStatusColor = (status: DroneStatus['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'returning': return 'bg-orange-500';
      case 'charging': return 'bg-blue-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-red-500';
    if (level <= 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getSignalStrength = (signal: number) => {
    if (signal >= 80) return 'text-green-500';
    if (signal >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleRecallDrone = (droneId: string) => {
    console.log(`Recalling drone: ${droneId}`);
    // Will be implemented with WebSocket
  };

  const handleEmergencyLand = (droneId: string) => {
    console.log(`Emergency landing drone: ${droneId}`);
    // Will be implemented with WebSocket
  };

  return (
    <div
      className={`absolute top-4 right-4 z-[500] bg-white rounded-lg shadow-xl 
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-80' : 'w-12'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-indigo-600 rounded-t-lg text-white">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Drone Fleet Status</h3>
            <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full">
              {activeDrones.length} Active
            </span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
        >
          {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Connection Status */}
      {isExpanded && (
        <div className={`flex items-center gap-2 p-2 text-sm
          ${connected ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
        >
          <Wifi size={16} />
          <span className="font-medium">
            {connected ? 'Connected to Fleet Network' : 'Connection Lost'}
          </span>
          {!connected && (
            <button 
              className="ml-auto p-1 hover:bg-red-100 rounded-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      )}

      {/* Drone List */}
      {isExpanded && (
        <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeDrones.map(drone => (
            <div
              key={drone.id}
              className={`bg-gray-50 rounded-lg p-3 space-y-2 border transition-colors
                ${drone.id === selectedDroneId ? 'border-indigo-300' : 'border-gray-200'}
                hover:border-indigo-300 cursor-pointer`}
              onClick={() => setSelectedDroneId(drone.id === selectedDroneId ? null : drone.id)}
            >
              {/* Drone Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(drone.status)}`} />
                  <span className="font-medium">{drone.name}</span>
                </div>
                {drone.battery <= 20 && (
                  <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                )}
              </div>

              {/* Drone Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Battery className={getBatteryColor(drone.battery)} size={16} />
                  <span>{drone.battery}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className={getSignalStrength(drone.signal)} size={16} />
                  <span>{drone.signal}%</span>
                </div>
              </div>

              {/* Mission Status */}
              {drone.currentMission && (
                <div className="text-sm text-gray-600">
                  {drone.currentMission}
                </div>
              )}

              {/* Quick Actions */}
              {drone.id === selectedDroneId && (
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecallDrone(drone.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                      bg-orange-100 hover:bg-orange-200 text-orange-700 
                      rounded-md text-sm font-medium transition-colors"
                  >
                    <RefreshCw size={14} />
                    Recall
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmergencyLand(drone.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                      bg-red-100 hover:bg-red-200 text-red-700 
                      rounded-md text-sm font-medium transition-colors"
                  >
                    <Power size={14} />
                    Emergency
                  </button>
                </div>
              )}

              {/* Metrics */}
              {drone.id === selectedDroneId && (
                <DroneMetrics droneId={drone.id} />
              )}

              {/* Last Update */}
              <div className="text-xs text-gray-500">
                Last update: {new Date(drone.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {isExpanded && activeDrones.length > 0 && (
        <div className="p-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="bg-gray-50 p-2 rounded">
              Active Missions: {activeDrones.filter(d => d.status === 'active').length}
            </div>
            <div className="bg-gray-50 p-2 rounded">
              Critical Battery: {activeDrones.filter(d => d.battery <= 20).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneStatusPanel;