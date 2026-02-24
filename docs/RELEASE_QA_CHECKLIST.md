# Claudoro Release QA Checklist

Run this checklist before every tagged release.

## 1) Timer Reliability

- [ ] Start timer from `Timer` tab and verify countdown begins immediately.
- [ ] Pause timer and verify displayed time does not change for at least 5 seconds.
- [ ] Resume timer and verify countdown continues from paused value.
- [ ] Close window to tray, reopen, and verify timer state is preserved.
- [ ] Kill app while timer is running, relaunch, and verify recovery toast appears.
- [ ] Validate mode transitions:
  - Pomodoro -> Short Break
  - Every 4th Pomodoro -> Long Break
  - Break -> Pomodoro

## 2) Tray Usability

- [ ] Tray icon is visible after launch.
- [ ] `Open Claudoro` from tray opens/focuses app.
- [ ] `Pause/Resume Timer` from tray toggles state correctly.
- [ ] Tray title shows active timer value on macOS while running.
- [ ] `Quit` exits app cleanly without hanging processes.

## 3) GitHub Integration & Error Handling

- [ ] Valid token + user + repo: metrics load and `Repo Verified` badge appears.
- [ ] Invalid/expired token: clear auth error shown in widget.
- [ ] Repo typo/non-existent repo: verify actionable error and `Fix Settings` path.
- [ ] Rate limit path: UI shows rate-limit failure state without crashing.
- [ ] Settings updates reset verification badge until re-tested.

## 4) Spotify Launch Flow (Phase 1)

- [ ] `Open Spotify App` opens Spotify desktop app via `spotify:` protocol.
- [ ] `Spotify Playlist` opens browser/Spotify target correctly.
- [ ] Invalid custom URL is rejected and error text is shown.
- [ ] Supported custom URLs (`https://...`) open successfully.

## 5) Startup & Onboarding

- [ ] First run shows onboarding modal.
- [ ] `Open Settings` from onboarding routes to `Settings` tab.
- [ ] Notification permission step requests browser/electron notification permission.
- [ ] Completing onboarding hides modal and persists completion state.

## 6) Logging & Stability

- [ ] Renderer errors are appended to local app log.
- [ ] Main process unhandled errors are appended to local app log.
- [ ] Log file exists at `<userData>/logs/claudoro.log`.
- [ ] App remains usable if logging write fails.

## 7) Build Validation

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`

