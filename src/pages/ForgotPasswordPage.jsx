import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { formatApiError } from "../utils/apiError";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(formatApiError(requestError, "Could not process your request right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ background: "#ffffff", padding: "48px 40px", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)", width: "100%", maxWidth: 460, textAlign: "center", position: "relative", overflow: "hidden" }}>
        
        {/* Decorative Top Accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #3b82f6, #0ea5e9)" }}></div>

        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "#f0f9ff", color: "#0ea5e9", marginBottom: 24 }}>
          <Mail size={32} strokeWidth={1.5} />
        </div>
        
        <h1 style={{ margin: "0 0 12px 0", fontSize: 26, fontWeight: 700, color: "#0f172a" }}>Forgot Password?</h1>
        
        {!message ? (
          <p style={{ margin: "0 0 32px 0", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
            No worries! Enter the email address associated with your account, and we'll send you a secure link to reset your password.
          </p>
        ) : (
          <p style={{ margin: "0 0 32px 0", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
            Check your inbox! If an account exists with that email, we've sent instructions to reset your password.
          </p>
        )}

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", color: "#b91c1c", padding: "14px 16px", borderRadius: 12, marginBottom: 24, fontSize: 13, textAlign: "left" }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", color: "#15803d", padding: "14px 16px", borderRadius: 12, marginBottom: 24, fontSize: 13, textAlign: "left" }}>
            <CheckCircle2 size={20} />
            <span>{message}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={submit} style={{ textAlign: "left" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{ width: "100%", padding: "14px 16px", fontSize: 14, color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 12, outline: "none", transition: "all 0.2s", background: "#f8fafc", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !email}
              style={{ width: "100%", padding: "14px", background: isSubmitting || !email ? "#94a3b8" : "#0f172a", color: "#fff", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 12, cursor: isSubmitting || !email ? "not-allowed" : "pointer", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {isSubmitting ? <><Loader2 size={18} className="spin" /> Sending...</> : "Send Reset Link"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 32 }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#0f172a"} onMouseLeave={(e) => e.target.style.color = "#64748b"}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
