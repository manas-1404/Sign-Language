"use client";

/**
 * useBackgroundReplacement — real-time person segmentation and background swap.
 *
 * Uses MediaPipe Tasks Vision (selfie segmenter) to detect foreground pixels
 * and replace the background with a solid neutral color on every animation frame.
 * The model WASM runtime is loaded from CDN on first use (lazy — only when enabled).
 *
 * Returns a canvas ref that shows the composited feed and a captureFrame function
 * that reads from that canvas. When disabled, both are null/no-op.
 */

import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import type { ImageSegmenter as ImageSegmenterType } from "@mediapipe/tasks-vision";

/** Neutral light-gray background — maximises contrast for hand/face/body visibility. */
const BACKGROUND_COLOR = { r: 241, g: 245, b: 249 }; // slate-100

const MEDIAPIPE_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const SELFIE_SEGMENTER_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

interface UseBackgroundReplacementReturn {
  /** Canvas showing person composited over neutral background. Null when disabled. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** True while the MediaPipe model is still downloading / initialising. */
  isModelLoading: boolean;
  /** Capture a JPEG frame from the composited canvas. */
  captureFrame: () => string | null;
}

export const useBackgroundReplacement = (
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): UseBackgroundReplacementReturn => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmenterRef = useRef<ImageSegmenterType | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  // Lazily load the MediaPipe model the first time the toggle is switched on.
  useEffect(() => {
    if (!enabled || segmenterRef.current) return;

    let cancelled = false;
    setIsModelLoading(true);

    const load = async () => {
      const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
      if (cancelled) return;

      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      if (cancelled) return;

      const segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: SELFIE_SEGMENTER_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });

      if (!cancelled) {
        segmenterRef.current = segmenter;
        setIsModelLoading(false);
      }
    };

    load().catch(() => !cancelled && setIsModelLoading(false));
    return () => { cancelled = true; };
  }, [enabled]);

  // Start / stop the compositing animation loop.
  useEffect(() => {
    if (!enabled || !segmenterRef.current) return;

    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const segmenter = segmenterRef.current;

      if (video && canvas && segmenter && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        compositeFrame(video, canvas, segmenter);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, videoRef, isModelLoading]);

  const captureFrame = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  return { canvasRef, isModelLoading, captureFrame };
};

/** Segment the video frame and composite person pixels over the neutral background. */
const compositeFrame = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  segmenter: ImageSegmenterType,
): void => {
  const { videoWidth: w, videoHeight: h } = video;
  if (w === 0 || h === 0) return;

  canvas.width = w;
  canvas.height = h;

  const result = segmenter.segmentForVideo(video, performance.now());
  const mask = result.categoryMask;
  if (!mask) { return; }

  // Read pixel data BEFORE calling mask.close() — getAsUint8Array returns a
  // view into WASM memory that becomes invalid after close().
  const maskPixels = mask.getAsUint8Array();

  // Draw the raw video frame to an offscreen canvas to get pixel data.
  const offscreen = getOffscreenCanvas(w, h);
  const offCtx = offscreen.getContext("2d")!;
  offCtx.drawImage(video, 0, 0, w, h);
  const imageData = offCtx.getImageData(0, 0, w, h);

  // In the selfie segmenter model: category 0 = person, non-zero = background.
  // Replace background pixels with the neutral color; leave person pixels as-is.
  const { r, g, b } = BACKGROUND_COLOR;
  for (let i = 0; i < maskPixels.length; i++) {
    if (maskPixels[i] !== 0) {
      imageData.data[i * 4] = r;
      imageData.data[i * 4 + 1] = g;
      imageData.data[i * 4 + 2] = b;
    }
  }

  // Must close after we're done reading — frees the WASM heap allocation.
  mask.close();

  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
};

let _offscreenCanvas: HTMLCanvasElement | null = null;

/** Return a reusable offscreen canvas, resizing if dimensions changed. */
const getOffscreenCanvas = (w: number, h: number): HTMLCanvasElement => {
  if (!_offscreenCanvas) _offscreenCanvas = document.createElement("canvas");
  _offscreenCanvas.width = w;
  _offscreenCanvas.height = h;
  return _offscreenCanvas;
};
