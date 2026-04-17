"use client";

/**
 * FeedbackPanel — renders three expandable channel feedback sections.
 *
 * Pure presentational component. Receives structured feedback as props
 * and renders three dropdowns: Hand Shape, Facial Expression, Body Posture.
 * Each has a green (correct) or red (incorrect) color indicator.
 * No internal API calls. Manages only its own expand/collapse UI state.
 */

import { useState } from "react";
import type { FeedbackResponse, ChannelFeedback } from "@/types";

interface FeedbackPanelProps {
  feedback: FeedbackResponse;
}

interface ChannelRow {
  label: string;
  data: ChannelFeedback;
  icon: string;
}

const FeedbackPanel = ({ feedback }: FeedbackPanelProps) => {
  const channels: ChannelRow[] = [
    { label: "Hand Shape", data: feedback.hand, icon: "🤚" },
    { label: "Facial Expression", data: feedback.face, icon: "😐" },
    { label: "Body Posture", data: feedback.body, icon: "🧍" },
  ];

  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
        Feedback
      </h3>
      {channels.map((channel) => (
        <ChannelAccordion key={channel.label} channel={channel} />
      ))}
    </div>
  );
};

interface ChannelAccordionProps {
  channel: ChannelRow;
}

const ChannelAccordion = ({ channel }: ChannelAccordionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { label, data, icon } = channel;

  return (
    <div
      className={[
        "rounded-xl border overflow-hidden transition-all",
        data.correct
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-red-500/40 bg-red-500/10",
      ].join(" ")}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-white text-sm">{label}</span>
          <StatusBadge correct={data.correct} />
        </div>
        <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-slate-300 leading-relaxed">{data.feedback}</p>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ correct }: { correct: boolean }) => (
  <span
    className={[
      "text-xs font-semibold px-2 py-0.5 rounded-full",
      correct
        ? "bg-emerald-500/20 text-emerald-300"
        : "bg-red-500/20 text-red-300",
    ].join(" ")}
  >
    {correct ? "✓ Correct" : "✗ Needs work"}
  </span>
);

export default FeedbackPanel;
