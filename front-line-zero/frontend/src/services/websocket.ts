import { EventEmitter } from 'events';

// Types for our real-time data
export interface DroneUpdate {
  id: string;
  name: string;
  position: [number, number];
  status: 'active' | 'returning' | 'charging' | 'emergency';
  battery: number;
  currentMission?: string;
  lastUpdate: string;
}

export interface RiskUpdate {
  areaId: string;
  name: string;
  riskLevel: number;
  trend: 'increasing' | 'decreasing' | 'stable'; // Add trend property
  timestamp: string;
  requiresInspection: boolean;
}

export interface SystemUpdate {
  type: 'DRONE_UPDATE' | 'RISK_UPDATE' | 'ALERT' | 'SYSTEM_STATUS';
  data: any;
  timestamp: string;
}

class WebSocketService extends EventEmitter {
  // ... (existing code remains the same)

  private handleUpdate(update: SystemUpdate) {
    switch (update.type) {
      case 'DRONE_UPDATE':
        this.emit('droneUpdate', update.data);
        break;
      case 'RISK_UPDATE':
        this.emit('riskUpdate', update.data as RiskUpdate); // Emit risk update
        break;
      case 'ALERT':
        this.emit('alert', update.data);
        break;
      case 'SYSTEM_STATUS':
        this.emit('systemStatus', update.data);
        break;
      default:
        console.warn('Unknown update type:', update.type);
    }
  }

  // ... (existing code remains the same)
}

// Create a singleton instance
export const wsService = new WebSocketService();
export default wsService;