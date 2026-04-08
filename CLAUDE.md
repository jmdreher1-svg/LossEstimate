# CLAUDE.md — LossEstimate

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Project Overview

**LossEstimate** is an engineering calculator for computing fire loss estimates per **FM Global FP 5020 Rev E**. It calculates three loss tiers — **APL** (Anticipated Property Loss), **PML** (Probable Maximum Loss), and **MFL** (Maximum Foreseeable Loss) — for both Property Damage (PD) and Business Interruption (BI). The tool is used by fire protection engineers to evaluate risk at industrial and commercial sites.

Developed by John Dreher, P.E. — GRC Fire Protection Practices.

**Live site:** https://jmdreher1-svg.github.io/LossEstimate/

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Single-file HTML/CSS/JS (`index.html`) | Zero dependencies, runs offline, easy to distribute |
| Styling | Inline CSS with CSS custom properties | Dark/light theme support, no build step needed |
| Fonts | Google Fonts (DM Sans, DM Mono) | Clean engineering aesthetic |
| Tests | Jest (Node.js) | Unit tests for calculation logic |
| Hosting | GitHub Pages | Free, auto-deploys from `main` |

No backend, no database, no build system. The entire application is a single `index.html` file (~1,080 lines).

## Repository State

| Item | Status |
|------|--------|
| Implementation code | Complete — single-file calculator in `index.html` |
| Build system | None needed (no compilation/bundling) |
| Test infrastructure | Jest — `npm test` runs 222+ tests |
| CI/CD | GitHub Pages auto-deploy from `main` |
| Documentation | README, CLAUDE.md, reference PDF |

## Directory Structure

```
LossEstimate/
├── index.html                  # Full application (HTML + CSS + JS, ~1,080 lines)
├── FP5020 - Loss Estimates Rev E.pdf  # FM Global source reference document
├── Launch Calculator.bat       # Windows launcher (opens index.html in browser)
├── tests/
│   └── fp5020.test.js          # Jest unit tests (~2,340 lines, 222+ tests)
├── package.json                # Jest dev dependency only
├── package-lock.json
├── .gitignore                  # Excludes node_modules/
├── README.md
└── CLAUDE.md
```

## How to Run

### Application

Open `index.html` in any browser. No server required.

- **Windows:** Double-click `Launch Calculator.bat`
- **Any OS:** Open `index.html` directly in a browser
- **Online:** Visit https://jmdreher1-svg.github.io/LossEstimate/

### Tests

```bash
npm install        # Install Jest (first time only)
npm test           # Run all tests
```

## Application Architecture

### State Management

All application state lives in a single global object `S` with properties for site info, building data, values, sprinkler status, damage overrides, etc. State is auto-saved to `localStorage` after 500ms of inactivity, and can be manually saved, exported as JSON, or imported from JSON.

### UI Structure

The app uses a **tabbed interface** with a sidebar (desktop) and mobile tab bar:

| Section | Tabs | Purpose |
|---------|------|---------|
| Setup | Site Info, Values, Business Interruption | Input site data, building details, PD/BI values |
| Analysis | APL, PML, MFL | Configure and view each loss tier |
| Results | Summary, Narrative, Revision History | View formatted results and export |

### Core Calculation Modules

- **APL (`calcAPL`)** — Uses FP 5020 Table 2 scenarios (A through K) based on occupancy, hazard class, sprinkler adequacy, and sensitivity. Calculates fire/water/smoke damage across zones (fire area, remainder of building, exposures, inventories). Supports manual damage % overrides.
- **PML (`calcPML`)** — Derives from APL with FP 5020 Items #5, #6, #7 adjustments. PML defaults to MFL unless specific qualifiers are met (adequate sprinklers, adequate alarms/FD/PEO). Handles scenario-based 100% damage for deficient sprinkler conditions.
- **MFL (`calcMFL`)** — Uses FP 5020 Table 4 damage percentages by occupancy and construction type. Applies Table 5 building condemnation thresholds. Considers fire wall separations via Table 3.

