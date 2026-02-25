# 🦞 Claudoro — Focus Terminal for Builders

**Claudoro**

**LOCK IN. SHIP. REPEAT.**

![Desktop: Electron](https://img.shields.io/badge/Desktop%3A%20Electron-D97757?style=flat&logo=electron&logoColor=white)
![UI: React](https://img.shields.io/badge/UI%3A%20React-D97757?style=flat&logo=react&logoColor=white)
![Design: TailwindCSS](https://img.shields.io/badge/Design%3A%20TailwindCSS-D97757?style=flat&logo=tailwindcss&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-E86C47?style=flat)

**Powered by pixy7**

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

- QA checklist: `docs/RELEASE_QA_CHECKLIST.md`
- Pipeline guide: `docs/RELEASE_PIPELINE.md`

## Roadmap

- Team leaderboard for shared focus tracking
- Optional cloud sync for multi-device continuity
- More session insights and weekly review surfaces

---

Built with Electron, React, Zustand, and Tailwind CSS.
