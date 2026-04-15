import { useState, useEffect, useCallback, useRef } from 'react';

export interface Pothole {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'dry' | 'water';
  detected: boolean;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
}

export interface SensorData {
  imuAccelX: number;
  imuAccelY: number;
  imuAccelZ: number;
  imuGyroX: number;
  imuGyroY: number;
  imuGyroZ: number;
  gpsLat: number;
  gpsLng: number;
  gpsSpeed: number;
  gpsHeading: number;
  gpsAltitude: number;
  gpsHdop: number;
  gpsSatellites: number;
  gpsFixType: '2D' | '3D' | 'DGPS' | 'NO FIX';
  ambientLux: number;
  rainProbability: number;
  cameraFps: number;
  imuHz: number;
  visionConfidence: number;
  imuConfidence: number;
  fusedConfidence: number;
  fusionWeight: { vision: number; imu: number };
  timestamp: number;
}

export interface DetectionEvent {
  id: number;
  timestamp: number;
  type: 'vision' | 'imu' | 'fused';
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
  distance: number;
}

const BASE_LAT = 12.9716;
const BASE_LNG = 77.5946;

// Meters per degree (approximate at equator-ish latitudes)
const METERS_PER_DEG_LAT = 111320;
const METERS_PER_DEG_LNG = 111320 * Math.cos((BASE_LAT * Math.PI) / 180);

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [environment, setEnvironment] = useState<'day' | 'night' | 'rain'>('day');
  const [speed, setSpeed] = useState(40);
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [distance, setDistance] = useState(500);
  const [alertLevel, setAlertLevel] = useState<'safe' | 'caution' | 'danger'>('safe');
  const [detectionCount, setDetectionCount] = useState(0);
  const [carX, setCarX] = useState(50);

  // GPS path state — heading in degrees (0=North, 90=East)
  const gpsPathRef = useRef({ lat: BASE_LAT, lng: BASE_LNG, heading: 45, altitude: 920 });

  const [sensorData, setSensorData] = useState<SensorData>({
    imuAccelX: 0, imuAccelY: 0, imuAccelZ: 9.81,
    imuGyroX: 0, imuGyroY: 0, imuGyroZ: 0,
    gpsLat: BASE_LAT, gpsLng: BASE_LNG, gpsSpeed: 0,
    gpsHeading: 45, gpsAltitude: 920,
    gpsHdop: 0.9, gpsSatellites: 12, gpsFixType: '3D',
    ambientLux: 500, rainProbability: 0, cameraFps: 30, imuHz: 100,
    visionConfidence: 0, imuConfidence: 0, fusedConfidence: 0,
    fusionWeight: { vision: 0.6, imu: 0.4 },
    timestamp: Date.now(),
  });
  const [detectionEvents, setDetectionEvents] = useState<DetectionEvent[]>([]);
  const nextIdRef = useRef(0);
  const carXRef = useRef(carX);
  const eventIdRef = useRef(0);

  useEffect(() => { carXRef.current = carX; }, [carX]);

  const CAR_HALF_WIDTH = 7;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCarX(prev => Math.max(22, prev - 2));
      else if (e.key === 'ArrowRight') setCarX(prev => Math.min(78, prev + 2));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const spawnPothole = useCallback(() => {
    const cx = carXRef.current;
    const laneMin = cx - CAR_HALF_WIDTH;
    const laneMax = cx + CAR_HALF_WIDTH;
    const inLane = Math.random() > 0.3;
    const x = inLane
      ? laneMin + Math.random() * (laneMax - laneMin)
      : Math.random() > 0.5 ? 18 + Math.random() * 15 : 67 + Math.random() * 15;

    const severity = Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low';
    const pothole: Pothole = {
      id: nextIdRef.current++,
      x, y: -5,
      size: severity === 'high' ? 35 + Math.random() * 20 : severity === 'medium' ? 25 + Math.random() * 15 : 20 + Math.random() * 10,
      type: environment === 'rain' ? 'water' : Math.random() > 0.5 ? 'water' : 'dry',
      detected: false,
      confidence: 0,
      severity,
      lat: gpsPathRef.current.lat + (Math.random() - 0.5) * 0.0002,
      lng: gpsPathRef.current.lng + (Math.random() - 0.5) * 0.0002,
    };
    setPotholes(prev => [...prev, pothole]);
  }, [environment]);

  // Sensor data simulation
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const hasNearPothole = distance < 300;
      const envFactor = environment === 'rain' ? 0.7 : environment === 'night' ? 0.5 : 1.0;
      const visionW = environment === 'rain' ? 0.3 : environment === 'night' ? 0.4 : 0.6;
      const imuW = 1 - visionW;

      // Advance GPS position along heading (100ms tick, speed in km/h → m/s)
      const gps = gpsPathRef.current;
      const speedMs = speed / 3.6;
      const dtSec = 0.1;
      const distM = speedMs * dtSec;
      // Slight heading drift to simulate road curves
      gps.heading += (Math.random() - 0.5) * 1.5;
      const headingRad = (gps.heading * Math.PI) / 180;
      gps.lat += (distM * Math.cos(headingRad)) / METERS_PER_DEG_LAT;
      gps.lng += (distM * Math.sin(headingRad)) / METERS_PER_DEG_LNG;
      gps.altitude += (Math.random() - 0.5) * 0.3;

      // GPS accuracy: DGPS-quality noise (~1-2m), HDOP varies slightly
      const hdop = 0.8 + Math.random() * 0.4;
      const posNoise = (hdop * 1.5) / METERS_PER_DEG_LAT; // ~1-3m in degrees
      const satellites = Math.floor(10 + Math.random() * 4);
      const fixType: SensorData['gpsFixType'] = hdop < 1.0 ? 'DGPS' : hdop < 1.5 ? '3D' : '2D';

      setSensorData({
        imuAccelX: (Math.random() - 0.5) * 2 + (hasNearPothole ? (Math.random() - 0.5) * 8 : 0),
        imuAccelY: (Math.random() - 0.5) * 1.5,
        imuAccelZ: 9.81 + (Math.random() - 0.5) * 1 + (hasNearPothole ? -3 + Math.random() * 6 : 0),
        imuGyroX: (Math.random() - 0.5) * 5 + (hasNearPothole ? (Math.random() - 0.5) * 15 : 0),
        imuGyroY: (Math.random() - 0.5) * 3,
        imuGyroZ: (Math.random() - 0.5) * 2,
        gpsLat: gps.lat + (Math.random() - 0.5) * posNoise,
        gpsLng: gps.lng + (Math.random() - 0.5) * posNoise,
        gpsSpeed: speed + (Math.random() - 0.5) * 1.5,
        gpsHeading: gps.heading + (Math.random() - 0.5) * 0.5,
        gpsAltitude: gps.altitude,
        gpsHdop: hdop,
        gpsSatellites: satellites,
        gpsFixType: fixType,
        ambientLux: environment === 'night' ? 10 + Math.random() * 30 : environment === 'rain' ? 200 + Math.random() * 200 : 500 + Math.random() * 500,
        rainProbability: environment === 'rain' ? 0.7 + Math.random() * 0.3 : Math.random() * 0.1,
        cameraFps: 28 + Math.random() * 4,
        imuHz: 98 + Math.random() * 4,
        visionConfidence: hasNearPothole ? (0.7 + Math.random() * 0.25) * envFactor : Math.random() * 0.2,
        imuConfidence: hasNearPothole ? 0.6 + Math.random() * 0.35 : Math.random() * 0.15,
        fusedConfidence: hasNearPothole
          ? Math.min(0.99, (0.7 + Math.random() * 0.25) * envFactor * visionW + (0.6 + Math.random() * 0.35) * imuW)
          : Math.random() * 0.1,
        fusionWeight: { vision: visionW, imu: imuW },
        timestamp: Date.now(),
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, speed, environment, distance]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setPotholes(prev => {
        const moveSpeed = speed / 20;
        const updated = prev.map(p => ({ ...p, y: p.y + moveSpeed })).filter(p => p.y < 110);
        let minDist = 500;
        const cx = carXRef.current;
        const laneMin = cx - CAR_HALF_WIDTH;
        const laneMax = cx + CAR_HALF_WIDTH;
        const withDetection = updated.map(p => {
          const isInCarPath = p.x >= laneMin && p.x <= laneMax;
          // Severity-based max detection range: high=500m, medium=350m, low=200m
          const maxRange = p.severity === 'high' ? 500 : p.severity === 'medium' ? 350 : 200;
          const detectStart = 40; // y position where detection begins (far ahead)
          if (isInCarPath && p.y > detectStart && p.y < 90) {
            const d = Math.max(5, ((90 - p.y) / (90 - detectStart)) * maxRange);
            if (d < minDist) minDist = d;
            if (!p.detected && p.y > detectStart) {
              setDetectionCount(c => c + 1);
              const conf = 0.75 + Math.random() * 0.2;
              setDetectionEvents(evts => [
                { id: eventIdRef.current++, timestamp: Date.now(), type: 'fused' as const, confidence: conf, severity: p.severity, lat: p.lat, lng: p.lng, distance: d },
                ...evts,
              ].slice(0, 50));
              return { ...p, detected: true, confidence: conf };
            }
            if (p.y > detectStart) return { ...p, detected: true };
          }
          return { ...p, detected: isInCarPath && p.y > detectStart && p.y < 90 ? p.detected : false };
        });
        setDistance(minDist);
        return withDetection;
      });
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning, speed]);

  // Spawn potholes
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(spawnPothole, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isRunning, spawnPothole]);

  // Alert level
  useEffect(() => {
    if (!isRunning) { setAlertLevel('safe'); return; }
    if (distance < 200) setAlertLevel('danger');
    else if (distance < 350) setAlertLevel('caution');
    else setAlertLevel('safe');
  }, [distance, isRunning]);

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
      setPotholes([]);
      setDistance(500);
      setAlertLevel('safe');
    } else {
      setDetectionCount(0);
      setDetectionEvents([]);
      gpsPathRef.current = { lat: BASE_LAT, lng: BASE_LNG, heading: 45, altitude: 920 };
      setIsRunning(true);
    }
  };

  return {
    isRunning, environment, speed, potholes, distance, alertLevel, detectionCount, carX, sensorData, detectionEvents,
    setCarX, setEnvironment, setSpeed, handleToggle,
  };
};
