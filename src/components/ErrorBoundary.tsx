import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.removeItem('toolnest_recent');
      localStorage.removeItem('toolnest_favorites');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                The application encountered an unexpected display error on this browser. Your data is safe.
              </p>
            </div>

            {/* Error Message Details Accordion */}
            {this.state.error && (
              <div className="text-left bg-slate-100 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-36">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Error Details:
                </div>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleClearStorageAndReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
