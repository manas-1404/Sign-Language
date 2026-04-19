"use client";

/**
 * WebcamCapture — live webcam preview with two-phase capture flow.
 *
 * Responsibilities:
 *   - Start/stop the camera based on isCameraOn prop
 *   - Optionally composite person over a neutral background via MediaPipe
 *   - When isCapturing becomes true, run a 3-second pre-countdown ("get ready")
 *     followed by interval-based frame sampling (FRAME_COUNT frames, FRAME_INTERVAL_MS apart)
 *   - Emit the ordered base64 JPEG frame array via onCapture when done
 *
 * Does NOT call the API. Does NOT manage lesson state.
 */

import { useEffect, useRef, useState } from "react";
import { useWebcam } from "@/hooks/useWebcam";
import { useBackgroundReplacement } from "@/hooks/useBackgroundReplacement";
import type { TierVideoSettings } from "@/constants/config";

interface WebcamCaptureProps {
  isCameraOn: boolean;
  onToggleCamera: () => void;
  onCapture: (frames: string[]) => void;
  isCapturing: boolean;
  tierConfig: TierVideoSettings;
  className?: string;
}

const PRE_COUNTDOWN_SECONDS = 3;
type CapturePhase = "idle" | "pre-countdown" | "recording";

const WebcamCapture = ({ isCameraOn, onToggleCamera, onCapture, isCapturing, tierConfig, className }: WebcamCaptureProps) => {
  const { videoRef, permissionStatus, startCamera, stopCamera, captureFrame: captureRaw } = useWebcam();
  const [bgEnabled, setBgEnabled] = useState(false);
  const [capturePhase, setCapturePhase] = useState<CapturePhase>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingDone, setRecordingDone] = useState(false);

  const { canvasRef, isModelLoading, captureFrame: captureComposited } =
    useBackgroundReplacement(videoRef, bgEnabled && isCameraOn);

  const activeCaptureRef = useRef(captureRaw);
  useEffect(() => {
    activeCaptureRef.current = bgEnabled && !isModelLoading ? captureComposited : captureRaw;
  }, [bgEnabled, isModelLoading, captureComposited, captureRaw]);

  const onCaptureRef = useRef(onCapture);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);

  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
      setCapturePhase("idle");
      setCountdown(null);
      setRecordingProgress(0);
      setRecordingDone(false);
    }
  }, [isCameraOn, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Owns the full two-phase capture sequence: pre-countdown → recording.
  useEffect(() => {
    if (!isCapturing) {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      setCapturePhase("idle");
      setCountdown(null);
      setRecordingProgress(0);
      setRecordingDone(false);
      return;
    }

    // Phase 1: pre-countdown 3 → 2 → 1
    let count = PRE_COUNTDOWN_SECONDS;
    setCapturePhase("pre-countdown");
    setCountdown(count);
    setRecordingDone(false);

    const countdownTick = setInterval(() => {
      count -= 1;
      if (count > 0) { setCountdown(count); return; }

      clearInterval(countdownTick);
      setCountdown(null);

      // Phase 2: interval-based frame capture
      setCapturePhase("recording");
      const frames: string[] = [];
      let frameIndex = 0;

      const captureNext = () => {
        const frame = activeCaptureRef.current();
        if (frame) frames.push(frame);
        frameIndex++;
        setRecordingProgress(frameIndex);

        if (frameIndex >= tierConfig.frameCount) {
          clearInterval(recordIntervalRef.current!);
          recordIntervalRef.current = null;
          setRecordingDone(true);
          onCaptureRef.current(frames);
        }
      };

      captureNext(); // capture frame 0 immediately when recording starts
      recordIntervalRef.current = setInterval(captureNext, tierConfig.frameIntervalMs);
    }, 1000);

    return () => {
      clearInterval(countdownTick);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
    };
  }, [isCapturing]);

  // Auto-clear the "done" flash after 2 seconds.
  useEffect(() => {
    if (!recordingDone) return;
    const timer = setTimeout(() => setRecordingDone(false), 2000);
    return () => clearTimeout(timer);
  }, [recordingDone]);

  return (
    <div className={`flex flex-col gap-2 w-full ${className ?? "max-w-md mx-auto"}`}>
      <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video shadow-2xl">
        {isCameraOn ? (
          <>
            <video
              ref={videoRef}
              className={[
                "absolute inset-0 w-full h-full object-cover scale-x-[-1]",
                bgEnabled && !isModelLoading ? "invisible" : "visible",
              ].join(" ")}
              muted
              playsInline
            />

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
            {capturePhase === "pre-countdown" && countdown !== null && (
              <PreCountdownOverlay count={countdown} />
            )}
            {capturePhase === "recording" && (
              <RecordingOverlay
                progress={recordingProgress}
                total={tierConfig.frameCount}
              />
            )}
            {recordingDone && <RecordingDoneOverlay />}
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

const PreCountdownOverlay = ({ count }: { count: number }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm gap-3">
    <p className="text-slate-300 text-sm font-medium uppercase tracking-widest">
      Get ready to sign…
    </p>
    <span className="text-9xl font-black text-white drop-shadow-lg leading-none">
      {count}
    </span>
  </div>
);

interface RecordingOverlayProps {
  progress: number;
  total: number;
}

const RecordingOverlay = ({ progress, total }: RecordingOverlayProps) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm gap-4">
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
      <p className="text-white font-semibold text-sm uppercase tracking-widest">Recording</p>
    </div>
    <div className="w-40 h-1.5 rounded-full bg-slate-700 overflow-hidden">
      <div
        className="h-full bg-red-500 rounded-full transition-all duration-300"
        style={{ width: `${(progress / total) * 100}%` }}
      />
    </div>
    <p className="text-slate-400 text-xs">
      Frame {progress} / {total}
    </p>
  </div>
);

const RecordingDoneOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-sm gap-3 border-4 border-emerald-400/60 rounded-2xl">
    <p className="text-emerald-300 font-bold text-lg">Recording complete!</p>
    <p className="text-slate-300 text-sm">Analyzing your sign…</p>
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
    <p className="text-white font-semibold">Camera access denied</p>
    <p className="text-slate-400 text-sm">
      Please allow camera access in your browser settings and refresh the page.
    </p>
  </div>
);

const ErrorOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-3 p-6 text-center">
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
