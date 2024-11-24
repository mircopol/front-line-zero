import { useState, useEffect } from 'react';
import wsService, { DroneUpdate, RiskUpdate } from '../services/WebSocketService';

interface WebSocketData {
  drones: DroneUpdate[];
  risks: RiskUpdate[];
  alerts: string[];
  systemStatus: string;
}

const useWebSocket = () => {
  const [data, setData] = useState<WebSocketData>({
    drones: [],
    risks: [],
    alerts: [],
    systemStatus: '',
  });

  useEffect(() => {
    // Event listeners
    const handleDroneUpdate = (update: DroneUpdate) => {
      setData((prevData) => ({
        ...prevData,
        drones: [...prevData.drones, update],
      }));
    };

    const handleRiskUpdate = (update: RiskUpdate) => {
      setData((prevData) => ({
        ...prevData,
        risks: [...prevData.risks, update],
      }));
    };

    const handleAlert = (alert: string) => {
      setData((prevData) => ({
        ...prevData,
        alerts: [...prevData.alerts, alert],
      }));
    };

    const handleSystemStatus = (status: string) => {
      setData((prevData) => ({
        ...prevData,
        systemStatus: status,
      }));
    };

    // Register event listeners
    wsService.on('droneUpdate', handleDroneUpdate);
    wsService.on('riskUpdate', handleRiskUpdate);
    wsService.on('alert', handleAlert);
    wsService.on('systemStatus', handleSystemStatus);

    // Clean up event listeners on unmount
    return () => {
      wsService.off('droneUpdate', handleDroneUpdate);
      wsService.off('riskUpdate', handleRiskUpdate);
      wsService.off('alert', handleAlert);
      wsService.off('systemStatus', handleSystemStatus);
    };
  }, []);

  return data;
};

export default useWebSocket;