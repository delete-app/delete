import { Button } from '../ui/button'

interface ActionButtonsProps {
  /** Whether the like action is currently locked (timer not complete) */
  isLocked: boolean
  /** Remaining seconds until unlocked */
  remainingTime: number
  /** Whether this would be the free pick */
  isFreePick: boolean
  /** Called when user passes on profile */
  onPass: () => void
  /** Called when user expresses interest */
  onInterest: () => void
  /** Whether pass action is in progress */
  isPassLoading?: boolean
  /** Whether interest action is in progress */
  isInterestLoading?: boolean
}

export function ActionButtons({
  isLocked,
  remainingTime,
  isFreePick,
  onPass,
  onInterest,
  isPassLoading = false,
  isInterestLoading = false,
}: ActionButtonsProps) {
  const isLoading = isPassLoading || isInterestLoading
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Pass button - always available */}
      <Button
        variant="secondary"
        size="lg"
        onClick={onPass}
        disabled={isLoading}
        className="flex-1 max-w-[140px]"
      >
        Not for me
      </Button>

      {/* Interest button - locked until timer completes */}
      <Button
        variant="primary"
        size="lg"
        onClick={onInterest}
        disabled={isLocked || isLoading}
        className="flex-1 max-w-[180px] relative"
      >
        {isLocked ? (
          <span className="flex items-center gap-2">
            <LockIcon className="w-4 h-4" />
            <span>{remainingTime}s</span>
          </span>
        ) : isFreePick ? (
          <span className="flex items-center gap-2">
            <StarIcon className="w-4 h-4" />
            <span>Free Pick</span>
          </span>
        ) : (
          'Interested'
        )}
      </Button>
    </div>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
        clipRule="evenodd"
      />
    </svg>
  )
}
