import React, { useState } from 'react';
import MapView from '../map/MapView';
import DroneStatusPanel from '../status/DroneStatusPanel';
import NotificationsPanel from '../notifications/NotificationsPanel';
import AreaRiskBreakdown from '../risk/AreaRiskBreakdown';

// Icons
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  Map, 
  Drone, 
  AlertTriangle, 
  BarChart2 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  // Notification count - replace with real data later
  const notificationCount = 3;

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Monitoring Dashboard
            </h2>
            <div className="h-[calc(100vh-250px)]">
              <MapView />
            </div>
            <DroneStatusPanel />
          </>
        );
      case 'risk':
        return (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Risk Analysis
            </h2>
            <div className="h-[calc(100vh-250px)] overflow-auto">
              <AreaRiskBreakdown />
            </div>
          </>
        );
      case 'fleet':
        return (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Drone Fleet Management
            </h2>
            <div className="text-center text-gray-500 mt-10">
              Drone Fleet Management Coming Soon
            </div>
          </>
        );
      case 'analytics':
        return (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Analytics Dashboard
            </h2>
            <div className="text-center text-gray-500 mt-10">
              Analytics Dashboard Coming Soon
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-indigo-600 shadow-lg relative z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-indigo-700 p-2 rounded-md transition-colors duration-200"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center">
                <h1 className="ml-4 text-2xl font-bold text-white">Front Line Zero</h1>
                <span className="ml-2 text-indigo-200 text-sm">v1.0</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
                  className={`text-white p-2 rounded-md transition-colors duration-200 ${
                    isNotificationsPanelOpen ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <Bell size={24} />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
                <NotificationsPanel 
                  isOpen={isNotificationsPanelOpen}
                  onClose={() => setIsNotificationsPanelOpen(false)}
                />
              </div>
              {/* Settings */}
              <button className="text-white hover:bg-indigo-700 p-2 rounded-md transition-colors duration-200">
                <Settings size={24} />
              </button>
              {/* User Profile */}
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop for notifications panel */}
      {isNotificationsPanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsNotificationsPanelOpen(false)}
        />
      )}

      {/* Sidebar and Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:relative lg:translate-x-0 z-30 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'map'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map className="mr-3" size={20} />
                  Map View
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('risk')}
                  className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'risk'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <AlertTriangle className="mr-3" size={20} />
                  Risk Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('fleet')}
                  className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'fleet'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Drone className="mr-3" size={20} />
                  Drone Fleet
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart2 className="mr-3" size={20} />
                  Analytics
                </button>
              </li>
            </ul>
          </nav>
          
          {/* System Status */}
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">System Status</span>
              <span className="flex items-center text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Online
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto relative">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;