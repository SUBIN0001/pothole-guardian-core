import type { SensorData } from '@/hooks/useSimulation';

interface FusionModuleProps {
  sensorData: SensorData;
  isRunning: boolean;
  environment: 'day' | 'night' | 'rain';
}

const FusionModule = ({ sensorData, isRunning, environment }: FusionModuleProps) => {
  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-fusion tracking-widest text-glow-fusion">SENSOR FUSION & DECISION</p>
        <span className="font-mono-tech text-[10px] text-fusion">CORE INTELLIGENCE</span>
      </div>

      {/* Fusion Weights */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">DYNAMIC WEIGHTED FUSION</span>
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-[10px] text-vision w-14">Vision</span>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-vision/60 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                style={{ width: `${sensorData.fusionWeight.vision * 100}%` }}>
                <span className="font-mono-tech text-[8px] text-foreground">{(sensorData.fusionWeight.vision * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-[10px] text-imu w-14">IMU</span>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-imu/60 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                style={{ width: `${sensorData.fusionWeight.imu * 100}%` }}>
                <span className="font-mono-tech text-[8px] text-foreground">{(sensorData.fusionWeight.imu * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
        <p className="font-mono-tech text-[9px] text-muted-foreground/70 mt-1">
          {environment === 'rain' ? '↑ IMU weight: rain reduces vision reliability' :
           environment === 'night' ? '↑ IMU weight: low-light reduces vision reliability' :
           'Balanced: optimal visibility conditions'}
        </p>
      </div>

      {/* Fused Confidence */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <div className="flex justify-between mb-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">FUSED CONFIDENCE</span>
          <span className={`font-orbitron text-sm font-bold ${
            sensorData.fusedConfidence > 0.8 ? 'text-destructive' : sensorData.fusedConfidence > 0.5 ? 'text-accent' : 'text-secondary'
          }`}>
            {isRunning ? (sensorData.fusedConfidence * 100).toFixed(0) : '0'}%
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${
            sensorData.fusedConfidence > 0.8 ? 'bg-destructive/70' : sensorData.fusedConfidence > 0.5 ? 'bg-accent/70' : 'bg-secondary/70'
          }`} style={{ width: `${isRunning ? sensorData.fusedConfidence * 100 : 0}%` }} />
        </div>
      </div>

      {/* Source Comparison */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">SOURCE COMPARISON</span>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-mono-tech text-[9px] text-vision">Vision</p>
            <p className="font-orbitron text-sm text-vision">{isRunning ? (sensorData.visionConfidence * 100).toFixed(0) : '0'}%</p>
          </div>
          <div>
            <p className="font-mono-tech text-[9px] text-imu">IMU</p>
            <p className="font-orbitron text-sm text-imu">{isRunning ? (sensorData.imuConfidence * 100).toFixed(0) : '0'}%</p>
          </div>
          <div>
            <p className="font-mono-tech text-[9px] text-fusion">Fused</p>
            <p className="font-orbitron text-sm text-fusion">{isRunning ? (sensorData.fusedConfidence * 100).toFixed(0) : '0'}%</p>
          </div>
        </div>
      </div>

      {/* Temporal Smoothing */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">TEMPORAL SMOOTHING</span>
        <div className="flex justify-between mt-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Kalman State</span>
          <span className="font-mono-tech text-[10px] text-fusion">{isRunning ? 'ACTIVE' : 'IDLE'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Weather Adapt.</span>
          <span className="font-mono-tech text-[10px] text-fusion uppercase">{environment}</span>
        </div>
      </div>
    </div>
  );
};

export default FusionModule;
