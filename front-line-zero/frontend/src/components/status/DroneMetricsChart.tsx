import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface MetricDataPoint {
  timestamp: string;
  altitude: number;
  speed: number;
}

interface DroneMetricsChartProps {
  droneId: string;
  timeWindow?: number; // Time window in minutes
}

const DroneMetricsChart: React.FC<DroneMetricsChartProps> = ({ 
  droneId, 
  timeWindow = 5 // Default 5 minutes window
}) => {
  const [data, setData] = useState<MetricDataPoint[]>([]);

  // Mock data generation - will be replaced with WebSocket data
  useEffect(() => {
    // Generate initial data
    const initialData = Array.from({ length: 20 }, (_, i) => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - (20 - i) * 15); // Every 15 seconds
      return {
        timestamp: date.toLocaleTimeString(),
        altitude: Math.floor(100 + Math.random() * 40), // Random altitude between 100-140m
        speed: Math.floor(30 + Math.random() * 15)      // Random speed between 30-45km/h
      };
    });
    setData(initialData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        const now = new Date();
        
        // Add new data point
        newData.push({
          timestamp: now.toLocaleTimeString(),
          altitude: Math.floor(100 + Math.random() * 40),
          speed: Math.floor(30 + Math.random() * 15)
        });

        // Remove old data points outside the time window
        while (newData.length > 20) {
          newData.shift();
        }

        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [droneId, timeWindow]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm">
          <p className="text-xs text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name === 'altitude' ? 'Altitude: ' : 'Speed: '}
              {entry.value}
              {entry.name === 'altitude' ? 'm' : 'km/h'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-32 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            tickFormatter={(value) => value.split(':')[1]}
          />
          <YAxis 
            yAxisId="altitude"
            orientation="left"
            tick={{ fontSize: 10 }}
            domain={[80, 160]}
            tickFormatter={(value) => `${value}m`}
          />
          <YAxis 
            yAxisId="speed"
            orientation="right"
            tick={{ fontSize: 10 }}
            domain={[20, 50]}
            tickFormatter={(value) => `${value}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Line
            yAxisId="altitude"
            type="monotone"
            dataKey="altitude"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Altitude"
          />
          <Line
            yAxisId="speed"
            type="monotone"
            dataKey="speed"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Speed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DroneMetricsChart;