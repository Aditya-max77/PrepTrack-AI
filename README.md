# Placement-Preparation-Tracker.
Team Name: Terrorist Coders. BrainWave 2.0 Hackathon  


# PrepTrack AI

A lightweight, AI-augmented placement preparation web app that helps students learn, practice interviews, take mock tests, and discover job opportunities — all from a single dashboard.

## What it does

- Personalised learning paths across domains (DSA, Web, ML, Data Science, Cybersecurity).
- On-demand AI-powered interview simulator with feedback and performance reports.
- Timed mock tests and mastery assessments.
- Progress tracking and milestones via an easy dashboard.
- Smart job discovery that recommends roles based on courses completed and skills learned.

## Key Features

- Domains: Data Structures & Algorithms, Web Development, Machine Learning, Data Science, Cyber Security
- Difficulty levels: Beginner • Intermediate • Advanced
- AI Interview Simulator: domain-aware question sets, real-time feedback, and reports
- Mock Tests: timed assessments and score analysis
- Dashboard: topic progress, upcoming milestones, and centralized activity control

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS (or plain CSS)
- Data: local JSON / in-repo data files (see `data/curriculum.ts`)
- AI: pluggable integration (prototype uses a mock/on-demand engine; production can use Gemini/OpenAI — see `services/geminiService.ts`)

## Quick Start

Prerequisites: Node.js 18+ and npm

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview the production build

```bash
npm run preview
```

Scripts available in `package.json`: `dev`, `build`, `preview`.

## Project Layout (high level)

- `src/` or project root: React entry (`index.tsx`, `App.tsx`)
- `components/`: UI pages and widgets (`CurriculumView.tsx`, `Dashboard.tsx`, `InterviewSim.tsx`, `MockTest.tsx`, `Landing.tsx`, `Onboarding.tsx`)
- `data/`: curriculum and sample data (`curriculum.ts`)
- `services/`: AI and external integrations (`geminiService.ts`)

## Notes & Future Work

- Replace mock AI with a production-grade model (Gemini/OpenAI) for richer feedback.
- Add user authentication and a cloud database (Firebase / Node.js backend).
- Add CI, tests, and deployment scripts.

## Contributing

Contributions welcome — open an issue or submit a PR describing the change.

## License

This project is provided as-is for demo and hackathon purposes. Add a license if you plan to release it publicly.

## Credits

PrepTrack AI — built as a placement preparation demo and prototype.