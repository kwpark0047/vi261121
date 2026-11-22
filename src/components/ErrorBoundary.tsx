import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('W-Vibe ErrorBoundary caught:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-xl border border-rose-200 bg-white p-6 text-slate-900 dark:border-rose-900 dark:bg-slate-900 dark:text-slate-100">
            <h1 className="text-xl font-bold">문제가 발생했습니다 / Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              새로고침 / Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
