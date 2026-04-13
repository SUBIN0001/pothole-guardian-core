import type { SensorData, DetectionEvent } from '@/hooks/useSimulation';

interface LocationModuleProps {
  sensorData: SensorData;
  detectionEvents: DetectionEvent[];
  isRunning: boolean;
  detectionCount: number;
}

const LocationModule = ({ sensorData, detectionEvents, isRunning, detectionCount }: LocationModuleProps) => {
  const uniqueLocations = detectionEvents.reduce((acc, evt) => {
    const key = `${evt.lat.toFixed(4)},${evt.lng.toFixed(4)}`;
    if (!acc.has(key)) acc.set(key, evt);
    return acc;
  }, new Map<string, DetectionEvent>());

  const mappedPoints = Array.from(uniqueLocations.values()).slice(0, 10);

  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-gps tracking-widest">LOCATION & DATA MGMT</p>
        <span className="font-mono-tech text-[10px] text-gps">{isRunning ? 'RECORDING' : 'IDLE'}</span>
      </div>

      {/* GPS Map Visualization (simplified) */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">POTHOLE MAP</span>
        <div className="mt-2 relative h-32 bg-muted/30 rounded border border-border overflow-hidden">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`h${i}`} className="absolute w-full h-[1px] bg-primary/10" style={{ top: `${(i + 1) * 20}%` }} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`v${i}`} className="absolute h-full w-[1px] bg-primary/10" style={{ left: `${(i + 1) * 20}%` }} />
          ))}
          
          {/* Current position */}
          <div className="absolute w-3 h-3 rounded-full bg-primary animate-pulse"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-signal-pulse" />
          </div>

          {/* Mapped potholes */}
          {mappedPoints.map((pt, i) => {
            const x = 20 + ((pt.lng - 77.59) * 10000) % 60;
            const y = 20 + ((pt.lat - 12.97) * 10000) % 60;
            return (
              <div key={i} className={`absolute w-2 h-2 rounded-full ${
                pt.severity === 'high' ? 'bg-destructive' : pt.severity === 'medium' ? 'bg-accent' : 'bg-secondary'
              }`} style={{ left: `${x}%`, top: `${y}%` }} />
            );
          })}

          {mappedPoints.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center font-mono-tech text-[10px] text-muted-foreground/40">
              No data points yet
            </p>
          )}
        </div>
      </div>

      {/* Storage Status */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <span className="font-mono-tech text-[10px] text-muted-foreground">DATA STORAGE</span>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Local (SQLite)</span>
          <span className="font-mono-tech text-[10px] text-secondary">✓ ACTIVE</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Cloud (Firebase)</span>
          <span className="font-mono-tech text-[10px] text-accent">⟳ SYNC PENDING</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Records</span>
          <span className="font-mono-tech text-[10px] text-gps">{detectionCount} potholes</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Map Points</span>
          <span className="font-mono-tech text-[10px] text-gps">{uniqueLocations.size} unique</span>
        </div>
      </div>

      {/* Re-alert */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <span className="font-mono-tech text-[10px] text-muted-foreground">RE-ALERT SYSTEM</span>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Revisit Detection</span>
          <span className="font-mono-tech text-[10px] text-gps">{isRunning ? 'MONITORING' : 'OFF'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Community Share</span>
          <span className="font-mono-tech text-[10px] text-gps">ENABLED</span>
        </div>
      </div>

      {/* Offline Status */}
      <div className="p-2 rounded bg-secondary/10 border border-secondary/30">
        <p className="font-mono-tech text-[10px] text-secondary text-center">
          ✓ OFFLINE-FIRST — All data cached locally, cloud sync when connected
        </p>
      </div>
    </div>
  );
};

export default LocationModule;
