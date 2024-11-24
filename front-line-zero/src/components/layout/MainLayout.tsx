import React, { useState } from 'react';
import MapView from '../map/MapView';

// Icons
import { Menu, X, Bell, Settings, Map, Drone, AlertTriangle, BarChart2 } from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');

  // Notification count - replace with real data later
  const notificationCount = 3;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-indigo-600 shadow-lg">
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
                <button className="text-white hover:bg-indigo-700 p-2 rounded-md transition-colors duration-200">
                  <Bell size={24} />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
              {/* Settings */}
              <button className="text-white hover:bg-indigo-700 p-2 rounded-md transition-colors duration-200">
                <Settings size={24} />
              </button>
              {/* User Profile - placeholder for now */}
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </nav>

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
        <main className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {activeTab === 'map' && 'Monitoring Dashboard'}
              {activeTab === 'fleet' && 'Drone Fleet Management'}
              {activeTab === 'risk' && 'Risk Analysis'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
            </h2>
            <div className="h-[calc(100vh-250px)]">
              {activeTab === 'map' && <MapView />}
              {activeTab === 'fleet' && <div className="text-center text-gray-500 mt-10">Drone Fleet Management Coming Soon</div>}
              {activeTab === 'risk' && <div className="text-center text-gray-500 mt-10">Risk Analysis Coming Soon</div>}
              {activeTab === 'analytics' && <div className="text-center text-gray-500 mt-10">Analytics Dashboard Coming Soon</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;