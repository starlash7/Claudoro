# Claudoro

# 🍅 Claudoro
> Claude 마스코트와 함께하는 Vibe Coding 뽀모도로 타이머

---

## 📌 Overview

| 항목 | 내용 |
|------|------|
| 앱 타입 | 데스크탑 앱 (macOS / Windows / Linux) |
| 프레임워크 | Electron |
| UI | React + TailwindCSS |
| 데이터 | localStorage (로컬 저장) |
| 외부 연동 | GitHub REST API |

---

## 🗂️ 프로젝트 구조

```
claudoro/
├── public/
│   ├── index.html
│   └── icons/                  # 앱 아이콘 (icns, ico, png)
│
├── src/
│   ├── main/                   # Electron 메인 프로세스
│   │   ├── index.js            # 앱 엔트리, BrowserWindow 설정
│   │   ├── ipc.js              # IPC 핸들러 (창 컨트롤, 알림)
│   │   └── tray.js             # 시스템 트레이 (optional)
│   │
│   ├── renderer/               # React 렌더러 프로세스
│   │   ├── App.jsx             # 루트 컴포넌트
│   │   ├── index.jsx           # React 엔트리
│   │   │
│   │   ├── components/
│   │   │   ├── Mascot/         # Claude 마스코트 SVG + 애니메이션
│   │   │   ├── Timer/          # 타이머 링 + 디스플레이
│   │   │   ├── Controls/       # 재생/정지/스킵 버튼
│   │   │   ├── ModeSelector/   # 뽀모도로 / 짧은휴식 / 긴휴식 탭
│   │   │   ├── Stats/          # 세션 통계 카드
│   │   │   ├── GoalInput/      # 오늘의 목표 입력
│   │   │   ├── GitHub/         # GitHub 연동 위젯
│   │   │   └── Titlebar/       # 커스텀 타이틀바 (닫기/최소화)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useTimer.js     # 타이머 로직 (tick, pause, reset)
│   │   │   ├── usePomodoro.js  # 뽀모도로 사이클 관리
│   │   │   ├── useStats.js     # 세션 통계 저장/불러오기
│   │   │   └── useGitHub.js    # GitHub API 훅
│   │   │
│   │   ├── store/
│   │   │   └── timerStore.js   # 전역 상태 (Zustand 추천)
│   │   │
│   │   └── styles/
│   │       └── globals.css     # Tailwind 베이스
│   │
│   └── shared/
│       └── constants.js        # 타이머 시간, 모드 설정값
│
├── .env                        # GitHub Token 등 환경변수
├── package.json
├── vite.config.js              # Vite 번들러 설정
├── tailwind.config.js
└── electron-builder.config.js  # 빌드/패키징 설정
```

---

## 🛠️ 기술 스택

### Core
| 기술 | 용도 | 버전 |
|------|------|------|
| [Electron](https://www.electronjs.org/) | 데스크탑 앱 래핑 | v28+ |
| [React](https://react.dev/) | UI 컴포넌트 | v18+ |
| [Vite](https://vitejs.dev/) | 번들러 (빠른 HMR) | v5+ |
| [TailwindCSS](https://tailwindcss.com/) | 스타일링 | v3+ |

### 상태관리
| 기술 | 용도 |
|------|------|
| [Zustand](https://zustand-demo.pmnd.rs/) | 전역 상태 (타이머, 설정) |
| localStorage | 세션 통계, 스트릭 저장 |

### 외부 연동
| 기술 | 용도 |
|------|------|
| [GitHub REST API](https://docs.github.com/en/rest) | 커밋 수, 잔디, PR/이슈 |
| Electron Notification API | 세션 완료 알림 |

### 개발 도구
| 기술 | 용도 |
|------|------|
| [electron-builder](https://www.electron.build/) | 앱 패키징 (.dmg, .exe) |
| [electron-vite](https://electron-vite.org/) | Electron + Vite 통합 템플릿 |

---

## ⚙️ 기능 명세

### 1. 타이머 모드

| 모드 | 시간 | 설명 |
|------|------|------|
| 🍅 Pomodoro | 25분 | 집중 세션 |
| ☕ Short Break | 5분 | 짧은 휴식 (4사이클마다 Long Break) |
| 🌙 Long Break | 15분 | 긴 휴식 |
| 🔥 Deep Focus | 제한 없음 | 흐름 끊기 싫을 때, 경과 시간만 기록 |

**자동 전환 로직**
```
Pomodoro x4 완료 → Long Break
Pomodoro x1~3 완료 → Short Break
Break 완료 → Pomodoro
```

### 2. Claude 마스코트

| 상태 | 표현 |
|------|------|
| Idle | 기본 표정, 대기 |
| Focusing | 눈 찌푸림, 땀방울, 통통 튀는 애니메이션 |
| Break | 눈 감음, Zzz, 천천히 숨쉬는 애니메이션 |
| Complete | 반짝이는 눈, 기뻐하는 표정 |

### 3. 통계

- 오늘 완료한 세션 수
- 오늘 총 집중 시간 (분)
- 연속 달성 스트릭 🔥 (날짜 기반, localStorage)

### 4. GitHub 연동

| 기능 | API 엔드포인트 |
|------|----------------|
| 오늘 커밋 수 | `GET /repos/{owner}/{repo}/commits` |
| 기여 잔디 (주간) | `GET /users/{username}/events` |
| 현재 열린 PR | `GET /repos/{owner}/{repo}/pulls` |
| 열린 이슈 수 | `GET /repos/{owner}/{repo}/issues` |
| 커밋 메시지 바로 입력 | (세션 완료 후 팝업 → git commit 연동) |

> GitHub Personal Access Token 필요 → `.env`에 저장

### 5. 기타

- 오늘의 목표 입력 (세션 시작 전 한 줄)
- 세션 완료 시 시스템 알림 (Electron Notification)
- BGM 링크 연결 (lo-fi YouTube 링크 등 외부 오픈)
- 커스텀 타이틀바 (프레임 없는 디자인, 드래그 이동)

---

## 🚀 개발 순서 (추천)

```
1단계 — MVP
  ├── Electron + Vite + React 세팅
  ├── 커스텀 타이틀바 + 창 컨트롤 (IPC)
  ├── 뽀모도로 타이머 로직 (useTimer, usePomodoro)
  ├── 원형 프로그레스 링
  ├── Claude 마스코트 SVG + 상태별 애니메이션
  └── 세션 통계 + localStorage 저장

2단계 — GitHub 연동
  ├── GitHub Token 설정 화면
  ├── 오늘 커밋 수 / 잔디 미니뷰
  ├── PR / 이슈 표시
  └── 세션 완료 후 커밋 메시지 입력

3단계 — 추가 기능
  ├── Deep Focus 타이머
  ├── BGM 링크 연결
  ├── 스트릭 상세 화면
  └── 앱 패키징 (.dmg / .exe)
```

---

## 📦 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 앱 빌드 (패키징)
npm run build
```

---

## 🔑 환경변수 (.env)

```
GITHUB_TOKEN=your_personal_access_token
GITHUB_USERNAME=your_github_username
```

---

## 📝 참고 자료

- [Electron 공식 문서](https://www.electronjs.org/docs/latest)
- [electron-vite 템플릿](https://electron-vite.org/)
- [GitHub REST API 문서](https://docs.github.com/en/rest)
- [Zustand 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [뽀모도로 기법](https://ko.wikipedia.org/wiki/포모도로_기법)
