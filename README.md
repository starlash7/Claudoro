# 🦞 Claudoro — Focus Terminal for Builders

**Claudoro**

**LOCK IN. SHIP. REPEAT.**

![Electron](https://img.shields.io/badge/Electron-Desktop-000000?style=flat&logo=electron&logoColor=white&labelColor=47848F)
![React](https://img.shields.io/badge/React-UI-000000?style=flat&logo=react&logoColor=61DAFB&labelColor=20232A)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Design-000000?style=flat&logo=tailwindcss&logoColor=white&labelColor=06B6D4)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-D97757?style=flat&labelColor=000000)

Developer focus timer with GitHub activity sync.

Claudoro is a desktop focus companion with a terminal-inspired interface, a Claude-style mascot, and practical session tracking.
It is designed to help you stay in flow, finish more deep work, and keep momentum visible every day.

## Quick Links

- [Star on GitHub](https://github.com/starlash7/Claudoro)
- [Issues / Feedback](https://github.com/starlash7/Claudoro/issues)

## Primary Distribution: Run From Source

Claudoro is now distributed primarily as an open-source repo workflow:
`clone -> npm install -> npm run dev`

```bash
git clone https://github.com/starlash7/Claudoro.git
cd Claudoro
npm install
npm run dev
```

Local production build:

```bash
npm run build
```

## Launch Positioning

Claudoro helps developers protect focus time and see progress in one place by combining a clean timer flow with GitHub activity context.

## Discoverability Setup (GitHub)

Set your repository metadata like this:

- **Description**: `Developer focus timer with GitHub activity sync for visible daily momentum.`
- **Topics**: `pomodoro`, `focus-timer`, `electron`, `react`, `productivity`, `developer-tools`, `github-integration`

Promotion channels:

- Show HN
- Reddit (`r/programming`, `r/productivity`, `r/SideProject`)
- X (Twitter)
- Dev.to
- Product Hunt

Launch copy templates are in `docs/LAUNCH_PLAYBOOK.md`.

## Open Source Growth Loop

1. Keep repository description and topics up to date.
2. Ship one visible improvement every week and post changelog screenshots.
3. Convert issues into public roadmap milestones.
4. Ask for specific feedback in every launch post (onboarding, timer UX, GitHub sync).
5. Pin the repo and post progress clips on X/Reddit/Dev.to consistently.

## Product Highlights

- **Focused timer modes**
  Pomodoro, Short Break, Long Break, and Deep Focus (count-up mode).

- **Mascot-driven feedback**
  The mascot reacts to your current state: idle, focusing, break, and complete.

- **Daily goal flow**
  Set today’s goal, mark it complete, and review goal history over time.

- **Streak and progress visibility**
  Track completed sessions, focus minutes, and streak performance in one view.

- **GitHub context (optional)**
  Connect GitHub to see commits, PRs, and issue context while you work.
  The streak heatmap is shown as a full current-year view (January to December).

## Focus Modes

| Mode             | Duration  | Purpose                    |
| ---------------- | --------- | -------------------------- |
| Focus (Pomodoro) | 25 min    | Deep work sprint           |
| Short Break      | 5 min     | Quick reset                |
| Long Break       | 15 min    | Recovery after cycles      |
| Deep Focus       | Unlimited | Manual, uninterrupted flow |

Cycle logic:

- After each Focus session: Short Break
- Every 4th Focus completion: Long Break
- After a break: back to Focus

## Why People Use Claudoro

- You want a **clean, non-distracting desktop timer**.
- You prefer a **terminal aesthetic** over gamified clutter.
- You care about **visible momentum** (stats, streaks, daily intent).
- You want lightweight **GitHub-aware focus context** in the same app.

## Getting Started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## GitHub Connection (Optional)

1. Open `Settings` in Claudoro.
2. Choose mode:
   - `Account`: profile-wide contribution graph
   - `Repository`: repo-level commits, PRs, issues
3. Enter your GitHub token.
4. If using Repository mode, enter repository (`repo` or `owner/repo`).
5. Save and refresh the GitHub panel.

Heatmap behavior:

- Displays the current year in calendar order (`Jan` to `Dec`)
- Uses a single timeline (no year switcher)

GitHub token is stored in your OS secure keychain. Other GitHub settings are stored locally on your device.

## Release Docs

- QA checklist: `docs/RELEASE_QA_CHECKLIST.md` (optional, release mode)
- Pipeline guide: `docs/RELEASE_PIPELINE.md` (optional, release mode)
- Launch playbook: `docs/LAUNCH_PLAYBOOK.md`

## Roadmap

- Team leaderboard for shared focus tracking
- Optional cloud sync for multi-device continuity
- More session insights and weekly review surfaces

---

Built with Electron, React, Zustand, and Tailwind CSS.
