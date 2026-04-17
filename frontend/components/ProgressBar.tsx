"use client";

/**
 * ProgressBar — visual indicator of lesson completion progress.
 *
 * Pure presentational component. Renders a segmented bar where each
 * segment corresponds to one sign in the lesson.
 */

interface ProgressBarProps {
  currentIndex: number;
  totalSigns: number;
}

const ProgressBar = ({ currentIndex, totalSigns }: ProgressBarProps) => {
  const segments = Array.from({ length: totalSigns }, (_, i) => i);

  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {segments.map((i) => (
          <div
            key={i}
            className={[
              "flex-1 h-2 rounded-full transition-all duration-500",
              i < currentIndex
                ? "bg-indigo-400"
                : i === currentIndex
                  ? "bg-indigo-300 animate-pulse"
                  : "bg-white/20",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-1.5 text-right">
        {currentIndex} / {totalSigns} completed
      </p>
    </div>
  );
};

export default ProgressBar;
