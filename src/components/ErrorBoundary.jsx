import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    
    const isChunkLoadError = error?.message && (
      /Failed to fetch dynamically imported module/i.test(error.message) || 
      /Importing a module script failed/i.test(error.message) ||
      /dynamically imported module/i.test(error.message)
    );
    
    if (isChunkLoadError) {
      const retryCount = parseInt(sessionStorage.getItem("chunk_reload_count") || "0");
      if (retryCount < 2) {
        sessionStorage.setItem("chunk_reload_count", String(retryCount + 1));
        setTimeout(() => window.location.reload(), 1000);
      } else {
        sessionStorage.removeItem("chunk_reload_count");
      }
    }
  }

  handleRetry = () => {
    sessionStorage.removeItem("chunk_reload_count");
    sessionStorage.removeItem("page-has-been-force-refreshed");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message && 
        /Failed to fetch dynamically imported module/i.test(this.state.error.message);
      
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "system-ui, sans-serif", padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: "center", background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{isChunkError ? "🔄" : "⚠️"}</div>
            <h2 style={{ margin: "0 0 8px", color: "#0f172a" }}>
              {isChunkError ? "Loading Failed" : "Something went wrong"}
            </h2>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
              {isChunkError 
                ? "Failed to load page resources. This usually happens after a new deployment."
                : "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={this.handleRetry} style={{ padding: "10px 24px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Retry
              </button>
              <button onClick={() => { sessionStorage.clear(); window.location.href = "/"; }} style={{ padding: "10px 24px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Go Home
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: 16, textAlign: "left" }}>
                <summary style={{ cursor: "pointer", color: "#94a3b8", fontSize: 12 }}>Error details</summary>
                <pre style={{ marginTop: 8, padding: 12, background: "#f1f5f9", borderRadius: 8, fontSize: 11, overflow: "auto", maxHeight: 200, color: "#64748b" }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
