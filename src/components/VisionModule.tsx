import type { SensorData, Pothole } from '@/hooks/useSimulation';

interface VisionModuleProps {
  sensorData: SensorData;
  potholes: Pothole[];
  isRunning: boolean;
  environment: 'day' | 'night' | 'rain';
}

const VisionModule = ({ sensorData, potholes, isRunning, environment }: VisionModuleProps) => {
  const detectedPotholes = potholes.filter(p => p.detected);
  const envQuality = environment === 'day' ? 'OPTIMAL' : environment === 'night' ? 'LOW-LIGHT' : 'REFLECTIVE';

  return (
    <div className="p-4 rounded-lg hud-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs text-vision tracking-widest text-glow-vision">VISION DETECTION</p>
        <span className="font-mono-tech text-[10px] text-vision">YOLOv8 Nano + TensorRT</span>
      </div>

      {/* Model Status */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <div className="flex justify-between mb-2">
          <span className="font-mono-tech text-[10px] text-muted-foreground">MODEL</span>
          <span className="font-mono-tech text-[10px] text-vision">YOLOv8n + SegHead</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Inference</span>
          <span className="font-mono-tech text-[10px] text-foreground/70">{isRunning ? `${(8 + Math.random() * 4).toFixed(1)}ms` : '---'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Conditions</span>
          <span className={`font-mono-tech text-[10px] ${environment === 'day' ? 'text-secondary' : 'text-accent'}`}>{envQuality}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Threshold</span>
          <span className="font-mono-tech text-[10px] text-foreground/70">&gt;70% conf</span>
        </div>
      </div>

      {/* Vision Confidence */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <div className="flex justify-between mb-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">VISION CONFIDENCE</span>
          <span className="font-mono-tech text-xs text-vision">{isRunning ? (sensorData.visionConfidence * 100).toFixed(0) : '0'}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-200 bg-vision/70" style={{ width: `${isRunning ? sensorData.visionConfidence * 100 : 0}%` }} />
        </div>
      </div>

      {/* Active Detections */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">ACTIVE DETECTIONS</span>
        {detectedPotholes.length === 0 ? (
          <p className="font-mono-tech text-xs text-muted-foreground/50 mt-1">No active detections</p>
        ) : (
          <div className="space-y-1 mt-1 max-h-24 overflow-y-auto">
            {detectedPotholes.map(p => (
              <div key={p.id} className="flex items-center justify-between text-[10px] font-mono-tech">
                <span className="text-vision">bbox #{p.id}</span>
                <span className={p.severity === 'high' ? 'text-destructive' : p.severity === 'medium' ? 'text-accent' : 'text-secondary'}>
                  {p.type === 'water' ? '💧' : '⬛'} {(p.confidence * 100).toFixed(0)}% {p.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Segmentation */}
      <div className="p-3 rounded bg-muted/20 border border-border">
        <span className="font-mono-tech text-[10px] text-muted-foreground">SEGMENTATION</span>
        <div className="flex justify-between mt-1">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Water-filled</span>
          <span className="font-mono-tech text-[10px] text-vision">{detectedPotholes.filter(p => p.type === 'water').length} masks</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono-tech text-[10px] text-muted-foreground">Dry surface</span>
          <span className="font-mono-tech text-[10px] text-vision">{detectedPotholes.filter(p => p.type === 'dry').length} masks</span>
        </div>
      </div>
    </div>
  );
};

export default VisionModule;
