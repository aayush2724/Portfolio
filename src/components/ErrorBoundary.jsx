import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Portfolio Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ background: "var(--bg)", color: "var(--fg)" }}
        >
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="font-display text-3xl font-bold mb-4">
              Something went wrong
            </h1>
            <p className="text-[var(--muted)] mb-8 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                }}
              >
                Reload Page
              </button>
              <a
                href="mailto:aayush2615@gmail.com"
                className="px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider border transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{
                  borderColor: "var(--line)",
                  color: "var(--muted)",
                }}
              >
                Report Issue
              </a>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre
                className="mt-8 p-4 rounded-lg text-xs text-left overflow-auto max-h-48"
                style={{
                  background: "var(--surface)",
                  color: "var(--muted)",
                  border: "1px solid var(--line)",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
