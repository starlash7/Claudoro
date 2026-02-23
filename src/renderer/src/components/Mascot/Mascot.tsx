import { useEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useStats } from '../../hooks/useStats'
import { useTimerStore } from '../../store/timerStore'

const arenaVariants: Variants = {
  running: {
    x: [-96, -22, 86, 128, 62, -40, -112, -58, 0],
    y: [10, -14, -12, 8, 20, 18, 4, -8, 0],
    transition: {
      duration: 6.8,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.12, 0.27, 0.41, 0.56, 0.71, 0.84, 0.93, 1]
    }
  },
  sleeping: {
    x: 0,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  celebrate: {
    x: [0, 18, -16, 12, 0],
    y: [0, -4, 0, -3, 0],
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
  }
}

const mascotVariants: Variants = {
  running: {
    y: [0, -4, 0, -3, 0],
    rotate: [0, -2, 2, -1, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
  },
  sleeping: {
    y: [0, -1.5, 0],
    scale: [1, 1.02, 1],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
  },
  celebrate: {
    y: [0, -10, 0],
    rotate: [0, -7, 7, -5, 0],
    scale: [1, 1.12, 1.04, 1],
    transition: { duration: 0.85, repeat: Infinity, ease: 'easeOut' }
  }
}

export default function Mascot(): React.JSX.Element {
  const status = useTimerStore((state) => state.status)
  const currentStreak = useStats().currentStreak

  const [isCelebrating, setIsCelebrating] = useState(false)
  const previousStreakRef = useRef<number | null>(null)
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (previousStreakRef.current === null) {
      previousStreakRef.current = currentStreak
      return
    }

    if (currentStreak > previousStreakRef.current) {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
      }

      setTimeout(() => {
        setIsCelebrating(true)
      }, 0)

      celebrationTimeoutRef.current = setTimeout(() => {
        setIsCelebrating(false)
      }, 2500)
    }

    previousStreakRef.current = currentStreak
  }, [currentStreak])

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
      }
    }
  }, [])

  const visualState = isCelebrating ? 'celebrate' : status === 'running' ? 'running' : 'sleeping'
  const isRunning = visualState === 'running'
  const isSleeping = visualState === 'sleeping'
  const showPartyHat = visualState === 'celebrate'

  return (
    <div className="relative flex h-[232px] w-full items-center justify-center overflow-hidden py-4">
      <motion.div animate={visualState} className="will-change-transform" variants={arenaVariants}>
        <motion.svg
          animate={visualState}
          className="h-[196px] w-[196px]"
          shapeRendering="crispEdges"
          style={{
            filter:
              'drop-shadow(0 1px 0 rgba(47,37,29,0.14)) drop-shadow(0 0 5px rgba(217,119,87,0.2))'
          }}
          variants={mascotVariants}
          viewBox="0 0 64 64"
        >
          <rect fill="#d57958" height="14" width="46" x="9" y="8" />
          <rect fill="#d57958" height="5" width="54" x="5" y="22" />
          <rect fill="#d57958" height="3" width="1" x="4" y="23" />
          <rect fill="#d57958" height="3" width="1" x="59" y="23" />

          <rect fill="#d57958" height="11" width="46" x="9" y="27" />

          <rect fill="#d57958" height="7" width="4" x="14" y="38" />
          <rect fill="#d57958" height="7" width="4" x="24" y="38" />
          <rect fill="#d57958" height="7" width="4" x="36" y="38" />
          <rect fill="#d57958" height="7" width="4" x="46" y="38" />

          {isSleeping ? (
            <>
              <rect fill="#101010" height="2" width="8" x="15" y="18" />
              <rect fill="#101010" height="2" width="8" x="41" y="18" />
            </>
          ) : showPartyHat ? (
            <>
              <path d="M17 18l2 2 2 2-2 2-2 2-2-2-2-2 2-2z" fill="#101010" />
              <path d="M43 18l2 2 2 2-2 2-2 2-2-2-2-2 2-2z" fill="#101010" />
              <path d="M27 8l5-7 5 7z" fill="#ffd36b" />
              <rect fill="#ffd36b" height="1" width="10" x="27" y="8" />
              <circle cx="32" cy="1" fill="#ffffff" r="1.2" />
            </>
          ) : isRunning ? (
            <>
              <path d="M13 21l3-5h8l-3 5z" fill="#101010" />
              <path d="M39 21l3-5h8l-3 5z" fill="#101010" />
            </>
          ) : (
            <>
              <rect fill="#101010" height="7" width="4" x="16" y="15" />
              <rect fill="#101010" height="7" width="4" x="44" y="15" />
            </>
          )}

          {isSleeping ? (
            <>
              <motion.text
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, -4] }}
                fill="#b9593b"
                fontSize="4"
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                x="47"
                y="10"
              >
                z
              </motion.text>
              <motion.text
                animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -3, -6] }}
                fill="#b9593b"
                fontSize="5"
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
                x="51"
                y="8"
              >
                z
              </motion.text>
            </>
          ) : null}

          {showPartyHat ? (
            <>
              <path d="M6 14l2 3 3 2-3 2-2 3-2-3-3-2 3-2z" fill="#b9593b" />
              <path d="M58 38l2 3 3 2-3 2-2 3-2-3-3-2 3-2z" fill="#b9593b" />
            </>
          ) : null}
        </motion.svg>
      </motion.div>
    </div>
  )
}
