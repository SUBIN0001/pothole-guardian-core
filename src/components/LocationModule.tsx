import { useMemo } from 'react';
import type { SensorData, DetectionEvent } from '@/hooks/useSimulation';

interface LocationModuleProps {
  sensorData: SensorData;
  detectionEvents: DetectionEvent[];
  isRunning: boolean;
  detectionCount: number;
}

// Project lat/lng into [0,100]% within a bounding box
function projectToMap(
  lat: number, lng: number,
  minLat: number, maxLat: number,
  minLng: number, maxLng: number
): { x: number; y: number } {
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // invert Y (north=up)
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

const LocationModule = ({ sensorData, detectionEvents, isRunning, detectionCount }: LocationModuleProps) => {
  const uniqueLocations = useMemo(() => {
    const map = new Map<string, DetectionEvent>();
    for (const evt of detectionEvents) {
      const key = `${evt.lat.toFixed(5)},${evt.lng.toFixed(5)}`;
      if (!map.has(key)) map.set(key, evt);
    }
    return Array.from(map.values());
  }, [detectionEvents]);

  // Compute bounding box from all points + current position, with padding
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    const lats = [sensorData.gpsLat, ...uniqueLocations.map(e => e.lat)];
    const lngs = [sensorData.gpsLng, ...uniqueLocations.map(e => e.lng)];
    const pad = 0.0008; // ~90m padding
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [sensorData.gpsLat, sensorData.gpsLng, uniqueLocations]);

  const currentPos = projectToMap(sensorData.gpsLat, sensorData.gpsLng, minLat, maxLat, minLng, maxLng);

  const hdopColor =
    sensorData.gpsHdop < 1.0 ? 'text-secondary' :
    sensorData.gpsHdop < 1.5 ? 'text-gps' :
    sensorData.gpsHdop < 2.5 ? 'text-accent' : 'text-destructive';

  const fixColor =
    sensorData.gpsFixType === 'DGPS' ? 'text-secondary' :
    sensorData.gpsFixType === '3D' ? 'text-gps' :
    sensorData.gpsFixType === '2D' ? 'text-accent' : 'text-destructive';

  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-gps tracking-widest">LOCATION & DATA MGMT</p>
        <span className="font-mono-tech text-[10px] text-gps">{isRunning ? 'RECORDING' : 'IDLE'}</span>
      </div>

      {/* Live GPS Coordinates */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <span className="font-mono-tech text-[10px] text-muted-foreground">LIVE POSITION</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
          <div>
            <span className="font-mono-tech text-[9px] text-muted-foreground">LAT</span>
            <p className="font-mono-tech text-[11px] text-gps">{sensorData.gpsLat.toFixed(6)}°</p>
          </div>
          <div>
            <span className="font-mono-tech text-[9px] text-muted-foreground">LNG</span>
            <p className="font-mono-tech text-[11px] text-gps">{sensorData.gpsLng.toFixed(6)}°</p>
          </div>
          <div>
            <span className="font-mono-tech text-[9px] text-muted-foreground">HEADING</span>
            <p className="font-mono-tech text-[11px] text-primary">{sensorData.gpsHeading.toFixed(1)}°</p>
          </div>
          <div>
            <span className="font-mono-tech text-[9px] text-muted-foreground">ALT</span>
            <p className="font-mono-tech text-[11px] text-primary">{sensorData.gpsAltitude.toFixed(1)} m</p>
          </div>
        </div>
      </div>

      {/* GPS Accuracy */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <span className="font-mono-tech text-[10px] text-muted-foreground">GPS ACCURACY</span>
        <div className="grid grid-cols-3 gap-x-2 mt-1">
          <div className="text-center">
            <p className="font-mono-tech text-[9px] text-muted-foreground">FIX</p>
            <p className={`font-mono-tech text-[11px] font-bold ${fixColor}`}>{sensorData.gpsFixType}</p>
          </div>
          <div className="text-center">
            <p className="font-mono-tech text-[9px] text-muted-foreground">HDOP</p>
            <p className={`font-mono-tech text-[11px] font-bold ${hdopColor}`}>{sensorData.gpsHdop.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="font-mono-tech text-[9px] text-muted-foreground">SATS</p>
            <p className="font-mono-tech text-[11px] font-bold text-gps">{sensorData.gpsSatellites}</p>
          </div>
        </div>
        {/* Satellite signal bars */}
        <div className="flex items-end gap-[2px] mt-2 h-4">
          {Array.from({ length: sensorData.gpsSatellites }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gps/70"
              style={{ height: `${40 + (i % 4) * 20}%` }}
            />
          ))}
          {Array.from({ length: Math.max(0, 16 - sensorData.gpsSatellites) }).map((_, i) => (
            <div key={`e${i}`} className="flex-1 rounded-sm bg-muted/30" style={{ height: '20%' }} />
          ))}
        </div>
        <p className="font-mono-tech text-[9px] text-muted-foreground text-right">
          Est. accuracy: ~{(sensorData.gpsHdop * 2.5).toFixed(1)} m
        </p>
      </div>

      {/* GPS Map Visualization */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">POTHOLE MAP</span>
          <span className="font-mono-tech text-[9px] text-muted-foreground/60">
            {uniqueLocations.length} pts
          </span>
        </div>
        <div className="relative h-40 bg-muted/30 rounded border border-border overflow-hidden">
          {/* Grid */}
          {[20, 40, 60, 80].map(p => (
            <div key={`h${p}`} className="absolute w-full h-[1px] bg-primary/10" style={{ top: `${p}%` }} />
          ))}
          {[20, 40, 60, 80].map(p => (
            <div key={`v${p}`} className="absolute h-full w-[1px] bg-primary/10" style={{ left: `${p}%` }} />
          ))}

          {/* Path trail — last 20 events as faint dots */}
          {detectionEvents.slice(0, 20).map((evt, i) => {
            const pos = projectToMap(evt.lat, evt.lng, minLat, maxLat, minLng, maxLng);
            return (
              <div
                key={`trail${i}`}
                className="absolute w-[3px] h-[3px] rounded-full bg-primary/20"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
              />
            );
          })}

          {/* Pothole markers */}
          {uniqueLocations.map((pt, i) => {
            const pos = projectToMap(pt.lat, pt.lng, minLat, maxLat, minLng, maxLng);
            return (
              <div
                key={i}
                title={`${pt.severity.toUpperCase()} — ${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}`}
                className={`absolute rounded-full border ${
                  pt.severity === 'high'
                    ? 'bg-destructive border-destructive/60 w-3 h-3'
                    : pt.severity === 'medium'
                    ? 'bg-accent border-accent/60 w-2.5 h-2.5'
                    : 'bg-secondary border-secondary/60 w-2 h-2'
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
              />
            );
          })}

          {/* Current position */}
          <div
            className="absolute z-10"
            style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%`, transform: 'translate(-50%,-50%)' }}
          >
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </div>

          {/* Compass rose */}
          <div className="absolute top-1 right-1 font-mono-tech text-[8px] text-primary/50 leading-none text-center">
            N<br />↑
          </div>

          {uniqueLocations.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center font-mono-tech text-[10px] text-muted-foreground/40">
              No data points yet
            </p>
          )}
        </div>

        {/* Map scale */}
        <div className="flex justify-between mt-1">
          <span className="font-mono-tech text-[8px] text-muted-foreground/50">
            {(minLng).toFixed(4)}°E
          </span>
          <span className="font-mono-tech text-[8px] text-muted-foreground/50">
            {(maxLng).toFixed(4)}°E
          </span>
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
          <span className="font-mono-tech text-[10px] text-muted-foreground">Unique Locations</span>
          <span className="font-mono-tech text-[10px] text-gps">{uniqueLocations.length}</span>
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

      <div className="p-2 rounded bg-secondary/10 border border-secondary/30">
        <p className="font-mono-tech text-[10px] text-secondary text-center">
          ✓ OFFLINE-FIRST — All data cached locally, cloud sync when connected
        </p>
      </div>
    </div>
  );
};

export default LocationModule;
