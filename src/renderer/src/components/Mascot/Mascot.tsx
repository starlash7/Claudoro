import { motion, type Variants } from 'framer-motion'
import { FACE_PATH, LEFT_EYE_PATH, MOUTH_PATH, RIGHT_EYE_PATH } from './mascot-paths'
import { useTimerStore } from '../../store/timerStore'

const animationPresets: Variants = {
  idle: {
    y: [0, -4, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
  },
  focusing: {
    y: [0, -8, 0],
    rotate: [0, -1, 1, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
  },
  break: {
    y: [0, -3, 0],
    scale: [1, 1.02, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  complete: {
    y: [0, -14, 0],
    scale: [1, 1.08, 1],
    transition: { duration: 0.7, repeat: Infinity, ease: 'easeOut' }
  }
}

export default function Mascot(): React.JSX.Element {
  const mascotState = useTimerStore((state) => state.mascotState)

  const isBreak = mascotState === 'break'
  const isFocusing = mascotState === 'focusing'
  const isComplete = mascotState === 'complete'

  return (
    <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-3">
      <motion.svg
        animate={mascotState}
        className="h-[180px] w-[180px]"
        variants={animationPresets}
        viewBox="0 0 320 320"
      >
        <path d={FACE_PATH} fill="#f6c89f" stroke="#1b1f3b" strokeWidth="8" />
        <circle cx="120" cy="165" fill="#ff9fb3" opacity="0.75" r="12" />
        <circle cx="200" cy="165" fill="#ff9fb3" opacity="0.75" r="12" />

        <path
          d={LEFT_EYE_PATH}
          fill="none"
          stroke="#1b1f3b"
          strokeLinecap="round"
          strokeWidth={isFocusing ? 10 : 7}
        />
        <path
          d={RIGHT_EYE_PATH}
          fill="none"
          stroke="#1b1f3b"
          strokeLinecap="round"
          strokeWidth={isFocusing ? 10 : 7}
        />

        {isBreak ? (
          <>
            <path d="M122 138h34" stroke="#1b1f3b" strokeLinecap="round" strokeWidth="7" />
            <path d="M164 138h34" stroke="#1b1f3b" strokeLinecap="round" strokeWidth="7" />
          </>
        ) : null}

        {isComplete ? (
          <>
            <path
              d="M112 138l10 12 10-12 10 12"
              fill="none"
              stroke="#1b1f3b"
              strokeLinecap="round"
              strokeWidth="6"
            />
            <path
              d="M178 138l10 12 10-12 10 12"
              fill="none"
              stroke="#1b1f3b"
              strokeLinecap="round"
              strokeWidth="6"
            />
          </>
        ) : null}

        <path d={MOUTH_PATH} fill="none" stroke="#1b1f3b" strokeLinecap="round" strokeWidth="8" />

        {isFocusing ? (
          <motion.path
            animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
            d="M235 108c10 2 14 12 8 20-6 8-16 6-20-2-5-8 1-20 12-18z"
            fill="#8dd7ff"
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : null}

        {isBreak ? (
          <text fill="#d1d6ff" fontSize="18" x="232" y="98">
            Zzz
          </text>
        ) : null}
      </motion.svg>
    </div>
  )
}
