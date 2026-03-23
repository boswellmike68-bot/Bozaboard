# Bozaboard

**High-contrast, local-first Governance Boardroom UI**

Bozaboard is the accessibility-first interface for the Bozitivez governance architecture. It provides a transparent, deterministic advisory system powered by the BBnCC governance engine.

## Features

- **BBnCC Advisory Engine** — Real intent classification, 7-rule governance engine, weighted persona selection, and momentum tracking
- **Committee Personas** — Stability Chair, Momentum Chair, Risk Chair, Alignment Chair respond based on governance state
- **13-Perspective Consensus Ring** — Visual orb ring reflects governance momentum
- **Governed AI Steward** — Offline, deterministic demo walkthrough with audit logging
- **Sponsor Modal** — Three-tier sponsorship with copy-to-clipboard actions
- **Markdown Pillar System** — Governance, Blueprint, Launch Protocol, and Advisory pillars rendered from local markdown
- **SHA-256 Access Gate** — Client-side token verification
- **Safe Mode** — Disables animations for accessibility
- **Zero Dependencies** — No frameworks, no build step, no external requests

## Governance Principles

- **Neutrality** — No emotional manipulation, no persuasive framing
- **Privacy** — No telemetry, no external calls, no data leaves the browser
- **Accessibility** — High-contrast, low-cognitive-load, multi-modal design
- **Auditability** — Every AI action is logged with timestamps
- **Determinism** — Same input always produces the same advisory

## Quick Start

Serve the folder with any static web server:

```
node -e "require('http').createServer((q,r)=>{require('fs').readFile(require('path').join(__dirname,decodeURIComponent(q.url.split('?')[0]).replace(/\/$/,'index.html')),(e,d)=>{if(e){r.writeHead(404);r.end('Not found');return}r.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'application/javascript','.md':'text/markdown','.css':'text/css'})[require('path').extname(q.url)]||'application/octet-stream'});r.end(d)})}).listen(8080,()=>console.log('http://localhost:8080'))"
```

Or open via GitHub Pages once published.

## Architecture

```
Bozaboard/
├── index.html          — UI shell, CSS, access gate
├── boardroom.js        — Dashboard logic, pillar loading, sponsor modal, Steward AI
├── bbncc-engine.js     — BBnCC governance advisory engine (intent, rules, personas)
├── AccessKey.js        — SHA-256 access verification
├── markdown.js         — Lightweight markdown renderer
├── parseHeadings.js    — Heading handler
├── parseLists.js       — List handler
├── parseCodeBlocks.js  — Fenced code block handler
├── parseHorizontalRules.js — Horizontal rule handler
└── pillars/
    ├── governance.md   — Governance pillar content
    ├── blueprint.md    — Blueprint pillar content
    ├── launch.md       — Launch protocol content
    └── advisory.md     — Advisory portal trigger
```

## Part of the Bozitivez Ecosystem

- **BBnCC** — Governance engine and foundational doctrine
- **Bozitivez** — Parent governance architecture
- **LovesfireAI** — Voice and emotional-tone layer
- **Bozaboard** — This repo: the accessible Boardroom UI

## Sponsorship

Bozaboard is built by a post-fire family rebuilding through governed technology.

- **Contact:** bossbozive@outlook.com
- **GitHub Sponsors:** [github.com/sponsors/boswellmike68](https://github.com/sponsors/boswellmike68)

## License

Copyright (c) 2026 Mike Boswell. Personal use and non-commercial permitted.
