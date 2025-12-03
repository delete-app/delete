interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} border-border border-t-text rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

interface LoadingProps {
  text?: string
}

export function Loading({ text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <Spinner size="lg" />
      {text && <p className="text-text-dim text-sm">{text}</p>}
    </div>
  )
}
