import type { SensorData } from '@/hooks/useSimulation';

interface HardwareModuleProps {
  sensorData: SensorData;
  isRunning: boolean;
  environment: 'day' | 'night' | 'rain';
}

const StatusDot = ({ active }: { active: boolean }) => (
  <div className={`w-2 h-2 rounded-full ${active ? 'bg-secondary animate-pulse' : 'bg-muted-foreground/40'}`} />
);

const HardwareModule = ({ sensorData, isRunning, environment }: HardwareModuleProps) => {
  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-primary tracking-widest">HARDWARE & DATA ACQUISITION</p>
        <StatusDot active={isRunning} />
      </div>

      {/* Camera */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">📷 RASPBERRY PI CAMERA</span>
          <span className="font-mono-tech text-[10px] text-primary">{isRunning ? `${sensorData.cameraFps.toFixed(1)} FPS` : 'IDLE'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Resolution</span>
          <span className="font-mono-tech text-[10px] text-foreground/70">1280×720 HD</span>
        </div>
      </div>

      {/* IMU */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">🔄 IMU (MPU6050)</span>
          <span className="font-mono-tech text-[10px] text-imu">{isRunning ? `${sensorData.imuHz.toFixed(0)} Hz` : 'IDLE'}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-1">
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="text-center">
              <p className="font-mono-tech text-[9px] text-muted-foreground">Accel {axis}</p>
              <p className="font-mono-tech text-xs text-imu">
                {isRunning ? [sensorData.imuAccelX, sensorData.imuAccelY, sensorData.imuAccelZ][i].toFixed(2) : '0.00'}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="text-center">
              <p className="font-mono-tech text-[9px] text-muted-foreground">Gyro {axis}</p>
              <p className="font-mono-tech text-xs text-imu">
                {isRunning ? [sensorData.imuGyroX, sensorData.imuGyroY, sensorData.imuGyroZ][i].toFixed(1) : '0.0'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* GPS */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">📍 NEO-6M GPS</span>
          <span className="font-mono-tech text-[10px] text-gps">{isRunning ? 'FIX 3D' : 'NO FIX'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Lat</span>
          <span className="font-mono-tech text-[10px] text-gps">{sensorData.gpsLat.toFixed(6)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Lng</span>
          <span className="font-mono-tech text-[10px] text-gps">{sensorData.gpsLng.toFixed(6)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Speed</span>
          <span className="font-mono-tech text-[10px] text-gps">{isRunning ? sensorData.gpsSpeed.toFixed(1) : '0.0'} km/h</span>
        </div>
      </div>

      {/* Environmental */}
      <div className="p-3 rounded bg-muted/20 border border-border space-y-1">
        <span className="font-mono-tech text-[10px] text-muted-foreground">🌡️ ENVIRONMENTAL</span>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Ambient Lux (BH1750)</span>
          <span className="font-mono-tech text-[10px] text-accent">{isRunning ? sensorData.ambientLux.toFixed(0) : '---'} lx</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Rain Probability</span>
          <span className={`font-mono-tech text-[10px] ${sensorData.rainProbability > 0.5 ? 'text-destructive' : 'text-secondary'}`}>
            {isRunning ? (sensorData.rainProbability * 100).toFixed(0) : '0'}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Environment</span>
          <span className="font-mono-tech text-[10px] text-primary uppercase">{environment}</span>
        </div>
      </div>
    </div>
  );
};

export default HardwareModule;
