import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";
import { formatApiError } from "../utils/apiError";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const access = searchParams.get("access") || "";
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    password: ""
  });
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setErr("");
    setIsSubmitting(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        loginAccessToken: access || undefined
      };
      const result = await login(payload);
      const role = result.membership?.salonRole;
      if (role && role !== "SALON_OWNER" && role !== "MANAGER") {
        nav("/admin/my-dashboard");
      } else {
        nav("/admin/pos");
      }
    } catch (error) {
      setErr(formatApiError(error, "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ background: "#ffffff", padding: "48px 40px", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)", width: "100%", maxWidth: 440, textAlign: "center", position: "relative", overflow: "hidden" }}>
        
        {/* Decorative Top Accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #3b82f6, #0ea5e9)" }}></div>

        <div style={{ marginBottom: 28 }}>
          <img src="/skillify-logo.png" alt="Skillify ERP" style={{ height: 42, objectFit: "contain" }} />
        </div>
        
        <h1 style={{ margin: "0 0 8px 0", fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Welcome back</h1>
        <p style={{ margin: "0 0 32px 0", fontSize: 14, color: "#64748b" }}>Sign in to your salon workspace</p>

        {isSubmitting ? (
          <PageLoader title="Authenticating" message="Verifying your credentials and preparing your dashboard..." />
        ) : (
          <>
            {access ? (
              <div style={{ background: "#f0fdf4", color: "#15803d", padding: "12px", borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
                Secure login verified for this email invite.
              </div>
            ) : null}

            {!access && searchParams.get("email") ? (
              <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "12px", borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
                Your email was prefilled from a secure link. Enter your password to continue.
              </div>
            ) : null}

            {err && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                {err}
              </div>
            )}

            <form onSubmit={onSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  style={{ width: "100%", padding: "14px 16px", fontSize: 14, color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 12, outline: "none", transition: "all 0.2s", background: "#f8fafc", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    style={{ width: "100%", padding: "14px 44px 14px 16px", fontSize: 14, color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 12, outline: "none", transition: "all 0.2s", background: "#f8fafc", boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ width: "100%", padding: "14px", background: isSubmitting ? "#94a3b8" : "#0f172a", color: "#fff", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 12, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {isSubmitting ? "Signing in..." : "Access Workspace"}
              </button>
            </form>

          </>
        )}
      </div>
    </div>
  );
}
