# Neuro-Read

Enterprise-grade cognitive reading platform with adaptive difficulty and biophilic design.

## Philosophy

- **No-Nonsense UI**: Game-like feel without toy-like appearance. No fantasy elements.
- **Biophilic Design**: Natural colors (Slate, Teal, Sage) that enhance focus and reduce cognitive load.
- **Reality Transfer**: Skills developed here transfer to real-world reading scenarios.
- **Strict Standards**: No TODOs, no temporary solutions. Production-ready code.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI**: Shadcn/ui + Tailwind CSS
- **State**: Zustand (Global) + TanStack Query (Server State)

## Architecture

### Core (`src/core/`)

- **Performance**: `TalentScout.ts` - WPM & comprehension tracking, fast-track detection
- **Adaptive Engine**: `DifficultyScaler.ts` - Zone of Proximal Development (ZPD) implementation
- **Sensors**: `InputAdapter.ts` - Unified input interface (Mouse, Touch, Eye-tracking)
- **Sentinel**: `AntiCheat.ts` - Silent observer for integrity

### Components (`src/components/`)

- **Reading Surface**: Focus-enhancing reading interface

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Code Standards

- Airbnb Style Guide
- TypeScript Strict Mode
- No `any` types
- Comprehensive error handling
- WCAG 2.1 compliant
