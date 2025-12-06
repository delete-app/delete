import { useCallback, useEffect, useState } from 'react'
import { ProfileCard } from '../components/discovery/ProfileCard'
import { ActionButtons } from '../components/discovery/ActionButtons'
import { DailyProgress } from '../components/discovery/DailyProgress'
import { ViewTimer } from '../components/discovery/ViewTimer'
import { useDailyDiscovery } from '../hooks/useDailyDiscovery'
import { Button } from '../components/ui/button'

const MINIMUM_VIEW_TIME = 20 // seconds (cosmetic - server validates actual time)

export default function Dashboard() {
  const {
    currentProfile,
    activeViewId,
    isComplete,
    isFreePick,
    viewedCount,
    totalProfiles,
    interestedCount,
    isLoading,
    error,
    startView,
    expressInterest,
    pass,
    resetForTesting,
    isExpressingInterest,
    isPassing,
  } = useDailyDiscovery()

  // Track timer completion per profile using a map to avoid useEffect setState
  const [completedProfiles, setCompletedProfiles] = useState<Set<string>>(new Set())

  // Derive timer completion from the set
  const isTimerComplete = currentProfile ? completedProfiles.has(currentProfile.id) : false

  // Start view when profile changes
  useEffect(() => {
    if (currentProfile && !activeViewId) {
      startView()
    }
  }, [currentProfile, activeViewId, startView])

  const handleTimerComplete = useCallback(() => {
    if (currentProfile) {
      setCompletedProfiles((prev) => new Set(prev).add(currentProfile.id))
    }
  }, [currentProfile])

  const handleInterest = useCallback(async () => {
    const result = await expressInterest()
    if (!result.success && result.error) {
      // Server rejected - likely didn't meet minimum time
      console.error('Interest failed:', result.error)
    }
  }, [expressInterest])

  const handlePass = useCallback(async () => {
    const result = await pass()
    if (!result.success && result.error) {
      console.error('Pass failed:', result.error)
    }
  }, [pass])

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-dim rounded w-48 mx-auto mb-4" />
            <div className="h-96 bg-surface-dim rounded mb-4" />
            <div className="h-12 bg-surface-dim rounded w-32 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-text-muted mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </div>
    )
  }

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

  // Determine if interest button should be unlocked
  // Free pick: always unlocked after timer (no server validation needed)
  // Earned: timer is cosmetic, server validates actual time
  const isUnlocked = isFreePick || isTimerComplete

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
        remainingTime={0}
        isFreePick={isFreePick}
        onPass={handlePass}
        onInterest={handleInterest}
        isPassLoading={isPassing}
        isInterestLoading={isExpressingInterest}
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
