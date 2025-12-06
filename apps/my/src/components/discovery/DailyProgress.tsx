interface DailyProgressProps {
  /** Total profiles available today */
  total: number
  /** Number of profiles viewed/actioned */
  viewed: number
  /** Whether free pick is still available */
  freePickAvailable: boolean
}

export function DailyProgress({ total, viewed, freePickAvailable }: DailyProgressProps) {
  const remaining = total - viewed

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="text-text-muted">Today's profiles:</span>
        <span className="text-text font-medium">
          {remaining} of {total} remaining
        </span>
      </div>

      {freePickAvailable && (
        <div className="flex items-center gap-1.5 text-text">
          <StarIcon className="w-4 h-4" />
          <span className="text-xs">Free pick available</span>
        </div>
      )}
    </div>
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
