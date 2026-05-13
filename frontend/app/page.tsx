/**
 * Home page — product marketing, feature overview, and tier selection.
 */

import Link from "next/link";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030711] text-white overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <PoweredBy />
        <HowItWorks />
        <AnalysisChannels />
        <PracticeTiers />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const Nav = () => (
  <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/[0.05] bg-[#030711]/85 backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 text-[15px]">
        🤟
      </div>
      <span className="font-bold tracking-tight text-[15px]">SignCompanion</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
      <a href="#how-it-works" className="hover:text-white transition-colors duration-150">How it works</a>
      <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
      <a href="#tiers" className="hover:text-white transition-colors duration-150">Practice tiers</a>
    </div>
    <Link
      href="/practice-sign/tier-1"
      className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition-all duration-150 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
    >
      Start Practicing →
    </Link>
  </nav>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-24 pb-20 px-6 md:px-12 overflow-hidden">
    {/* Background orbs */}
    <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] rounded-full bg-violet-600/[0.07] blur-[140px] pointer-events-none animate-pulse-glow" />
    <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.06] blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-violet-900/[0.12] blur-[100px] pointer-events-none" />

    <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
      {/* Left: Copy */}
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-400 uppercase tracking-[0.12em]">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-blink" />
          Real-time AI feedback
        </div>

        <h1 className="text-[52px] md:text-[64px] lg:text-[72px] font-black tracking-tight leading-[1.03]">
          Learn ASL with AI that{" "}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 animate-gradient-x">
              sees everything
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-violet-400/60 to-indigo-400/60 blur-sm" />
          </span>
          {" "}you miss
        </h1>

        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-[480px]">
          Practice ASL via your webcam. Three AI agents analyze your hand shape, facial grammar,
          and body posture <strong className="text-slate-200">simultaneously</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/practice-sign/tier-1"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-white text-[15px] transition-all duration-200 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Tier 1 — Individual Signs
            <ArrowRight />
          </Link>
          <Link
            href="/practice-sign/tier-2"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] font-semibold text-slate-300 hover:text-white text-[15px] transition-all duration-200"
          >
            Explore Tier 2 — Phrases
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 pt-2">
          {[
            { value: "21", label: "Signs & phrases" },
            { value: "3", label: "AI agents" },
            { value: "<2s", label: "Feedback time" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-8">
              {i > 0 && <div className="w-px h-8 bg-white/10" />}
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Product mockup */}
      <ProductMockup />
    </div>
  </section>
);

// ─── Product Mockup ───────────────────────────────────────────────────────────

const ProductMockup = () => (
  <div className="relative">
    {/* Outer glow */}
    <div className="absolute -inset-8 bg-violet-600/15 blur-3xl rounded-full animate-pulse-glow pointer-events-none" />
    <div className="absolute -inset-8 bg-indigo-600/10 blur-2xl rounded-full animate-pulse-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />

    {/* Browser chrome */}
    <div className="relative bg-[#0d1117] rounded-2xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Browser top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/[0.05]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-[#21262d] rounded-md px-3 py-1.5 text-[11px] text-slate-500 font-mono text-center">
            sign-companion.vercel.app/practice-sign/tier-1
          </div>
        </div>
      </div>

      {/* App content */}
      <div className="p-5 bg-[#0d1117]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Tier 1 · Sign 3 of 10</p>
            <p className="text-white font-bold text-lg leading-tight mt-0.5">Today</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
              <span className="text-[10px] text-emerald-400 font-semibold">LIVE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Video area */}
          <div className="flex-1 min-w-0">
            <div className="relative aspect-video bg-[#0a0f1a] rounded-xl overflow-hidden border border-white/[0.05]">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              {/* Gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-[#0a0f1a] to-slate-900/50" />

              {/* Scan line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400/70 to-transparent animate-scanline pointer-events-none" />

              {/* Corner viewfinder brackets */}
              {[
                "top-3 left-3 border-l-2 border-t-2",
                "top-3 right-3 border-r-2 border-t-2",
                "bottom-3 left-3 border-l-2 border-b-2",
                "bottom-3 right-3 border-r-2 border-b-2",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 border-violet-400/60 ${cls}`} />
              ))}

              {/* Sign label watermark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-white/[0.06] tracking-[0.15em] uppercase select-none">TODAY</span>
              </div>

              {/* Landmark dots — simulated hand tracking */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 158" fill="none">
                {/* Wrist */}
                <circle cx="140" cy="130" r="3" fill="rgba(139,92,246,0.7)" />
                {/* Palm knuckles */}
                <circle cx="118" cy="105" r="2.5" fill="rgba(139,92,246,0.6)" />
                <circle cx="130" cy="100" r="2.5" fill="rgba(139,92,246,0.6)" />
                <circle cx="143" cy="98" r="2.5" fill="rgba(139,92,246,0.6)" />
                <circle cx="155" cy="100" r="2.5" fill="rgba(139,92,246,0.6)" />
                <circle cx="165" cy="105" r="2.5" fill="rgba(139,92,246,0.6)" />
                {/* Index finger */}
                <circle cx="115" cy="90" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="112" cy="76" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="110" cy="64" r="2.5" fill="rgba(167,139,250,0.9)" />
                {/* Middle finger */}
                <circle cx="128" cy="85" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="127" cy="70" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="126" cy="57" r="2.5" fill="rgba(167,139,250,0.9)" />
                {/* Ring finger */}
                <circle cx="142" cy="84" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="142" cy="69" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="142" cy="56" r="2.5" fill="rgba(167,139,250,0.9)" />
                {/* Pinky */}
                <circle cx="156" cy="86" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="158" cy="73" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="160" cy="63" r="2.5" fill="rgba(167,139,250,0.9)" />
                {/* Thumb */}
                <circle cx="168" cy="110" r="2" fill="rgba(167,139,250,0.7)" />
                <circle cx="176" cy="100" r="2.5" fill="rgba(167,139,250,0.9)" />
                {/* Connecting lines */}
                <line x1="140" y1="130" x2="118" y2="105" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="118" y1="105" x2="115" y2="90" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="115" y1="90" x2="112" y2="76" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="112" y1="76" x2="110" y2="64" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="130" y1="100" x2="128" y2="85" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="128" y1="85" x2="127" y2="70" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="127" y1="70" x2="126" y2="57" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="143" y1="98" x2="142" y2="84" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="142" y1="84" x2="142" y2="69" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="142" y1="69" x2="142" y2="56" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="155" y1="100" x2="156" y2="86" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="156" y1="86" x2="158" y2="73" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
                <line x1="158" y1="73" x2="160" y2="63" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />
              </svg>

              {/* REC badge */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-blink" />
                <span className="text-[9px] text-white font-mono tracking-widest">REC</span>
              </div>

              {/* Countdown */}
              <div className="absolute bottom-2.5 inset-x-0 text-center">
                <span className="text-[10px] text-white/60 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Capturing in <span className="text-white font-bold">2s</span>…
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full w-[30%] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
              </div>
              <span className="text-[10px] text-slate-500 tabular-nums">3 / 10</span>
            </div>
          </div>

          {/* Analysis panel */}
          <div className="w-44 flex-shrink-0 space-y-2.5">
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.12em] font-semibold">AI Analysis</p>

            <MockFeedbackCard
              label="Hand Shape"
              correct={true}
              detail="Both hands bent correctly. Drop is crisp."
            />
            <MockFeedbackCard
              label="Facial Grammar"
              correct={false}
              detail="Raise brows — required for yes/no questions."
            />
            <MockFeedbackCard
              label="Body Posture"
              correct={true}
              detail="Upright torso, arms level. Well done."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface MockFeedbackCardProps {
  label: string;
  correct: boolean;
  detail: string;
}

const MockFeedbackCard = ({ label, correct, detail }: MockFeedbackCardProps) => (
  <div
    className={`rounded-xl p-2.5 border ${
      correct
        ? "bg-emerald-950/40 border-emerald-500/20"
        : "bg-rose-950/40 border-rose-500/25"
    }`}
  >
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] text-slate-200 font-semibold">{label}</span>
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          correct ? "bg-emerald-500/20" : "bg-rose-500/20"
        }`}
      >
        {correct ? (
          <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-2.5 h-2.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
    </div>
    <p className="text-[9px] text-slate-400 leading-relaxed">{detail}</p>
  </div>
);

// ─── Powered By ───────────────────────────────────────────────────────────────

const PoweredBy = () => (
  <div className="border-y border-white/[0.05] py-5 px-6 md:px-12">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
      <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold shrink-0">Powered by</p>
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {[
          { name: "Gemma 4", sub: "Vision LLM" },
          { name: "Modal", sub: "Serverless GPU" },
          { name: "Next.js 16", sub: "Frontend" },
          { name: "Vercel", sub: "Hosting" },
          { name: "LangGraph", sub: "Agent orchestration" },
        ].map((tech) => (
          <div key={tech.name} className="text-center">
            <p className="text-sm font-semibold text-slate-300">{tech.name}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{tech.sub}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── How It Works ─────────────────────────────────────────────────────────────

const HowItWorks = () => (
  <section id="how-it-works" className="py-28 px-6 md:px-12">
    <div className="max-w-7xl mx-auto">
      <SectionLabel>How it works</SectionLabel>
      <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-6">
        Three steps to real feedback
      </h2>
      <div className="grid md:grid-cols-3 gap-6 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-gradient-to-r from-violet-500/40 via-indigo-500/40 to-violet-500/40" />

        {[
          {
            step: "01",
            title: "Choose your tier",
            description: "Pick Tier 1 for individual signs or Tier 2 for multi-sign phrases.",
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            ),
          },
          {
            step: "02",
            title: "Sign into your webcam",
            description: "Position yourself, a countdown runs, and frames are captured and sent to the AI.",
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ),
          },
          {
            step: "03",
            title: "Get multi-channel feedback",
            description: "Three specialist agents run in parallel. Feedback arrives in under 2 seconds.",
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            ),
          },
        ].map((item, i) => (
          <div key={i} className="relative">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-200">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400">
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] text-violet-500 font-mono font-bold tracking-widest mb-1">{item.step}</p>
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Analysis Channels ────────────────────────────────────────────────────────

const CHANNELS = [
  {
    label: "Hand Shape",
    note: "Is my hand formed correctly?",
    color: "text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/[0.06]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m0 0l-3.45-3.45" />
      </svg>
    ),
    result: { correct: true, feedback: "Fingers flat, thumb extended correctly." },
  },
  {
    label: "Facial Grammar",
    note: "Eyebrow raises and mouth morphemes are ASL grammar — not decoration.",
    color: "text-fuchsia-400",
    border: "border-fuchsia-500/20",
    bg: "bg-fuchsia-500/[0.06]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    result: { correct: false, feedback: "Raise your eyebrows — required for yes/no questions." },
  },
  {
    label: "Body Posture",
    note: "Is my torso upright and my arms in the right position?",
    color: "text-indigo-400",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/[0.06]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    result: { correct: true, feedback: "Upright torso, arms at chest height." },
  },
] as const;

const AnalysisChannels = () => (
  <section id="features" className="py-28 px-6 md:px-12 bg-gradient-to-b from-transparent via-violet-950/[0.06] to-transparent">
    <div className="max-w-7xl mx-auto">
      <SectionLabel>The AI engine</SectionLabel>
      <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-4">
        Three agents. One verdict.
      </h2>
      <p className="text-slate-400 mb-14 max-w-md">
        Each agent returns one thing: correct or not, and why.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {CHANNELS.map((ch) => (
          <div key={ch.label} className={`rounded-2xl border bg-white/[0.02] ${ch.border} p-6 space-y-5`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${ch.bg} border ${ch.border} flex items-center justify-center ${ch.color}`}>
                {ch.icon}
              </div>
              <span className={`font-bold text-white`}>{ch.label}</span>
            </div>

            <p className="text-base text-slate-400">{ch.note}</p>

            {/* Sample output */}
            <div className={`rounded-xl border ${ch.result.correct ? "bg-emerald-950/40 border-emerald-500/20" : "bg-rose-950/40 border-rose-500/25"} p-3.5`}>
              <div className="flex items-center gap-2 mb-1.5">
                {ch.result.correct ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${ch.result.correct ? "text-emerald-400" : "text-rose-400"}`}>
                  {ch.result.correct ? "Correct" : "Needs work"}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{ch.result.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Practice Tiers ───────────────────────────────────────────────────────────

const PracticeTiers = () => (
  <section id="tiers" className="py-28 px-6 md:px-12">
    <div className="max-w-7xl mx-auto">
      <SectionLabel>Practice tiers</SectionLabel>
      <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-14">
        Start simple. Progress naturally.
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        <TierCard
          tier="Tier 1"
          title="Individual Signs"
          description="Learn 10 foundational ASL signs. Practice one at a time, retry as many times as you like."
          href="/practice-sign/tier-1"
          accentClass="from-violet-500 to-violet-600"
          badgeClass="bg-violet-500/10 border-violet-500/20 text-violet-400"
          borderClass="hover:border-violet-500/30"
          active
        />
        <TierCard
          tier="Tier 2"
          title="Short Phrases"
          description="Practice 10 multi-sign sequences in ASL word order — structurally distinct from English."
          href="/practice-sign/tier-2"
          accentClass="from-indigo-500 to-indigo-600"
          badgeClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          borderClass="hover:border-indigo-500/30"
          active
        />
        <TierCard
          tier="Tier 3"
          title="ASL Grammar"
          description="Full yes/no questions with sustained non-manual markers. Coming once you've nailed Tiers 1 and 2."
          href="#"
          accentClass="from-slate-600 to-slate-700"
          badgeClass="bg-slate-700/30 border-slate-600/30 text-slate-500"
          borderClass=""
          active={false}
        />
      </div>
    </div>
  </section>
);

interface TierCardProps {
  tier: string;
  title: string;
  description: string;
  href: string;
  accentClass: string;
  badgeClass: string;
  borderClass: string;
  active: boolean;
}

const TierCard = ({ tier, title, description, href, accentClass, badgeClass, borderClass, active }: TierCardProps) => {
  const inner = (
    <div
      className={`relative h-full rounded-2xl bg-white/[0.02] border border-white/[0.07] p-7 flex flex-col gap-5 transition-all duration-200 ${
        active ? `hover:bg-white/[0.04] ${borderClass}` : "opacity-50 cursor-not-allowed"
      }`}
    >
      <div className={`absolute top-0 inset-x-0 h-px rounded-t-2xl bg-gradient-to-r ${accentClass} opacity-60`} />

      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
          {tier}
        </span>
        {!active && (
          <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Coming Soon</span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {active && (
        <div className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${accentClass}`}>
          Start practicing →
        </div>
      )}
    </div>
  );

  return active ? <Link href={href} className="block h-full">{inner}</Link> : <div>{inner}</div>;
};

// ─── Closing CTA ──────────────────────────────────────────────────────────────

const ClosingCTA = () => (
  <section className="py-28 px-6 md:px-12">
    <div className="max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-br from-violet-950/60 to-indigo-950/60 border border-violet-500/20 p-12 md:p-20 overflow-hidden text-center">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-[80px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-400 uppercase tracking-[0.12em] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-blink" />
            No account required
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Ready to start signing?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-md mx-auto">
            Open your webcam. Pick a sign. Get feedback that goes deeper.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/practice-sign/tier-1"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white text-base transition-all duration-200 shadow-2xl shadow-violet-500/40 hover:-translate-y-0.5 hover:shadow-violet-500/60"
            >
              Start with Tier 1 — Individual Signs
              <ArrowRight />
            </Link>
            <Link
              href="/practice-sign/tier-2"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] font-semibold text-slate-300 hover:text-white text-base transition-all duration-200"
            >
              Jump to Tier 2 — Phrases
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="border-t border-white/[0.05] px-6 md:px-12 py-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px]">
          🤟
        </div>
        <span className="font-semibold text-slate-500">SignCompanion</span>
      </div>
      <p>
        Powered by{" "}
        <span className="text-slate-400">Gemma 4</span> ·{" "}
        <span className="text-slate-400">Modal GPU infrastructure</span> ·{" "}
        <span className="text-slate-400">LangGraph multi-agent orchestration</span>
      </p>
      <div className="flex items-center gap-6">
        <Link href="/practice-sign/tier-1" className="hover:text-slate-400 transition-colors">Tier 1</Link>
        <Link href="/practice-sign/tier-2" className="hover:text-slate-400 transition-colors">Tier 2</Link>
      </div>
    </div>
  </footer>
);

// ─── Shared helpers ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-500">{children}</p>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
