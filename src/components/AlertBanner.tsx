interface AlertBannerProps {
  alertLevel: 'safe' | 'caution' | 'danger';
  distance: number;
  isRunning: boolean;
}

const AlertBanner = ({ alertLevel, distance, isRunning }: AlertBannerProps) => {
  if (!isRunning || alertLevel === 'safe') return null;

  return (
    <div
      className={`p-3 rounded-lg text-center font-orbitron tracking-wider transition-all ${
        alertLevel === 'danger'
          ? 'bg-destructive/20 border border-destructive text-destructive alert-glow animate-pulse-alert'
          : 'bg-accent/20 border border-accent text-accent'
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-xl">{alertLevel === 'danger' ? '🚨' : '⚠️'}</span>
        <div>
          <p className={`text-sm font-bold ${alertLevel === 'danger' ? 'text-glow-alert' : ''}`}>
            {alertLevel === 'danger' ? 'POTHOLE DETECTED!' : 'POTHOLE APPROACHING'}
          </p>
          <p className="font-mono-tech text-xs opacity-70">
            Distance: {(distance / 100).toFixed(1)} m — {alertLevel === 'danger' ? 'BRAKE / AVOID' : 'SLOW DOWN'}
          </p>
        </div>
        <span className="text-xl">{alertLevel === 'danger' ? '🚨' : '⚠️'}</span>
      </div>
    </div>
  );
};

export default AlertBanner;
