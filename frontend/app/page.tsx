/**
 * Home page — product intro and tier selection.
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center space-y-10">
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
          <FeatureCard icon="🤚" title="Hand Shape" description="AI evaluates finger positions and handshape accuracy." />
          <FeatureCard icon="😐" title="Facial Grammar" description="Eyebrow position and non-manual markers evaluated as ASL grammar." />
          <FeatureCard icon="🧍" title="Body Posture" description="Upper body orientation and arm placement feedback." />
        </section>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Choose your practice tier</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <TierCard
              tier={1}
              title="Individual Signs"
              description="Learn 11 foundational ASL signs one at a time. 2-second recordings, 4 frames."
              href="/practice-sign/tier-1"
              colorClass="border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-600/20"
              badgeClass="bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
              active
            />
            <TierCard
              tier={2}
              title="Short Phrases"
              description="Practice 10 multi-sign phrases. 3-second recordings, 8 frames."
              href="/practice-sign/tier-2"
              colorClass="border-violet-500/50 hover:border-violet-400 hover:bg-violet-600/20"
              badgeClass="bg-violet-600/30 text-violet-300 border-violet-500/40"
              active
            />
            <TierCard
              tier={3}
              title="ASL Grammar"
              description="Sustained non-manual markers across full yes/no questions."
              href="#"
              colorClass="border-slate-700 opacity-50 cursor-not-allowed"
              badgeClass="bg-slate-700/50 text-slate-500 border-slate-600"
              active={false}
            />
          </div>
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

interface TierCardProps {
  tier: number;
  title: string;
  description: string;
  href: string;
  colorClass: string;
  badgeClass: string;
  active: boolean;
}

const TierCard = ({ tier, title, description, href, colorClass, badgeClass, active }: TierCardProps) => {
  const content = (
    <div className={`rounded-2xl bg-white/5 border p-6 space-y-3 text-left transition-colors ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest ${badgeClass}`}>
          Tier {tier}
        </span>
        {!active && (
          <span className="text-xs text-slate-500 font-medium">Coming Soon</span>
        )}
      </div>
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      {active && (
        <p className="text-indigo-400 text-sm font-medium">Start practicing →</p>
      )}
    </div>
  );

  return active ? <Link href={href}>{content}</Link> : <div>{content}</div>;
};
