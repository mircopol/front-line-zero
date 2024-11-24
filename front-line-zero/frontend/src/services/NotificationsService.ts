import { EventEmitter } from 'events';
import { wsService } from './websocket';

export interface Notification {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  droneId?: string;
  actionRequired?: boolean;
  source?: 'drone' | 'system' | 'risk';
}

class NotificationsService extends EventEmitter {
  private notifications: Notification[] = [];
  private maxNotifications = 50; // Maximum number of notifications to keep

  constructor() {
    super();
    this.initializeWebSocket();
    // Load persisted notifications from localStorage
    this.loadNotifications();
  }

  private initializeWebSocket() {
    wsService.on('droneUpdate', (update: any) => {
      // Handle drone-related notifications
      if (update.battery <= 20) {
        this.addNotification({
          type: 'emergency',
          title: 'Critical Battery Level',
          message: `Drone ${update.name} battery level at ${update.battery}%. Immediate action required.`,
          droneId: update.id,
          actionRequired: true,
          source: 'drone'
        });
      } else if (update.battery <= 30) {
        this.addNotification({
          type: 'warning',
          title: 'Low Battery Warning',
          message: `Drone ${update.name} battery level at ${update.battery}%.`,
          droneId: update.id,
          source: 'drone'
        });
      }
    });

    wsService.on('riskUpdate', (update: any) => {
      if (update.riskLevel >= 0.8) {
        this.addNotification({
          type: 'emergency',
          title: 'Critical Risk Level',
          message: `Area ${update.name} risk level critical at ${(update.riskLevel * 100).toFixed(0)}%.`,
          actionRequired: true,
          source: 'risk'
        });
      }
    });

    wsService.on('alert', (alert: any) => {
      this.addNotification({
        type: alert.severity,
        title: alert.title,
        message: alert.message,
        actionRequired: alert.actionRequired,
        source: 'system'
      });
    });
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
        this.emit('updated', this.getNotifications());
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);

    // Keep only the latest maxNotifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.saveNotifications();
    this.emit('updated', this.getNotifications());
    this.emit('new', newNotification);
  }

  public markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.emit('updated', this.getNotifications());
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
    this.emit('updated', this.getNotifications());
  }

  public removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.emit('updated', this.getNotifications());
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.emit('updated', this.getNotifications());
  }

  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public filterNotifications(options: {
    type?: Notification['type'],
    read?: boolean,
    source?: Notification['source']
  }): Notification[] {
    return this.notifications.filter(notification => {
      if (options.type && notification.type !== options.type) return false;
      if (options.read !== undefined && notification.read !== options.read) return false;
      if (options.source && notification.source !== options.source) return false;
      return true;
    });
  }
}

// Create a singleton instance
export const notificationsService = new NotificationsService();
export default notificationsService;