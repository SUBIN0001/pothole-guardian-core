import type { DetectionEvent, SensorData } from '@/hooks/useSimulation';

interface SeverityModuleProps {
  sensorData: SensorData;
  detectionEvents: DetectionEvent[];
  alertLevel: 'safe' | 'caution' | 'danger';
  distance: number;
  speed: number;
  isRunning: boolean;
}

const SeverityModule = ({ sensorData, detectionEvents, alertLevel, distance, speed, isRunning }: SeverityModuleProps) => {
  const recentEvents = detectionEvents.slice(0, 8);
  const highCount = detectionEvents.filter(e => e.severity === 'high').length;
  const medCount = detectionEvents.filter(e => e.severity === 'medium').length;
  const lowCount = detectionEvents.filter(e => e.severity === 'low').length;

  const alertMessage = alertLevel === 'danger'
    ? `Severe pothole ahead in ${distance.toFixed(0)}m`
    : alertLevel === 'caution'
    ? `Pothole approaching — ${distance.toFixed(0)}m`
    : 'Road clear';

  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-accent tracking-widest">SEVERITY & ALERT</p>
        <span className={`font-mono-tech text-[10px] ${
          alertLevel === 'danger' ? 'text-destructive animate-pulse' : alertLevel === 'caution' ? 'text-accent' : 'text-secondary'
        }`}>
          {isRunning ? alertLevel.toUpperCase() : 'STANDBY'}
        </span>
      </div>

      {/* Current Alert */}
      <div className={`p-3 rounded border ${
        alertLevel === 'danger' ? 'bg-destructive/10 border-destructive/40 alert-glow' :
        alertLevel === 'caution' ? 'bg-accent/10 border-accent/40' :
        'bg-muted/20 border-border'
      }`}>
        <span className="font-mono-tech text-[10px] text-muted-foreground">VOICE ALERT</span>
        <p className={`font-rajdhani text-sm mt-1 ${
          alertLevel === 'danger' ? 'text-destructive font-bold' : alertLevel === 'caution' ? 'text-accent' : 'text-muted-foreground'
        }`}>
          🔊 "{alertMessage}"
        </p>
        <p className="font-mono-tech text-[9px] text-muted-foreground/60 mt-1">
          {speed > 60 ? 'Highway mode: reduced sensitivity' : 'City mode: full sensitivity'}
        </p>
      </div>

      {/* Severity Tiers */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">SEVERITY CLASSIFICATION</span>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-2 rounded bg-destructive/10 border border-destructive/30">
            <p className="font-orbitron text-lg text-destructive">{highCount}</p>
            <p className="font-mono-tech text-[9px] text-destructive">HIGH</p>
          </div>
          <div className="text-center p-2 rounded bg-accent/10 border border-accent/30">
            <p className="font-orbitron text-lg text-accent">{medCount}</p>
            <p className="font-mono-tech text-[9px] text-accent">MEDIUM</p>
          </div>
          <div className="text-center p-2 rounded bg-secondary/10 border border-secondary/30">
            <p className="font-orbitron text-lg text-secondary">{lowCount}</p>
            <p className="font-mono-tech text-[9px] text-secondary">LOW</p>
          </div>
        </div>
        <p className="font-mono-tech text-[9px] text-muted-foreground/60 mt-2">Alerts for Medium + High only</p>
      </div>

      {/* Event Log */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">RECENT EVENTS</span>
        {recentEvents.length === 0 ? (
          <p className="font-mono-tech text-xs text-muted-foreground/50 mt-1">No events</p>
        ) : (
          <div className="space-y-1 mt-1 max-h-32 overflow-y-auto">
            {recentEvents.map(evt => (
              <div key={evt.id} className="flex items-center justify-between text-[10px] font-mono-tech">
                <span className="text-muted-foreground">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                <span className={
                  evt.severity === 'high' ? 'text-destructive' : evt.severity === 'medium' ? 'text-accent' : 'text-secondary'
                }>
                  {evt.severity.toUpperCase()} {(evt.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeverityModule;
