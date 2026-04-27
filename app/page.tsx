'use client';

// SessionScout landing page.
// Design language mirrors the native app exactly:
//   • Void black (#000000) — Freewrite aesthetic
//   • #E6E6E6 neutral text floating on nothing
//   • Ember orange (#EA612E) for live signals and hero CTA
//   • WaveIcon — replicates the menu-bar sine wave from MenuBarManager.swift exactly
//   • Primary "notify me" button: light fill (#E6E6E6) + dark text → ScoutPrimaryButtonStyle
//   • Inputs: #1A1A1A bg, #2D2D2D border → matches app text fields

import { useState, useEffect, type FormEvent } from 'react';

// ─── Wave path (pre-computed at module load) ──────────────────────────────────
//
// Replicates MenuBarManager.makeWaveImage exactly:
//   • cy = 9 (midY of 18px canvas)
//   • amplitude = 2.5px, period = 10px → ~1.4 cycles in the 2–16 visible range
//   • phase = 0 (neutral start)
//
// Extended from x=-10 to x=26 (one full period either side of the 0–18 viewBox).
// The CSS animation translates by -10px (one period) for a seamless loop.
//
// Uses a plain for-loop rather than Array.from to avoid a webpack minifier bug
// where Array.from's mapping callback gets mangled in the server bundle.

const WAVE_PATH = (() => {
  // 36 unit range / 72 steps = 0.5px per step
  let path = '';
  for (let i = 0; i <= 72; i++) {
    const x = -10 + i * 0.5;
    const y = 9 + 2.5 * Math.sin((x / 10) * 2 * Math.PI);
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
  }
  return path.trimEnd();
})();

// ─── WaveIcon ─────────────────────────────────────────────────────────────────
//
// SVG that exactly reproduces the menu-bar icon:
//   animate=false → static sine (logo/footer usage)
//   animate=true  → scrolling sine at 0.8s/cycle (nav + app mockup LiveDot context)
//
// overflow="hidden" clips the extended path to the 0–18 viewBox, mirroring how
// NSImage(size: NSSize(18,18)) clips the Bezier path in the Swift implementation.

