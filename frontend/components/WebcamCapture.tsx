"use client";

/**
 * WebcamCapture — live webcam preview with 3-second countdown capture.
 *
 * Responsibilities:
 *   - Display the live camera feed
 *   - Run a 3-second countdown on demand
 *   - Capture a still frame at countdown end and emit it via onCapture
 *
 * Does NOT call the API. Does NOT manage lesson state.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useWebcam } from "@/hooks/useWebcam";

interface WebcamCaptureProps {
  /** Called with the base64 JPEG string when countdown reaches zero. */
  onCapture: (imageBase64: string) => void;
  /** When true the countdown starts automatically. */
  isCapturing: boolean;
}

const COUNTDOWN_SECONDS = 3;

const WebcamCapture = ({ onCapture, isCapturing }: WebcamCaptureProps) => {
  const { videoRef, permissionStatus, startCamera, stopCamera, captureFrame } = useWebcam();
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const runCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Capture the frame when countdown hits null after being active
  const hasFiredRef = useRef(false);
  useEffect(() => {
    if (countdown === null && isCapturing && !hasFiredRef.current) {
      hasFiredRef.current = true;
      const frame = captureFrame();
      if (frame) onCapture(frame);
    }
    if (!isCapturing) {
      hasFiredRef.current = false;
    }
  }, [countdown, isCapturing, captureFrame, onCapture]);

  useEffect(() => {
    if (isCapturing && countdown === null && !hasFiredRef.current) {
      runCountdown();
    }
    if (!isCapturing) {
      clearInterval(countdownRef.current!);
      setCountdown(null);
    }
  }, [isCapturing, countdown, runCountdown]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video w-full max-w-md mx-auto shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        muted
        playsInline
      />

      {permissionStatus === "denied" && <PermissionDeniedOverlay />}
      {permissionStatus === "error" && <ErrorOverlay />}
      {countdown !== null && <CountdownOverlay count={countdown} />}
    </div>
  );
};

const CountdownOverlay = ({ count }: { count: number }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <span className="text-8xl font-black text-white drop-shadow-lg animate-ping-once">
      {count}
    </span>
  </div>
);

const PermissionDeniedOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-3 p-6 text-center">
    <span className="text-4xl">🚫</span>
    <p className="text-white font-semibold">Camera access denied</p>
    <p className="text-slate-400 text-sm">
      Please allow camera access in your browser settings and refresh the page.
    </p>
  </div>
);

const ErrorOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-3 p-6 text-center">
    <span className="text-4xl">⚠️</span>
    <p className="text-white font-semibold">Camera unavailable</p>
    <p className="text-slate-400 text-sm">No camera found or an error occurred.</p>
  </div>
);

export default WebcamCapture;
