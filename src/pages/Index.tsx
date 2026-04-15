import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useBeepSound } from '@/hooks/useBeepSound';
import { useEffect } from 'react';
import RoadView from '@/components/RoadView';
import ControlPanel from '@/components/ControlPanel';
import AlertBanner from '@/components/AlertBanner';
import HardwareModule from '@/components/HardwareModule';
import VisionModule from '@/components/VisionModule';
import IMUModule from '@/components/IMUModule';
import FusionModule from '@/components/FusionModule';
import SeverityModule from '@/components/SeverityModule';
import LocationModule from '@/components/LocationModule';

type ModuleTab = 'hardware' | 'vision' | 'imu' | 'fusion' | 'severity' | 'location';

const tabs: { id: ModuleTab; label: string; icon: string }[] = [
  { id: 'hardware', label: 'HARDWARE', icon: '🔧' },
  { id: 'vision', label: 'VISION', icon: '👁' },
  { id: 'imu', label: 'IMU', icon: '🔄' },
  { id: 'fusion', label: 'FUSION', icon: '⚡' },
  { id: 'severity', label: 'ALERTS', icon: '🚨' },
  { id: 'location', label: 'GPS/MAP', icon: '📍' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<ModuleTab>('hardware');
  const sim = useSimulation();
  const { startAlertBeeping, stopAlertBeeping } = useBeepSound();

  // Alert beeping
  useEffect(() => {
    if (!sim.isRunning) { stopAlertBeeping(); return; }
    if (sim.distance < 50) startAlertBeeping('high');
    else if (sim.distance < 100) startAlertBeeping('medium');
    else stopAlertBeeping();
    return () => stopAlertBeeping();
  }, [sim.distance, sim.isRunning, startAlertBeeping, stopAlertBeeping]);

  const renderModule = () => {
    switch (activeTab) {
      case 'hardware':
        return <HardwareModule sensorData={sim.sensorData} isRunning={sim.isRunning} environment={sim.environment} />;
      case 'vision':
        return <VisionModule sensorData={sim.sensorData} potholes={sim.potholes} isRunning={sim.isRunning} environment={sim.environment} />;
      case 'imu':
        return <IMUModule sensorData={sim.sensorData} isRunning={sim.isRunning} />;
      case 'fusion':
        return <FusionModule sensorData={sim.sensorData} isRunning={sim.isRunning} environment={sim.environment} />;
      case 'severity':
        return <SeverityModule sensorData={sim.sensorData} detectionEvents={sim.detectionEvents} alertLevel={sim.alertLevel} distance={sim.distance} speed={sim.speed} isRunning={sim.isRunning} />;
      case 'location':
        return <LocationModule sensorData={sim.sensorData} detectionEvents={sim.detectionEvents} isRunning={sim.isRunning} detectionCount={sim.detectionCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-lg md:text-2xl font-bold text-primary text-glow tracking-wider">
              POTHOLE DETECTION SYSTEM
            </h1>
            <p className="font-mono-tech text-[10px] md:text-xs text-muted-foreground mt-1">
              MULTI-SENSOR FUSION v2.0 — Camera + IMU + GPS + Environmental
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${sim.isRunning ? 'bg-secondary animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="font-mono-tech text-xs text-muted-foreground">{sim.isRunning ? 'ACTIVE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="max-w-7xl mx-auto mb-3">
        <AlertBanner alertLevel={sim.alertLevel} distance={sim.distance} isRunning={sim.isRunning} />
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Left: Road View + Controls */}
        <div className="space-y-3">
          <div className="h-[400px] md:h-[500px] relative">
            <RoadView environment={sim.environment} potholes={sim.potholes} sensorRange={120} isRunning={sim.isRunning} carX={sim.carX} />
            {/* Mobile steering */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between md:hidden pointer-events-none">
              <button onTouchStart={() => sim.setCarX(prev => Math.max(22, prev - 3))} onMouseDown={() => sim.setCarX(prev => Math.max(22, prev - 3))}
                className="pointer-events-auto w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg active:bg-primary/40">←</button>
              <button onTouchStart={() => sim.setCarX(prev => Math.min(78, prev + 3))} onMouseDown={() => sim.setCarX(prev => Math.min(78, prev + 3))}
                className="pointer-events-auto w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg active:bg-primary/40">→</button>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:block font-mono-tech text-[10px] text-primary/50">← → ARROW KEYS TO STEER</div>
          </div>

          <ControlPanel isRunning={sim.isRunning} environment={sim.environment} speed={sim.speed}
            onToggleRun={sim.handleToggle} onEnvironmentChange={sim.setEnvironment} onSpeedChange={sim.setSpeed} />

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-lg hud-border text-center">
              <p className="font-mono-tech text-[9px] text-muted-foreground">DETECTED</p>
              <p className="font-orbitron text-sm text-accent">{sim.detectionCount}</p>
            </div>
            <div className="p-2 rounded-lg hud-border text-center">
              <p className="font-mono-tech text-[9px] text-muted-foreground">DISTANCE</p>
              <p className="font-orbitron text-sm text-primary">{sim.isRunning ? `${(sim.distance / 100).toFixed(1)}m` : '---'}</p>
            </div>
            <div className="p-2 rounded-lg hud-border text-center">
              <p className="font-mono-tech text-[9px] text-muted-foreground">FUSED</p>
              <p className="font-orbitron text-sm text-fusion">{sim.isRunning ? `${(sim.sensorData.fusedConfidence * 100).toFixed(0)}%` : '0%'}</p>
            </div>
            <div className="p-2 rounded-lg hud-border text-center">
              <p className="font-mono-tech text-[9px] text-muted-foreground">SPEED</p>
              <p className="font-orbitron text-sm text-primary">{sim.isRunning ? sim.speed : 0}</p>
            </div>
          </div>
        </div>

        {/* Right: Module Tabs */}
        <div className="space-y-3">
          {/* Tab Bar */}
          <div className="grid grid-cols-3 gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded text-center font-mono-tech text-[10px] transition-all ${
                  activeTab === tab.id ? 'bg-primary/20 border border-primary text-primary hud-glow' : 'bg-muted/30 border border-border text-muted-foreground hover:border-primary/50'
                }`}>
                <div className="text-sm">{tab.icon}</div>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Module */}
          <div className="max-h-[600px] overflow-y-auto">
            {renderModule()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-4 text-center font-mono-tech text-[10px] text-muted-foreground/50">
        POTHOLE DETECTION SYSTEM — RPi Camera + MPU6050 + NEO-6M GPS + BH1750 — YOLOv8 + KALMAN FUSION — REAL-TIME MONITORING
      </div>
    </div>
  );
};

export default Index;
