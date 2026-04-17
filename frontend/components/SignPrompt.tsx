"use client";

/**
 * SignPrompt — displays the current sign name and its description.
 *
 * Pure presentational component. Receives sign metadata as props
 * and renders nothing else. No internal state, no API calls.
 */

import type { SignMetadata } from "@/types";

interface SignPromptProps {
  sign: SignMetadata;
  signIndex: number;
  totalSigns: number;
}

const SignPrompt = ({ sign, signIndex, totalSigns }: SignPromptProps) => (
  <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-center">
    <p className="text-sm font-medium text-indigo-300 uppercase tracking-widest mb-1">
      Sign {signIndex + 1} of {totalSigns}
    </p>
    <h2 className="text-4xl font-bold text-white mb-3">{sign.name}</h2>
    <p className="text-slate-300 text-base leading-relaxed max-w-sm mx-auto">
      {sign.description}
    </p>
  </div>
);

export default SignPrompt;
