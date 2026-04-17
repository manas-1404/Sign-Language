"use client";

/**
 * useWebcam — encapsulates all webcam access logic.
 *
 * Returns a ref for the video element, a capture function that extracts
 * a base64 JPEG still frame, and the current permission status.
 * Does not manage lesson state and does not call the API.
 */

import { useRef, useState, useCallback } from "react";
import type { WebcamPermissionStatus } from "@/types";

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  permissionStatus: WebcamPermissionStatus;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => string | null;
}

export const useWebcam = (): UseWebcamReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<WebcamPermissionStatus>("idle");

  const startCamera = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      setPermissionStatus("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const isDenied = err instanceof DOMException && err.name === "NotAllowedError";
      setPermissionStatus(isDenied ? "denied" : "error");
    }
  }, []);

  const stopCamera = useCallback((): void => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  return { videoRef, permissionStatus, startCamera, stopCamera, captureFrame };
};
