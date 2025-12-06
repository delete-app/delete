import { useCallback, useState } from 'react'
import { ProfileCard } from '../components/discovery/ProfileCard'
import { ActionButtons } from '../components/discovery/ActionButtons'
import { DailyProgress } from '../components/discovery/DailyProgress'
import { ViewTimer } from '../components/discovery/ViewTimer'
import { useDiscovery } from '../hooks/useDiscovery'
import { Button } from '../components/ui/button'

const MINIMUM_VIEW_TIME = 20 // seconds

export default function Dashboard() {
  const {
    currentProfile,
    isComplete,
    isFreePick,
    viewedCount,
    totalProfiles,
    interestedCount,
    expressInterest,
    pass,
    resetForTesting,
  } = useDiscovery()

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(MINIMUM_VIEW_TIME)

  const handleTimerComplete = useCallback(() => {
    setIsUnlocked(true)
  }, [])

  const handleInterest = useCallback(() => {
    if (!isUnlocked) return
    expressInterest(isFreePick ? 'free_pick' : 'earned')
    // Reset for next profile
    setIsUnlocked(false)
    setSecondsRemaining(MINIMUM_VIEW_TIME)
  }, [isUnlocked, expressInterest, isFreePick])

  const handlePass = useCallback(() => {
    pass()
    // Reset for next profile
    setIsUnlocked(false)
    setSecondsRemaining(MINIMUM_VIEW_TIME)
  }, [pass])

  // All profiles viewed for today
  if (isComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-2xl font-medium mb-3">That's all for today</h2>
          <p className="text-text-muted mb-2">
            You've viewed all {totalProfiles} profiles for today.
          </p>
          {interestedCount > 0 && (
            <p className="text-text-dim text-sm mb-8">
              You expressed interest in {interestedCount}{' '}
              {interestedCount === 1 ? 'person' : 'people'}.
            </p>
          )}
          <p className="text-text-dimmest text-sm">Come back tomorrow for new profiles.</p>

          {/* Dev reset button */}
          {import.meta.env.DEV && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForTesting}
              className="mt-8 text-text-dimmest"
            >
              Reset (dev only)
            </Button>
          )}
        </div>
      </div>
    )
  }

  // No profile to show (shouldn't happen normally)
  if (!currentProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-text-muted">No profiles available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Daily progress header */}
      <div className="mb-6">
        <DailyProgress total={totalProfiles} viewed={viewedCount} freePickAvailable={isFreePick} />
      </div>

      {/* Profile card */}
      <div className="mb-6">
        <ProfileCard profile={currentProfile} />
      </div>

      {/* View timer - cosmetic only, server validates actual time */}
      <div className="mb-6">
        <ViewTimer
          duration={MINIMUM_VIEW_TIME}
          resetKey={currentProfile.id}
          onComplete={handleTimerComplete}
        />
      </div>

      {/* Action buttons */}
      <ActionButtons
        isLocked={!isUnlocked}
        remainingTime={secondsRemaining}
        isFreePick={isFreePick}
        onPass={handlePass}
        onInterest={handleInterest}
      />

      {/* Free pick explanation */}
      {isFreePick && isUnlocked && (
        <p className="text-center text-xs text-text-dimmest mt-4">
          This is your one free pick for today. Choose wisely.
        </p>
      )}

      {/* Dev reset button */}
      {import.meta.env.DEV && (
        <div className="mt-8 text-center">
          <Button variant="ghost" size="sm" onClick={resetForTesting} className="text-text-dimmest">
            Reset (dev only)
          </Button>
        </div>
      )}
    </div>
  )
}
