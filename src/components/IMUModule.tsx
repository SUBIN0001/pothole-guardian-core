import type { SensorData } from '@/hooks/useSimulation';

interface IMUModuleProps {
  sensorData: SensorData;
  isRunning: boolean;
}

const IMUModule = ({ sensorData, isRunning }: IMUModuleProps) => {
  const accelMag = Math.sqrt(sensorData.imuAccelX ** 2 + sensorData.imuAccelY ** 2 + sensorData.imuAccelZ ** 2);
  const deviation = Math.abs(accelMag - 9.81);
  const isAnomaly = deviation > 2;

  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-imu tracking-widest text-glow-imu">IMU PROCESSING</p>
        <span className="font-mono-tech text-[10px] text-imu">Kalman Filter</span>
      </div>

      {/* Acceleration Visualization */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">ACCELERATION VECTOR (m/s²)</span>
        <div className="mt-2 space-y-1">
          {[
            { label: 'X', value: sensorData.imuAccelX, color: 'bg-destructive/60' },
            { label: 'Y', value: sensorData.imuAccelY, color: 'bg-accent/60' },
            { label: 'Z', value: sensorData.imuAccelZ, color: 'bg-imu/60' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono-tech text-[10px] text-muted-foreground w-3">{label}</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-foreground/20" />
                <div className={`absolute inset-y-0 ${color} rounded-full transition-all duration-100`}
                  style={{
                    left: value >= 0 ? '50%' : `${50 + (value / 20) * 50}%`,
                    width: `${Math.min(50, Math.abs(value / 20) * 50)}%`,
                  }} />
              </div>
              <span className="font-mono-tech text-[10px] text-imu w-12 text-right">{isRunning ? value.toFixed(2) : '0.00'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Analysis */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">PATTERN CLASSIFICATION</span>
        <div className="mt-1 space-y-1">
          <div className="flex justify-between">
            <span className="font-mono-tech text-[10px] text-muted-foreground">Accel Magnitude</span>
            <span className="font-mono-tech text-[10px] text-imu">{isRunning ? accelMag.toFixed(2) : '9.81'} m/s²</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono-tech text-[10px] text-muted-foreground">Deviation from 1g</span>
            <span className={`font-mono-tech text-[10px] ${isAnomaly ? 'text-destructive' : 'text-secondary'}`}>
              {isRunning ? deviation.toFixed(2) : '0.00'} m/s²
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono-tech text-[10px] text-muted-foreground">Pattern</span>
            <span className={`font-mono-tech text-[10px] ${isAnomaly ? 'text-accent animate-pulse' : 'text-secondary'}`}>
              {!isRunning ? 'IDLE' : isAnomaly ? '⚡ POTHOLE CANDIDATE' : '✓ NORMAL ROAD'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono-tech text-[10px] text-muted-foreground">False Rejection</span>
            <span className="font-mono-tech text-[10px] text-foreground/70">Speed bumps, vibrations filtered</span>
          </div>
        </div>
      </div>

      {/* IMU Confidence */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <div className="flex justify-between mb-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">IMU CONFIDENCE</span>
          <span className="font-mono-tech text-xs text-imu">{isRunning ? (sensorData.imuConfidence * 100).toFixed(0) : '0'}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-200 bg-imu/70" style={{ width: `${isRunning ? sensorData.imuConfidence * 100 : 0}%` }} />
        </div>
      </div>

      {/* Noise Filter */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">KALMAN FILTER STATUS</span>
        <div className="flex justify-between mt-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">State</span>
          <span className="font-mono-tech text-[10px] text-imu">{isRunning ? 'CONVERGED' : 'INIT'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Noise Sources</span>
          <span className="font-mono-tech text-[10px] text-foreground/70">Road, Engine, Wind</span>
        </div>
      </div>
    </div>
  );
};

export default IMUModule;
