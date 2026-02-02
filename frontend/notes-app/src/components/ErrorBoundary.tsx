import { Component, type ReactNode, type ErrorInfo } from "react";
import { logComponentError } from "@/lib/errorHandler";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and logger
    logComponentError(
      error,
      errorInfo as { componentStack?: string },
      "ErrorBoundary",
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <ErrorOutlineIcon
                  className="text-red-500"
                  sx={{ fontSize: 40 }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-white mb-2">
              Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-400 text-sm mb-6">
              We're sorry for the inconvenience. An unexpected error has
              occurred.
            </p>

            {/* Error Details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/5 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
