import { useEffect, useState } from 'react';
import type { Pothole } from '@/hooks/useSimulation';

interface RoadViewProps {
  environment: 'day' | 'night' | 'rain';
  potholes: Pothole[];
  sensorRange: number;
  isRunning: boolean;
  carX: number;
}

const RoadView = ({ environment, potholes, sensorRange, isRunning, carX }: RoadViewProps) => {
  const [roadOffset, setRoadOffset] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setRoadOffset((prev) => (prev + 2) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning]);

  const envStyles = {
    day: { bg: 'from-blue-300/20 to-transparent', road: 'bg-muted/60', visibility: 1 },
    night: { bg: 'from-transparent to-transparent', road: 'bg-muted/30', visibility: 0.3 },
    rain: { bg: 'from-blue-500/10 to-transparent', road: 'bg-muted/40', visibility: 0.5 },
  };
  const env = envStyles[environment];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg hud-border">
      <div className={`absolute inset-0 bg-gradient-to-b ${env.bg}`} style={{ opacity: env.visibility }} />
      <div className="absolute inset-0 bg-background" style={{ opacity: environment === 'night' ? 0.8 : 0.3 }} />

      <div className="absolute inset-x-[15%] inset-y-0">
        <div className={`absolute inset-0 ${env.road} border-x border-primary/20`}>
          <div className="absolute left-1/2 -translate-x-[1px] inset-y-0 w-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="absolute w-full h-6 bg-accent/70" style={{ top: `${(i * 60 + roadOffset) % (20 * 60)}px` }} />
            ))}
          </div>
        </div>
        <div className="absolute left-0 inset-y-0 w-[3px] bg-primary/40" />
        <div className="absolute right-0 inset-y-0 w-[3px] bg-primary/40" />
      </div>

      {/* Sensor cone */}
      <div className="absolute bottom-[15%]" style={{ left: `${carX}%`, transform: 'translateX(-50%)' }}>
        <div
          className="border-l-[60px] border-r-[60px] border-b-[0px] border-l-transparent border-r-transparent border-solid"
          style={{ borderTopWidth: `${sensorRange * 2}px`, borderTopColor: 'hsl(180 100% 50% / 0.08)', filter: 'blur(2px)' }}
        />
      </div>

      {/* Potholes */}
      {potholes.map((pothole) => (
        <div
          key={pothole.id}
          className={`absolute rounded-full transition-all duration-300 ${
            pothole.detected ? 'ring-2 ring-destructive animate-pulse-alert' : ''
          } ${pothole.type === 'water' ? 'bg-blue-500/60 border border-blue-400/40' : 'bg-muted-foreground/40 border border-muted-foreground/30'}`}
          style={{
            left: `${pothole.x}%`, top: `${pothole.y}%`,
            width: `${pothole.size}px`, height: `${pothole.size * 0.6}px`,
            transform: 'translate(-50%, -50%)',
            opacity: environment === 'night' ? 0.4 : 0.9,
          }}
        >
          {pothole.detected && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono-tech text-[9px] text-destructive whitespace-nowrap">
              {(pothole.confidence * 100).toFixed(0)}% {pothole.severity.toUpperCase()}
            </div>
          )}
          {pothole.type === 'water' && <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse" />}
        </div>
      ))}

      {/* Car */}
      <div className="absolute bottom-4 transition-all duration-100" style={{ left: `${carX}%`, transform: 'translateX(-50%)' }}>
        <div className="relative">
          <div className="w-10 h-16 rounded-t-lg border border-primary/50 hud-glow flex items-center justify-center bg-muted/80">
            <div className="w-6 h-3 bg-primary/40 rounded-sm" />
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary animate-pulse hud-glow-strong" />
        </div>
      </div>

      {/* Rain */}
      {environment === 'rain' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute w-[1px] h-4 bg-blue-300/30 animate-road"
              style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${0.3 + Math.random() * 0.3}s` }} />
          ))}
        </div>
      )}

      {environment === 'night' && <div className="absolute inset-0 scanline pointer-events-none opacity-50" />}

      <div className="absolute top-3 left-3 font-mono-tech text-xs text-primary/70 uppercase tracking-widest">
        {environment === 'day' && '☀ Daytime'}
        {environment === 'night' && '🌙 Nighttime'}
        {environment === 'rain' && '🌧 Rainy'}
      </div>
    </div>
  );
};

export default RoadView;
