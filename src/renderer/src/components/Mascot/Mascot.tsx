import { motion, type Variants } from 'framer-motion'
import { useTimerStore } from '../../store/timerStore'

const mascotVariants: Variants = {
  idle: {
    y: [0, -2, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
  },
  focusing: {
    y: [0, -6, 0],
    rotate: [0, -2, 2, 0],
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
  },
  break: {
    y: [0, -2, 0],
    scale: [1, 1.02, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  complete: {
    y: [0, -9, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeOut' }
  }
}

export default function Mascot(): React.JSX.Element {
  const mascotState = useTimerStore((state) => state.mascotState)
  const isBreak = mascotState === 'break'
  const isFocusing = mascotState === 'focusing'
  const isComplete = mascotState === 'complete'

  return (
    <div className="flex items-center justify-center py-2">
      <motion.svg
        animate={mascotState}
        className="h-[108px] w-[108px]"
        shapeRendering="crispEdges"
        style={{
          filter:
            'drop-shadow(0 1px 0 rgba(47,37,29,0.14)) drop-shadow(0 0 5px rgba(217,119,87,0.2))'
        }}
        variants={mascotVariants}
        viewBox="0 0 64 64"
      >
        <rect fill="#d57958" height="20" width="40" x="12" y="8" />
        <rect fill="#d57958" height="8" width="56" x="4" y="28" />
        <rect fill="#d57958" height="4" width="1" x="3" y="30" />
        <rect fill="#d57958" height="4" width="1" x="60" y="30" />

        <rect fill="#d57958" height="10" width="4" x="14" y="36" />
        <rect fill="#d57958" height="10" width="4" x="24" y="36" />
        <rect fill="#d57958" height="10" width="4" x="36" y="36" />
        <rect fill="#d57958" height="10" width="4" x="46" y="36" />

        {isBreak ? (
          <>
            <rect fill="#101010" height="2" width="8" x="15" y="18" />
            <rect fill="#101010" height="2" width="8" x="41" y="18" />
          </>
        ) : isComplete ? (
          <>
            <path d="M17 18l2 2 2 2-2 2-2 2-2-2-2-2 2-2z" fill="#101010" />
            <path d="M43 18l2 2 2 2-2 2-2 2-2-2-2-2 2-2z" fill="#101010" />
          </>
        ) : isFocusing ? (
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

        {isBreak ? (
          <>
            <circle cx="48" cy="10" fill="#b9593b" r="1.4" />
            <circle cx="52" cy="7" fill="#b9593b" r="1.1" />
          </>
        ) : null}

        {isFocusing ? (
          <motion.circle
            animate={{ opacity: [0.25, 0.8, 0.25], y: [0, 2, 0] }}
            cx="49"
            cy="10"
            fill="#b9593b"
            r="2"
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : null}

        {isComplete ? (
          <>
            <path d="M6 14l2 3 3 2-3 2-2 3-2-3-3-2 3-2z" fill="#b9593b" />
            <path d="M58 38l2 3 3 2-3 2-2 3-2-3-3-2 3-2z" fill="#b9593b" />
          </>
        ) : null}
      </motion.svg>
    </div>
  )
}
