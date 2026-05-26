import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-20 text-center">
          <div className="rounded-full bg-danger-50 p-4 dark:bg-danger-500/10">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-neutral-500">
            {this.state.error?.message ?? 'Terjadi kesalahan yang tidak terduga'}
          </p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={this.handleRetry}>
              Coba Lagi
            </Button>
            <Button
              variant="ghost"
              onClick={() => { window.location.href = '/'; }}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
