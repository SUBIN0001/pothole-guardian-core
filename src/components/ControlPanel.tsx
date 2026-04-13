import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  isRunning: boolean;
  environment: 'day' | 'night' | 'rain';
  speed: number;
  onToggleRun: () => void;
  onEnvironmentChange: (env: 'day' | 'night' | 'rain') => void;
  onSpeedChange: (speed: number) => void;
}

const ControlPanel = ({ isRunning, environment, speed, onToggleRun, onEnvironmentChange, onSpeedChange }: ControlPanelProps) => {
  const envOptions: { value: 'day' | 'night' | 'rain'; label: string; icon: string }[] = [
    { value: 'day', label: 'Day', icon: '☀️' },
    { value: 'night', label: 'Night', icon: '🌙' },
    { value: 'rain', label: 'Rain', icon: '🌧️' },
  ];

  return (
    <div className="p-4 rounded-lg hud-border space-y-4">
      <p className="font-orbitron text-xs text-primary tracking-widest">CONTROLS</p>
      <Button onClick={onToggleRun}
        className={`w-full font-orbitron text-sm tracking-wider ${
          isRunning ? 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30' : 'bg-secondary/20 border-secondary text-secondary hover:bg-secondary/30'
        } border`} variant="outline">
        {isRunning ? '■ STOP' : '▶ START'} SIMULATION
      </Button>
      <div>
        <p className="font-mono-tech text-[10px] text-muted-foreground mb-2">ENVIRONMENT</p>
        <div className="grid grid-cols-3 gap-2">
          {envOptions.map(opt => (
            <button key={opt.value} onClick={() => onEnvironmentChange(opt.value)}
              className={`p-2 rounded text-center font-mono-tech text-xs transition-all ${
                environment === opt.value ? 'bg-primary/20 border border-primary text-primary hud-glow' : 'bg-muted/30 border border-border text-muted-foreground hover:border-primary/50'
              }`}>
              <div className="text-lg">{opt.icon}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono-tech text-[10px] text-muted-foreground mb-2">VEHICLE SPEED: <span className="text-primary">{speed} km/h</span></p>
        <input type="range" min={10} max={80} value={speed} onChange={e => onSpeedChange(Number(e.target.value))} className="w-full accent-primary" />
        <div className="flex justify-between font-mono-tech text-[10px] text-muted-foreground"><span>10</span><span>80</span></div>
      </div>
    </div>
  );
};

export default ControlPanel;
