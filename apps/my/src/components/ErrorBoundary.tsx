import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <h2 className="text-xl font-medium text-text mb-2">Something went wrong</h2>
          <p className="text-text-dim text-sm mb-6 max-w-md">
            An unexpected error occurred. Please try again.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-xs text-error bg-error/10 p-4 rounded-lg mb-6 max-w-lg overflow-auto text-left">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={this.handleReset}>
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/')}>Go home</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
