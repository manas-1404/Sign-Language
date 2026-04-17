"use client";

/**
 * WebcamCapture — live webcam preview with countdown, capture flash, and
 * optional background replacement.
 *
 * Responsibilities:
 *   - Start/stop the camera based on isCameraOn prop
 *   - Optionally composite person over a neutral background via MediaPipe
 *   - Count down 3→2→1 when isCapturing is true, then take the photo
 *   - Show a "photo taken" flash so the user knows they can relax
 *   - Emit the composited (or raw) base64 JPEG via onCapture
 *
 * Does NOT call the API. Does NOT manage lesson state.
 */

import { useEffect, useRef, useState } from "react";
import { useWebcam } from "@/hooks/useWebcam";
import { useBackgroundReplacement } from "@/hooks/useBackgroundReplacement";

interface WebcamCaptureProps {
  isCameraOn: boolean;
  onToggleCamera: () => void;
  onCapture: (imageBase64: string) => void;
  isCapturing: boolean;
}

const COUNTDOWN_SECONDS = 3;

const WebcamCapture = ({ isCameraOn, onToggleCamera, onCapture, isCapturing }: WebcamCaptureProps) => {
  const { videoRef, permissionStatus, startCamera, stopCamera, captureFrame: captureRaw } = useWebcam();
  const [bgEnabled, setBgEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  const { canvasRef, isModelLoading, captureFrame: captureComposited } =
    useBackgroundReplacement(videoRef, bgEnabled && isCameraOn);

  // Active capture function: composited canvas when bg is on, raw video when off.
  const activeCaptureRef = useRef(captureRaw);
  useEffect(() => {
    activeCaptureRef.current = bgEnabled && !isModelLoading ? captureComposited : captureRaw;
  }, [bgEnabled, isModelLoading, captureComposited, captureRaw]);

  const onCaptureRef = useRef(onCapture);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);

  // Start or stop the camera stream based on isCameraOn.
  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
      setCountdown(null);
      setPhotoTaken(false);
    }
  }, [isCameraOn, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Single effect owns the full countdown → capture → flash sequence.
  useEffect(() => {
    if (!isCapturing) {
      setCountdown(null);
      setPhotoTaken(false);
      return;
    }

    let count = COUNTDOWN_SECONDS;
    setCountdown(count);
    setPhotoTaken(false);

    const tick = setInterval(() => {
      count -= 1;
      if (count > 0) { setCountdown(count); return; }

      clearInterval(tick);
      setCountdown(null);

      const frame = activeCaptureRef.current();
      if (frame) {
        setPhotoTaken(true);
        onCaptureRef.current(frame);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [isCapturing]);

  // Auto-hide the "photo taken" flash after 2.5 seconds.
  useEffect(() => {
    if (!photoTaken) return;
    const timer = setTimeout(() => setPhotoTaken(false), 2500);
    return () => clearTimeout(timer);
  }, [photoTaken]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video shadow-2xl">
        {isCameraOn ? (
          <>
            {/* Raw video — always rendered so captureRaw works; hidden when bg is on */}
            <video
              ref={videoRef}
              className={[
                "absolute inset-0 w-full h-full object-cover scale-x-[-1]",
                bgEnabled && !isModelLoading ? "invisible" : "visible",
              ].join(" ")}
              muted
              playsInline
            />

            {/* Composited canvas — shown only when background replacement is active */}
            {bgEnabled && (
              <canvas
                ref={canvasRef}
                className={[
                  "absolute inset-0 w-full h-full object-cover scale-x-[-1]",
                  isModelLoading ? "invisible" : "visible",
                ].join(" ")}
              />
            )}

            {isModelLoading && <ModelLoadingOverlay />}
            {permissionStatus === "denied" && <PermissionDeniedOverlay />}
            {permissionStatus === "error" && <ErrorOverlay />}
            {countdown !== null && <CountdownOverlay count={countdown} />}
            {photoTaken && <PhotoTakenOverlay />}
          </>
        ) : (
          <CameraOffPlaceholder />
        )}
      </div>

      <div className="flex gap-2">
        <CameraToggleButton isCameraOn={isCameraOn} onToggle={onToggleCamera} />
        <BgToggleButton
          enabled={bgEnabled}
          loading={isModelLoading}
          cameraOn={isCameraOn}
          onToggle={() => setBgEnabled((prev) => !prev)}
        />
      </div>
    </div>
  );
};

// ─── Overlays ────────────────────────────────────────────────────────────────

const CountdownOverlay = ({ count }: { count: number }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm gap-3">
    <p className="text-slate-300 text-sm font-medium uppercase tracking-widest">
      Hold your sign…
    </p>
    <span className="text-9xl font-black text-white drop-shadow-lg leading-none">
      {count}
    </span>
  </div>
);

const PhotoTakenOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-sm gap-3 border-4 border-emerald-400/60 rounded-2xl">
    <span className="text-5xl">📸</span>
    <p className="text-emerald-300 font-bold text-lg">Photo taken!</p>
    <p className="text-slate-300 text-sm">You can relax now — analyzing…</p>
  </div>
);

const ModelLoadingOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 gap-3">
    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    <p className="text-slate-300 text-sm">Loading background model…</p>
  </div>
);

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

// ─── Control buttons ──────────────────────────────────────────────────────────

interface CameraToggleButtonProps {
  isCameraOn: boolean;
  onToggle: () => void;
}

const CameraToggleButton = ({ isCameraOn, onToggle }: CameraToggleButtonProps) => (
  <button
    onClick={onToggle}
    className={[
      "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
      isCameraOn
        ? "bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 border border-slate-600 hover:border-red-800"
        : "bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600",
    ].join(" ")}
  >
    <span>{isCameraOn ? "⏹" : "▶"}</span>
    {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
  </button>
);

interface BgToggleButtonProps {
  enabled: boolean;
  loading: boolean;
  cameraOn: boolean;
  onToggle: () => void;
}

const BgToggleButton = ({ enabled, loading, cameraOn, onToggle }: BgToggleButtonProps) => (
  <button
    onClick={onToggle}
    disabled={!cameraOn}
    title={!cameraOn ? "Turn on camera first" : enabled ? "Disable background replacement" : "Replace background with neutral gray"}
    className={[
      "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border",
      !cameraOn
        ? "bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed"
        : enabled
          ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/50"
          : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600",
    ].join(" ")}
  >
    {loading ? (
      <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    ) : (
      <span>🖼</span>
    )}
    BG
  </button>
);

export default WebcamCapture;
