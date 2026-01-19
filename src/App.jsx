import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapContainer from './components/MapContainer';
import ControlPanel from './components/ControlPanel';
import Tooltip from './components/Tooltip';
import { generateData } from './data/mockData';

import { FlyToInterpolator } from 'deck.gl';

function App() {
  const [data, setData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 12,
    pitch: 45,
    bearing: 0
  });

  const [settings, setSettings] = useState({
    showScatter: true,
    showHexagon: true,
    showHeatmap: false,
    minRiskScore: 0
  });

  const handleCityChange = useCallback((cityCode) => {
    const newViewState = cityCode === 'LDN'
      ? {
        longitude: -0.1278,
        latitude: 51.5074,
        zoom: 12,
        pitch: 45,
        bearing: 0,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator()
      }
      : {
        longitude: -122.4194,
        latitude: 37.7749,
        zoom: 12,
        pitch: 45,
        bearing: 0,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator()
      };
    setViewState(newViewState);
  }, []);

  const handleHover = useCallback((info) => {
    setHoverInfo(prev => {
      // Only update if the object actually changed to prevent re-renders
      if (prev?.object === info?.object) return prev;
      return info;
    });
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount or when dataSource changes
  useEffect(() => {
    setIsLoading(true);

    if (settings.dataSource === 'mock') {
      // Simulate loading delay for mock data
      setTimeout(() => {
        const loadedData = generateData(5000);
        setData(loadedData);
        setIsLoading(false);
      }, 800);
    } else {
      // Fetch from API (BigQuery)
      fetch('/api/properties')
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error("Error fetching data:", data.error);
            alert(`Failed to fetch from BigQuery: ${data.error}\nFalling back to mock data.`);
            setSettings(prev => ({ ...prev, dataSource: 'mock' }));
          } else {
            setData(data);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Network error:", err);
          alert("Network error connecting to backend. Ensure backend is running.");
          setSettings(prev => ({ ...prev, dataSource: 'mock' }));
          setIsLoading(false);
        });
    }
  }, [settings.dataSource]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Helper for the toggle in ControlPanel
  const setDataSource = (source) => {
    handleSettingChange('dataSource', source);
  };

  // Calculate stats for the current view
  const dataStats = useMemo(() => {
    const filtered = data.filter(d => d.riskScore >= settings.minRiskScore);
    const count = filtered.length;
    const highRiskCount = filtered.filter(d => d.riskScore > 75).length;
    const totalTiv = filtered.reduce((sum, d) => sum + d.tiv, 0);
    const avgTiv = count > 0 ? totalTiv / count : 0;

    return { count, highRiskCount, avgTiv };
  }, [data, settings.minRiskScore]);

  return (
    <div className="relative w-full h-screen bg-brand-gray overflow-hidden">
      <MapContainer
        data={data}
        settings={settings}
        onHover={handleHover}
        viewState={viewState}
        onViewStateChange={setViewState}
      />

      <ControlPanel
        settings={{ ...settings, setDataSource }}
        onCityChange={handleCityChange}
        handleChange={handleSettingChange}
        dataStats={dataStats}
      />

      <Tooltip info={hoverInfo} />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mb-4"></div>
          <div className="text-brand-dark font-mono text-sm animate-pulse">Querying BigQuery...</div>
        </div>
      )}
    </div>
  );
}

export default App;
