import { Component } from 'react'
import { Link }      from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen mesh-bg flex items-center
        justify-center px-5">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center
          flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border
            border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              An unexpected error occurred. Please refresh the page or
              go back to home.
            </p>
            {this.state.error && (
              <p className="mt-3 text-xs font-mono text-red-400/60
                bg-red-500/5 rounded-lg px-3 py-2">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-outline flex-1 py-3 rounded-xl text-sm
                flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Retry
            </button>
            <Link to="/" className="flex-1">
              <button className="btn-primary w-full py-3 rounded-xl text-sm">
                Go Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}