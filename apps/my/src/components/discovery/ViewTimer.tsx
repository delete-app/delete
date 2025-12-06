import { useTimer } from 'react-timer-hook'
import { useEffect, useMemo } from 'react'

interface ViewTimerProps {
  /** Duration in seconds */
  duration: number
  /** Key to reset timer (e.g., profile ID) */
  resetKey: string | number | null
  /** Called when timer completes */
  onComplete: () => void
}

/**
 * View timer component that shows countdown progress.
 * Uses react-timer-hook for reliable timing.
 *
 * Note: This is a UX element only. Server validates actual time spent.
 */
export function ViewTimer({ duration, resetKey, onComplete }: ViewTimerProps) {
  const expiryTimestamp = useMemo(() => {
    const time = new Date()
    time.setSeconds(time.getSeconds() + duration)
    return time
  }, [duration])

  const { seconds, isRunning, restart } = useTimer({
    expiryTimestamp,
    onExpire: onComplete,
    autoStart: true,
  })

  // Restart timer when resetKey changes
  useEffect(() => {
    const time = new Date()
    time.setSeconds(time.getSeconds() + duration)
    restart(time, true)
  }, [resetKey, duration, restart])

  const progress = ((duration - seconds) / duration) * 100
  const isComplete = !isRunning && seconds === 0

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-text transition-all duration-300 ease-linear"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Time remaining text */}
      {!isComplete && (
        <p className="text-center text-xs text-text-dimmest mt-2">{seconds}s to unlock actions</p>
      )}
    </div>
  )
}

interface UseViewTimerOptions {
  /** Duration in seconds */
  duration: number
  /** Key to reset timer (e.g., profile ID) */
  resetKey?: string | number | null
  /** Called when timer completes */
  onComplete?: () => void
}

interface UseViewTimerResult {
  /** Seconds remaining */
  seconds: number
  /** Whether timer is currently running */
  isRunning: boolean
  /** Whether timer has completed (reached 0) */
  isComplete: boolean
  /** Progress percentage (0-100) */
  progress: number
  /** Restart the timer */
  restart: () => void
}

/**
 * Hook for view timer state using react-timer-hook.
 * Provides reliable timing that doesn't drift.
 */
export function useViewTimer({
  duration,
  resetKey,
  onComplete,
}: UseViewTimerOptions): UseViewTimerResult {
  const expiryTimestamp = useMemo(() => {
    const time = new Date()
    time.setSeconds(time.getSeconds() + duration)
    return time
  }, [duration])

  const {
    seconds,
    isRunning,
    restart: timerRestart,
  } = useTimer({
    expiryTimestamp,
    onExpire: onComplete,
    autoStart: true,
  })

  // Restart timer when resetKey changes
  useEffect(() => {
    const time = new Date()
    time.setSeconds(time.getSeconds() + duration)
    timerRestart(time, true)
  }, [resetKey, duration, timerRestart])

  const isComplete = !isRunning && seconds === 0
  const progress = ((duration - seconds) / duration) * 100

  const restart = () => {
    const time = new Date()
    time.setSeconds(time.getSeconds() + duration)
    timerRestart(time, true)
  }

  return {
    seconds,
    isRunning,
    isComplete,
    progress: Math.min(progress, 100),
    restart,
  }
}