### Key Data Tables (embedded in code)

- `APL_SC` — Table 2: APL scenario parameters (A–K) with fire area sizes and damage %
- `MFL_T` — Table 4: MFL damage % by occupancy and construction (25 occupancy types)
- `MFL_T5` — Table 5: Building condemnation thresholds by area and construction
- `MFL_SEP` — Table 3: Fire wall separation distances
- `STORAGE_OCCS` — Storage occupancy types (Warehousing, Warehousing Refrigerated, Big Box Retail)
- `CURRENCIES` — 15 supported currency symbols

### Important Conventions

- All monetary values are rounded to the nearest $10,000 at the zone level (`rLE()` function)
- The app supports **imperial and metric** unit systems (sqft/m², ft/m)
- Storage occupancies auto-detect and lock hazard class to "Extra Hazard"
- Dark/light theme toggle persists to `localStorage`
- CSS uses short class names (`.cd`, `.fd`, `.vc`, etc.) — this is intentional minification, not obfuscation

## Git Workflow

### Branches

- `main` — stable, production-ready code (deployed to GitHub Pages)
- `claude/<session-id>` — AI-assisted development branches (auto-created per session)

### Commit Conventions

Use conventional commit format:

```
<type>(<scope>): <short description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`

Scopes used in this project: `ui`, `pml`, `apl`, `mfl`, `values`, `estimator`, `revision`

Examples:
```
feat(pml): implement FP 5020 Items #5, #6, #7 for PML fire area
fix(ui): filter storage occupancies and reset stale alarmsOk state
docs(revision): add Rev 0.15 and Rev 0.16 to revision history
```

### Branch Naming

- Features: `feat/<short-description>`
- Bug fixes: `fix/<short-description>`
- AI sessions: `claude/<session-id>` (auto-managed)

## Development Guidelines for AI Assistants

### General Principles

- **Read before editing**: Always read `index.html` before modifying it — everything is in one file.
- **Minimal changes**: Only make changes directly requested or clearly necessary.
- **No over-engineering**: Avoid adding abstractions, helpers, or error handling for hypothetical future needs.
- **No unnecessary files**: Prefer editing existing files over creating new ones.
- **No unsolicited refactors**: Don't clean up surrounding code unless asked.
- **No comments on unchanged code**: Don't add docstrings or comments to code you didn't write or change.
- **Preserve minified style**: The CSS and JS use short variable/class names intentionally. Follow the existing naming conventions.

### Security

- Never introduce command injection, SQL injection, XSS, or other OWASP Top 10 vulnerabilities.
- All user input is escaped via `esc()` before insertion into HTML.
- Validate input at system boundaries (user input, external APIs); trust internal code.
- Never commit secrets, credentials, or `.env` files.

### Workflow

1. Check current branch before making changes.
2. Make focused, well-scoped commits.
3. Push to the designated feature branch — never push to `main` directly.
4. Update this `CLAUDE.md` when the project structure changes significantly.
5. Run `npm test` to verify calculation logic after changes.

## Revision History

The application has been through 16+ revisions, evolving from a basic calculator to a full-featured loss estimation tool. Key milestones:

- **Rev 0.3** — Initial unit tests (101 passing), MFL fire wall bug fix
- **Rev 0.6** — Cross-check against FP 5020 Rev E source PDF, data corrections
- **Rev 0.7** — High-rise MFL calculation, Table 4 condemnation threshold
- **Rev 0.8** — Configurable currency, imperial/metric unit system, 222 tests
- **Rev 0.10** — Unified PML logic with scenario zones
- **Rev 0.12** — Per-category value distribution (building/equipment/inventory)
- **Rev 0.13** — FP 5020 Items #5, #6, #7 for PML fire area
- **Rev 0.14** — PML defaults to MFL unless qualifiers met, storage occupancy filtering
- **Rev 0.16** — Leadership feedback: storage toggle UX, auto-save, sidebar nav, scrollable sections