function WaveIcon({ className, animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 18"
      overflow="hidden"
      fill="none"
      aria-hidden
    >
      <g style={animate ? { animation: 'wave-scroll 0.8s linear infinite' } : undefined}>
        <path
          d={WAVE_PATH}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// ─── LiveDot ──────────────────────────────────────────────────────────────────
// Pulsing ember circle — mirrors the app's LiveDot component

function LiveDot() {
  return (
    <span className="relative flex h-[6px] w-[6px] shrink-0" aria-hidden>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-scout-accent opacity-50" />
      <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-scout-accent" />
    </span>
  );
}

// ─── App Mockup ───────────────────────────────────────────────────────────────
// Stylised preview of the active-session view — communicates the product at a glance.
// Every element maps directly to a component in the Swift codebase:
//   LiveDot → LiveDot.swift
//   Timer   → RunningView 72pt ultra-light monospaced clock
//   Rail    → ProgressRail (2px, accent fill)
//   Tasks   → TaskRow (circle indicator + strike-through)
//   Footer  → bottomBar (1px scoutDim separator + muted controls)

function AppMockup() {
  const [seconds, setSeconds] = useState(2833); // starts at 0:47:13

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const clock = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-lg mx-auto bg-scout-surface border border-scout-dim rounded-2xl p-8 select-none">

      {/* Session header */}
      <div className="flex items-center gap-2.5 mb-8">
        <LiveDot />
        <span className="text-scout-muted text-[13px] truncate">
          Working on SessionScout web, landing page
        </span>
      </div>

      {/* Hero clock — 72pt ultra-light monospaced */}
      <div className="font-mono text-[64px] leading-none text-scout-text mb-4" style={{ fontWeight: 100 }}>
        {clock}
      </div>

      {/* Progress rail — 2px, accent fill, 62% of planned duration elapsed */}
      <div className="h-[2px] bg-scout-dim rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-scout-accent rounded-full" style={{ width: '62%' }} />
      </div>

      {/* Task list */}
      <div>
        <MockTask label="Design the landing page" done />
        <MockTask label="Write the copy"          done />
        <MockTask label="Deploy it"                  done={false} />
      </div>

      {/* Bottom bar — 1px scoutDim separator + muted controls */}
      <div className="mt-5 pt-4 border-t border-scout-dim/40 flex items-center justify-between">
        <span className="text-scout-muted text-[12px]">25m · 45m · 1h · Open</span>
        <span className="text-scout-accent text-[12px] font-semibold">Stop</span>
      </div>

    </div>
  );
}

// Single task row — stripped version of TaskRow; circle indicator + strike-through
function MockTask({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 py-[10px]">
      <div className={`
        w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0
        ${done ? 'border-scout-accent bg-scout-accent/10' : 'border-scout-dim'}
      `}>
        {done && (
          <svg className="w-2.5 h-2.5 text-scout-accent" viewBox="0 0 10 8" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 4l3 3 5-6" />
          </svg>
        )}
      </div>
      <span className={`text-[14px] ${done ? 'text-scout-muted line-through decoration-scout-dim' : 'text-scout-text'}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Email Form ───────────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function EmailForm() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setStatus('error');
      setErrMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrMsg('');

    try {
      const res  = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Failed. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <p className="text-scout-muted text-sm">
        ✓ Got it. I&apos;ll ping you when something ships.
      </p>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          disabled={status === 'loading'}
          className="
            flex-1 px-4 py-3 rounded-xl text-sm
            bg-scout-elev border border-scout-dim
            text-scout-text placeholder:text-scout-muted
            outline-none focus:border-scout-muted
            transition-colors duration-150 disabled:opacity-50
          "
        />
        {/* ScoutPrimaryButtonStyle (non-destructive): light fill, dark text */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="
            px-5 py-3 rounded-xl text-sm font-semibold
            bg-scout-text text-scout-void
            hover:opacity-90 active:scale-[0.97]
            transition-all duration-150 disabled:opacity-50 whitespace-nowrap
          "
        >
          {status === 'loading' ? 'Saving…' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && errMsg && (
        <p className="mt-2 text-xs text-red-400/80 pl-1">{errMsg}</p>
      )}
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

// 1px separator — mirrors `Rectangle().fill(Color.scoutDim.opacity(0.35))`
function Divider() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="h-px bg-scout-dim/40" />
    </div>
  );
}

// Uppercase section label — 10pt semibold tracking, mirrors SectionLabel
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-scout-muted text-[10px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  // flex-col so the hero can flex-1 and fill remaining viewport height
  return (
    <main className="min-h-screen bg-scout-void text-scout-text font-sans flex flex-col">

      {/* ── Header ────────────────────────────────────────────────────────────
          No chrome. No border, no bg, no sticky — just the mark and a link,
          same as freewrite.io's raw "repo / windows version" approach.
          The wave animates immediately, signalling the app is live.           */}
      <header className="shrink-0 px-6 lg:px-16 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <WaveIcon className="w-4 h-4 text-scout-accent" animate />
          <span className="text-scout-muted text-sm font-medium">SessionScout</span>
        </div>
        <a
          href="https://github.com/Catafal/SessionScout"
          target="_blank"
          rel="noopener noreferrer"
          className="text-scout-muted hover:text-scout-text text-sm transition-colors duration-150"
        >
          GitHub →
        </a>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────────
          flex-1 fills remaining viewport — no manual height math needed.
          Two-column split: text left, live mockup right.                      */}
      <section className="flex-1 flex items-center px-6 lg:px-16 py-12 lg:py-0">
        <div className="mx-auto max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: headline + sub + form */}
          <div className="flex flex-col gap-6">
            <span className="w-fit inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-scout-dim text-scout-muted text-xs font-medium tracking-wide">
              macOS 14+ · Free · Open Source
            </span>

            <h1 className="text-[52px] lg:text-[68px] font-bold tracking-tight leading-[1.03]">
              What did you<br />
              <span className="text-scout-accent">actually do today?</span>
            </h1>

            <p className="text-scout-muted text-lg max-w-md leading-relaxed">
              Set a goal. Hit start. SessionScout logs every app and window while you work.
              When you stop, you have a real record, not a blurry memory.
            </p>

            <EmailForm />

            <p className="text-[11px]" style={{ color: '#3D3D3D' }}>
              One email when it ships. That&apos;s it.
            </p>
          </div>

          {/* Right: live app mockup — hidden on small screens */}
          <div className="hidden lg:block">
            <AppMockup />
          </div>

        </div>
      </section>

      <Divider />

      {/* ── Story ─────────────────────────────────────────────────────────────
          Jordi's motivation — blockquote, left-aligned, human.                 */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <Label>Why this exists</Label>

          <blockquote className="mt-8 text-xl lg:text-2xl text-scout-text/80 leading-relaxed font-light">
            &ldquo;I kept losing track of what I&apos;d actually done each day, not just the hours,
            but which apps I used, where the time went. Tried a bunch of tools. Nothing fit the
            way I work. So I built this.{' '}
            <span className="text-scout-text font-normal">Enjoy :)</span>&rdquo;
          </blockquote>

          <p className="mt-6 text-scout-muted text-sm">Jordi, creator of SessionScout</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────*/}
      <footer className="border-t border-scout-dim/40 py-8 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-scout-muted/50 text-xs">
            <WaveIcon className="w-4 h-4" />
            <span>SessionScout · made in frustration</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: '#3D3D3D' }}>
            <a
              href="https://github.com/Catafal/SessionScout"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-scout-muted transition-colors duration-150"
            >
              GitHub
            </a>
            <span>© {new Date().getFullYear()} SessionScout</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
