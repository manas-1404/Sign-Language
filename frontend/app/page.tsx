/**
 * Home page — explains the product and provides a single CTA to /practice-sign.
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <header className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Sign Language
            <span className="block text-indigo-400">Learning Companion</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Practice American Sign Language with real-time AI feedback — powered by{" "}
            <span className="text-indigo-300 font-semibold">Gemma 4</span>.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4 text-left">
          <FeatureCard
            icon="🤚"
            title="Hand Shape"
            description="AI evaluates finger positions and handshape accuracy in real time."
          />
          <FeatureCard
            icon="😐"
            title="Facial Grammar"
            description="Non-manual markers like eyebrow raises are analyzed as ASL grammar, not aesthetics."
          />
          <FeatureCard
            icon="🧍"
            title="Body Posture"
            description="Upper body orientation and arm placement feedback for every sign."
          />
        </section>

        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Practice 10 essential ASL signs via your webcam. Each sign receives simultaneous
            feedback across three independent channels.
          </p>
          <Link
            href="/practice-sign"
            className="inline-block px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-bold text-lg transition-colors shadow-lg shadow-indigo-900/50"
          >
            Start Practicing →
          </Link>
        </div>
      </div>
    </main>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
    <div className="text-2xl">{icon}</div>
    <h3 className="font-semibold text-white">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);
