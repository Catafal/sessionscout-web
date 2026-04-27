import type { Config } from 'tailwindcss';

// ── Design tokens — mirror the app's NSColor adaptive dark-mode values exactly ──
//
// Source: Support+SwiftUI.swift → NSColor.scoutXxxAdaptive
//   scoutBg      #000000  → void, Freewrite aesthetic
//   scoutSurface #0D0D0D  → barely lifted surface
//   scoutElev    #1A1A1A  → cards, inputs
//   scoutText    #E6E6E6  → neutral light text
//   scoutMuted   #666666  → secondary / placeholder text
//   scoutDim     #2D2D2D  → borders, separators, dim hints
//   scoutAccent  #EA612E  → ember orange — fixed, never adaptive

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'scout-void':    '#000000',  // main background — pure void
        'scout-surface': '#0D0D0D',  // card / panel background
        'scout-elev':    '#1A1A1A',  // inputs, elevated surfaces
        'scout-text':    '#E6E6E6',  // primary text
        'scout-muted':   '#666666',  // secondary text, placeholders
        'scout-dim':     '#2D2D2D',  // borders, separators
        'scout-accent':  '#EA612E',  // ember orange — CTAs, live signals
      },
      fontFamily: {
        // System stack — no external font fetches, matches the native app feel
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Monospaced stack for the timer display — matches NSFont.monospacedDigit
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
