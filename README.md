# 🦞 Claudoro — Focus Terminal for Builders

**Claudoro**

**LOCK IN. SHIP. REPEAT.**

![Electron](https://img.shields.io/badge/Electron-Desktop-000000?style=flat&logo=electron&logoColor=white&labelColor=47848F)
![React](https://img.shields.io/badge/React-UI-000000?style=flat&logo=react&logoColor=61DAFB&labelColor=20232A)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Design-000000?style=flat&logo=tailwindcss&logoColor=white&labelColor=06B6D4)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-D97757?style=flat&labelColor=000000)

Claudoro is a desktop focus companion with a terminal-inspired interface, a Claude-style mascot, and practical session tracking.
It is designed to help you stay in flow, finish more deep work, and keep momentum visible every day.

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

## Focus Modes

| Mode | Duration | Purpose |
| --- | --- | --- |
| Focus (Pomodoro) | 25 min | Deep work sprint |
| Short Break | 5 min | Quick reset |
| Long Break | 15 min | Recovery after cycles |
| Deep Focus | Unlimited | Manual, uninterrupted flow |

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
2. Enter your GitHub token, username, and repository.
3. Save and refresh the GitHub panel.

Your GitHub settings are stored locally on your device.

## Roadmap

- Team leaderboard for shared focus tracking
- Optional cloud sync for multi-device continuity
- More session insights and weekly review surfaces

---

Built with Electron, React, Zustand, and Tailwind CSS.
