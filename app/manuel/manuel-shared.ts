// Shared by /manuel and /manuel/blog. Every rule stays scoped under .manuel
// so it never leaks into the rest of the site.
import { IBM_Plex_Mono } from 'next/font/google'

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--manuel-mono',
})

export const MANUEL_CSS = `
  .manuel {
    --ink:          #1A1F36;
    --ink-soft:     #4A4F66;
    --muted:        #6E665F;
    --ground:       #FAF8F6;
    --surface:      #FFFFFF;
    --surface-2:    #F2EEEA;
    --line:         #E4DDD6;
    --line-strong:  #CFC5BB;

    --orange:       #E8571A;
    --orange-dark:  #C4471A;
    --orange-soft:  #FFF3EE;
    --indigo:       #4F46E5;
    --indigo-soft:  #EEF2FF;

    --be-black:     #14140F;
    --be-yellow:    #FDBE01;
    --be-red:       #EF0110;

    --ok:           #047857;
    --ok-soft:      #ECFDF5;
    --warn:         #B45309;
    --warn-soft:    #FFFBEB;
    --stop:         #B91C1C;
    --stop-soft:    #FEF2F2;

    --display: 'Nunito', 'Trebuchet MS', sans-serif;
    --body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --mono:    var(--manuel-mono), ui-monospace, 'SFMono-Regular', Menlo, monospace;

    --masthead-bg: #1A1F36;
    --masthead-ink: #FFFFFF;
    --masthead-body: #C2BCB6;
    --masthead-meta: #9A948E;

    --rail: 268px;
  }



  .manuel, .manuel * { box-sizing: border-box; }

  .manuel {
    background: var(--ground);
    color: var(--ink);
    font-family: var(--body);
    font-size: 16px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Bandeau titre ─────────────────────────────────────────── */
  .manuel .masthead {
    background: var(--masthead-bg);
    color: var(--masthead-body);
    padding: 56px 32px 0;
  }

  .manuel .masthead-inner { max-width: 1180px; margin: 0 auto; }
  .manuel .backlink {
    display: inline-block;
    font-family: var(--body);
    font-size: 13px;
    color: var(--masthead-meta);
    text-decoration: none;
    margin-bottom: 22px;
  }
  .manuel .backlink:hover { color: var(--masthead-ink); }
  .manuel .backlink:focus-visible { outline: 2px solid var(--be-yellow); outline-offset: 3px; }

  .manuel .eyebrow {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--be-yellow);
    margin: 0 0 14px;
  }
  .manuel .masthead h1 {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(2.1rem, 5vw, 3.4rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 16px;
    text-wrap: balance;
    color: var(--masthead-ink);
  }
  .manuel .masthead p {
    max-width: 60ch;
    color: var(--masthead-body);
    font-size: 1.02rem;
    margin: 0 0 34px;
  }
  .manuel .masthead-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 26px;
    font-size: 13px;
    color: var(--masthead-meta);
    padding-bottom: 34px;
  }
  .manuel .masthead-meta b { color: var(--masthead-ink); font-weight: 600; }

  /* Filet tricolore — écho au pin du logo */
  .manuel .tricolour { display: flex; height: 6px; }
  .manuel .tricolour i { flex: 1; }
  .manuel .tricolour i:nth-child(1) { background: var(--be-black); }
  .manuel .tricolour i:nth-child(2) { background: var(--be-yellow); }
  .manuel .tricolour i:nth-child(3) { background: var(--be-red); }

  /* ── Charpente ─────────────────────────────────────────────── */
  .manuel .shell {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 32px 96px;
    display: grid;
    grid-template-columns: var(--rail) minmax(0, 1fr);
    gap: 56px;
    align-items: start;
  }

  .manuel .toc {
    position: sticky;
    top: 28px;
    padding-top: 44px;
    max-height: calc(100vh - 56px);
    overflow-y: auto;
  }
  .manuel .toc h2 {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 14px;
    font-weight: 500;
  }
  .manuel .toc ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
  .manuel .toc a {
    display: flex;
    gap: 10px;
    padding: 5px 10px 5px 8px;
    border-radius: 6px;
    text-decoration: none;
    color: var(--ink-soft);
    font-size: 13.5px;
    line-height: 1.4;
    border-left: 2px solid transparent;
  }
  .manuel .toc a:hover { background: var(--surface-2); color: var(--ink); }
  .manuel .toc a:focus-visible { outline: 2px solid var(--orange); outline-offset: 1px; }
  .manuel .toc a span { font-family: var(--mono); font-size: 11px; color: var(--muted); padding-top: 1px; }
  .manuel .toc .toc-admin { border-left-color: var(--indigo); }
  .manuel .toc .toc-public { border-left-color: var(--orange); }

  .manuel main { padding-top: 44px; min-width: 0; }

  /* ── Sections ──────────────────────────────────────────────── */
  .manuel section { margin-bottom: 68px; scroll-margin-top: 24px; }
  .manuel section > h2 {
    font-family: var(--display);
    font-weight: 900;
    font-size: 1.72rem;
    letter-spacing: -0.015em;
    line-height: 1.2;
    margin: 0 0 6px;
    text-wrap: balance;
  }
  .manuel .sec-kicker {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .manuel .sec-kicker::before {
    content: "";
    width: 22px; height: 2px;
    background: var(--orange);
    display: block;
  }
  .manuel .sec-kicker.admin::before { background: var(--indigo); }

  .manuel h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 1.12rem;
    margin: 34px 0 10px;
    letter-spacing: -0.005em;
  }
  .manuel h4 {
    font-family: var(--body);
    font-weight: 700;
    font-size: 0.94rem;
    margin: 24px 0 8px;
    color: var(--ink);
  }
  .manuel p { margin: 0 0 14px; max-width: 68ch; }
  .manuel main ul, .manuel main ol { max-width: 68ch; margin: 0 0 16px; padding-left: 22px; }
  .manuel main li { margin-bottom: 7px; }
  .manuel main li::marker { color: var(--muted); }
  .manuel b, .manuel strong { font-weight: 600; color: var(--ink); }
  .manuel a { color: var(--orange-dark); }

  .manuel code {
    font-family: var(--mono);
    font-size: 0.855em;
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 0.1em 0.38em;
    color: var(--ink);
    white-space: nowrap;
  }

  /* ── Encadrés ──────────────────────────────────────────────── */
  .manuel .note {
    border-left: 3px solid var(--orange);
    background: var(--orange-soft);
    padding: 15px 18px;
    border-radius: 0 8px 8px 0;
    margin: 0 0 18px;
    max-width: 68ch;
  }
  .manuel .note.admin { border-left-color: var(--indigo); background: var(--indigo-soft); }
  .manuel .note.warn { border-left-color: var(--warn);   background: var(--warn-soft); }
  .manuel .note.stop { border-left-color: var(--stop);   background: var(--stop-soft); }
  .manuel .note p:last-child { margin-bottom: 0; }
  .manuel .note-label {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 6px;
    color: var(--orange-dark);
  }
  .manuel .note.admin .note-label { color: var(--indigo); }
  .manuel .note.warn  .note-label { color: var(--warn); }
  .manuel .note.stop  .note-label { color: var(--stop); }

  /* ── Tableaux ──────────────────────────────────────────────── */
  .manuel .table-wrap { overflow-x: auto; margin: 0 0 20px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
  .manuel table { border-collapse: collapse; width: 100%; font-size: 14px; }
  .manuel th, .manuel td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .manuel th {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
    background: var(--surface-2);
    white-space: nowrap;
  }
  .manuel tbody tr:last-child td { border-bottom: none; }
  .manuel td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }

  /* ── Marches numérotées (séquences réelles uniquement) ─────── */
  .manuel .steps { list-style: none; padding: 0; margin: 0 0 20px; counter-reset: s; max-width: 68ch; }
  .manuel .steps > li {
    counter-increment: s;
    position: relative;
    padding-left: 42px;
    margin-bottom: 18px;
  }
  .manuel .steps > li::before {
    content: counter(s);
    position: absolute;
    left: 0; top: 1px;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--ground);
    font-family: var(--mono);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Pastilles d'état ──────────────────────────────────────── */
  .manuel .pill {
    display: inline-block;
    font-family: var(--mono);
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 20px;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .manuel .pill.ok { background: var(--ok-soft);   color: var(--ok);   border-color: var(--ok); }
  .manuel .pill.warn { background: var(--warn-soft); color: var(--warn); border-color: var(--warn); }
  .manuel .pill.stop { background: var(--stop-soft); color: var(--stop); border-color: var(--stop); }
  .manuel .pill.mute { background: var(--surface-2); color: var(--muted); border-color: var(--line-strong); }

  /* ── Nuancier ──────────────────────────────────────────────── */
  .manuel .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; margin: 0 0 20px; }
  .manuel .swatch { border: 1px solid var(--line); border-radius: 9px; overflow: hidden; background: var(--surface); }
  .manuel .swatch .chip { height: 52px; }
  .manuel .swatch .meta { padding: 8px 10px; }
  .manuel .swatch .meta b { display: block; font-size: 12.5px; }
  .manuel .swatch .meta code { background: none; border: none; padding: 0; font-size: 11.5px; color: var(--muted); }

  /* ── Divers ────────────────────────────────────────────────── */
  .manuel .lede { font-size: 1.06rem; color: var(--ink-soft); max-width: 66ch; }
  .manuel .rule { height: 1px; background: var(--line); border: 0; margin: 0 0 34px; max-width: 68ch; }

  .manuel footer {
    border-top: 1px solid var(--line);
    padding: 26px 32px 60px;
    color: var(--muted);
    font-size: 13px;
  }
  .manuel footer div { max-width: 1180px; margin: 0 auto; }

  @media (max-width: 900px) {
    .manuel .shell { grid-template-columns: 1fr; gap: 0; padding: 0 22px 64px; }
    .manuel .toc { position: static; max-height: none; padding-top: 34px; border-bottom: 1px solid var(--line); padding-bottom: 20px; }
    .manuel .masthead { padding: 40px 22px 0; }
    .manuel main { padding-top: 34px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .manuel, .manuel * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
`
