"use client";

/**
 * WebcamCapture — live webcam preview with 3-second countdown capture.
 *
 * Responsibilities:
 *   - Start/stop the camera based on the isCameraOn prop
 *   - Display the live feed when on, a placeholder when off
 *   - Run a 3-second countdown when isCapturing becomes true
 *   - Capture a still frame at countdown end and emit it via onCapture
 *
 * Does NOT call the API. Does NOT manage lesson state.
 * Camera on/off state lives in the parent so it can gate the API call.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useWebcam } from "@/hooks/useWebcam";

interface WebcamCaptureProps {
  /** Whether the camera is currently active. Controlled by the parent. */
  isCameraOn: boolean;
  /** Called when the user clicks the camera toggle button. */
  onToggleCamera: () => void;
  /** Called with the base64 JPEG string when the countdown reaches zero. */
  onCapture: (imageBase64: string) => void;
  /** When true the countdown starts automatically. */
  isCapturing: boolean;
}

const COUNTDOWN_SECONDS = 3;

const WebcamCapture = ({ isCameraOn, onToggleCamera, onCapture, isCapturing }: WebcamCaptureProps) => {
  const { videoRef, permissionStatus, startCamera, stopCamera, captureFrame } = useWebcam();
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start or stop the camera stream whenever isCameraOn changes.
  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      clearInterval(countdownRef.current!);
      setCountdown(null);
      stopCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  // Cleanup on unmount.
  useEffect(() => () => stopCamera(), [stopCamera]);

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

  const hasFiredRef = useRef(false);

  // Fire onCapture once the countdown finishes.
  useEffect(() => {
    if (countdown === null && isCapturing && !hasFiredRef.current) {
      hasFiredRef.current = true;
      const frame = captureFrame();
      if (frame) onCapture(frame);
    }
    if (!isCapturing) hasFiredRef.current = false;
  }, [countdown, isCapturing, captureFrame, onCapture]);

  // Kick off the countdown when isCapturing becomes true.
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
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video shadow-2xl">
        {isCameraOn ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              muted
              playsInline
            />
            {permissionStatus === "denied" && <PermissionDeniedOverlay />}
            {permissionStatus === "error" && <ErrorOverlay />}
            {countdown !== null && <CountdownOverlay count={countdown} />}
          </>
        ) : (
          <CameraOffPlaceholder />
        )}
      </div>

      <CameraToggleButton isCameraOn={isCameraOn} onToggle={onToggleCamera} />
    </div>
  );
};

const CameraOffPlaceholder = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
    <p className="text-sm font-medium">Camera is off</p>
    <p className="text-xs text-slate-600">Turn on the camera to start practicing</p>
  </div>
);

interface CameraToggleButtonProps {
  isCameraOn: boolean;
  onToggle: () => void;
}

const CameraToggleButton = ({ isCameraOn, onToggle }: CameraToggleButtonProps) => (
  <button
    onClick={onToggle}
    className={[
      "w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
      isCameraOn
        ? "bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 border border-slate-600 hover:border-red-800"
        : "bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600",
    ].join(" ")}
  >
    <span>{isCameraOn ? "⏹" : "▶"}</span>
    {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
  </button>
);

const CountdownOverlay = ({ count }: { count: number }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <span className="text-8xl font-black text-white drop-shadow-lg">{count}</span>
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
