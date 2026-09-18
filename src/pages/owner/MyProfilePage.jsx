import { useEffect, useState } from "react";
import { User, Mail, Tag, MapPin, Globe, IdCard, Lock, Target, Calendar, Save } from "lucide-react";
import { api } from "../../api/client";
import EmptyState from "../../components/EmptyState";
import ModuleTabs from "../../components/ModuleTabs";
import PageLoader from "../../components/PageLoader";
import IndianPhoneInput from "../../components/IndianPhoneInput";

const statusConfig = {
  PRESENT: { bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", color: "#166534", label: "Present" },
  COMPLETED_SHIFT: { bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", color: "#166534", label: "Completed" },
  LATE: { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#92400e", label: "Late" },
  HALF_DAY: { bg: "linear-gradient(135deg, #ffedd5, #fed7aa)", color: "#9a3412", label: "Half Day" },
  LEAVE: { bg: "linear-gradient(135deg, #f3e8ff, #e9d5ff)", color: "#5b21b6", label: "Leave" },
  WORKING: { bg: "linear-gradient(135deg, #e0f2fe, #bae6fd)", color: "#0369a1", label: "Working" },
  ABSENT: { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#991b1b", label: "Absent" },
};

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ width: 32, height: 32, background: "#f8fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, border: "1px solid #e2e8f0" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{value}</div>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const [form, setForm] = useState({ phone: "", profileNote: "", avatarUrl: "" });
  const [services, setServices] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [profileMeta, setProfileMeta] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    api.get("/owner/my-profile").then((response) => {
      setForm({
        phone: response.data?.phone || "",
        profileNote: response.data?.profileNote || "",
        avatarUrl: response.data?.avatarUrl || ""
      });
      setServices(response.data?.serviceAssignments || []);
      setAttendanceHistory(response.data?.attendanceHistory || []);
      setProfileMeta(response.data);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.patch("/owner/my-profile", form);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const name = profileMeta?.user?.name || "Your Profile";
  const email = profileMeta?.user?.email || "";
  const role = profileMeta?.salonRole || "STAFF";
  const branch = profileMeta?.branch?.name || "All Branches";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="page-shell" style={{ background: "#f1f5f9", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
        }
        .premium-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .premium-btn {
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .premium-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          box-shadow: none !important;
        }
        .premium-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59,130,246,0.2);
        }
        .premium-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59,130,246,0.3);
        }
      `}</style>
      <ModuleTabs
        title="My Profile"
        description="Staff-scoped profile, service assignment visibility, and basic personal workspace settings."
        items={[
          { label: "My Dashboard", to: "/admin/my-dashboard", hint: "Overview" },
          { label: "My Appointments", to: "/admin/my-appointments", hint: "Queue" },
          { label: "My Schedule", to: "/admin/my-schedule", hint: "Hours" },
          { label: "My Profile", to: "/admin/my-profile", hint: "Profile" }
        ]}
      />

      {loading ? (
        <PageLoader title="Loading your profile" message="Preparing account details, branch context, and service assignments." />
      ) : (
        <>
          {/* Profile Hero Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e1b4b 100%)",
            borderRadius: 20,
            padding: "32px 36px",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden"
          }}>
            {/* decorative circles */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, right: 80, width: 160, height: 160, borderRadius: "50%", background: "rgba(59,130,246,0.06)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {form.avatarUrl && !imgError ? (
                  <img
                    src={form.avatarUrl}
                    alt={name}
                    onError={() => setImgError(true)}
                    style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                  />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff", border: "4px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                    {initials || <User size={32} color="white" />}
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", border: "3px solid #0f172a" }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{name}</h1>
                <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 14, fontWeight: 500 }}>{email}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(59,130,246,0.3)" }}>
                    {role}
                  </span>
                  <span style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(139,92,246,0.3)" }}>
                    <MapPin size={14} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> {branch}
                  </span>
                  <span style={{ background: profileMeta?.showInCatalog ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)", color: profileMeta?.showInCatalog ? "#6ee7b7" : "#94a3b8", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1px solid ${profileMeta?.showInCatalog ? "rgba(16,185,129,0.3)" : "rgba(100,116,139,0.3)"}` }}>
                    {profileMeta?.showInCatalog ? "<Globe size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Visible in catalog" : "<Lock size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Hidden from catalog"}
                  </span>
                  <span style={{ background: "rgba(245,158,11,0.15)", color: "#fcd34d", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(245,158,11,0.25)" }}>
                    <Target size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> {services.length} services
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(350px, 1.5fr) minmax(300px, 1fr)", gap: 24, alignItems: "start" }}>
            {/* Left: Edit Form */}
            <div className="premium-card">
              <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>✏️</span> Edit Profile
                </h2>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>Update your contact info and bio</p>
              </div>

              <form onSubmit={handleSave} style={{ display: "grid", gap: 24 }}>
                <label style={{ display: "grid", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Phone Number</span>
                  <IndianPhoneInput value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
                </label>

                <label style={{ display: "grid", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Avatar / Photo URL</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={form.avatarUrl}
                      placeholder="https://example.com/your-photo.jpg"
                      onChange={(event) => { setForm((current) => ({ ...current, avatarUrl: event.target.value })); setImgError(false); }}
                      style={{ width: "100%", padding: "14px 18px", border: "1px solid #cbd5e1", borderRadius: 12, fontSize: 15, color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "all 0.2s", background: "#f8fafc" }}
                      onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  {form.avatarUrl && !imgError && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: 12, border: "1px solid #bbf7d0" }}>
                      <img src={form.avatarUrl} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} onError={() => setImgError(true)} />
                      <span style={{ fontSize: 14, color: "#166534", fontWeight: 700 }}><CheckCircle2 size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Image preview looks good</span>
                    </div>
                  )}
                </label>

                <label style={{ display: "grid", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Bio / Profile Note</span>
                  <textarea
                    value={form.profileNote}
                    placeholder="Share your expertise, specialties, or a short intro about yourself..."
                    onChange={(event) => setForm((current) => ({ ...current, profileNote: event.target.value }))}
                    style={{ padding: "16px 18px", border: "1px solid #cbd5e1", borderRadius: 12, fontSize: 15, fontFamily: "inherit", minHeight: 140, resize: "vertical", outline: "none", color: "#0f172a", lineHeight: 1.6, transition: "all 0.2s", background: "#f8fafc" }}
                    onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
                  />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    className="premium-btn premium-btn-primary"
                  >
                    {saving ? "Saving..." : "<Save size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Save Changes"}
                  </button>
                  {status === "success" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontWeight: 800, fontSize: 14, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", padding: "10px 18px", borderRadius: 10, border: "1px solid #a7f3d0" }}>
                      <CheckCircle2 size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Profile updated!
                    </span>
                  )}
                  {status === "error" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", fontWeight: 800, fontSize: 14, background: "linear-gradient(135deg, #fef2f2, #fee2e2)", padding: "10px 18px", borderRadius: 10, border: "1px solid #fecaca" }}>
                      ✗ Could not save
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Profile Info */}
              <div className="premium-card">
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span><IdCard size={18} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /></span> Profile Snapshot
                </h3>
                <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>Your current account identity</p>
                <InfoRow icon={<User size={16} color="#475569" />} label="Full Name" value={profileMeta?.user?.name || "—"} />
                <InfoRow icon={<Mail size={16} color="#475569" />} label="Email" value={profileMeta?.user?.email || "—"} />
                <InfoRow icon={<Tag size={16} color="#475569" />} label="Role" value={role} />
                <InfoRow icon={<MapPin size={16} color="#475569" />} label="Branch" value={branch} />
                <InfoRow icon={<Globe size={16} color="#475569" />} label="Catalog visibility" value={profileMeta?.showInCatalog ? "Visible to customers" : "Hidden from catalog"} />
              </div>

              {/* Assigned Services */}
              <div className="premium-card">
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span><Target size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /></span> Assigned Services
                  <span style={{ marginLeft: "auto", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#1d4ed8", fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 12, border: "1px solid #bfdbfe" }}>{services.length}</span>
                </h3>
                <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>Services you are linked to perform</p>
                {services.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {services.map((item) => (
                      <span key={item.id} style={{ background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <CheckCircle2 size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> {item.service?.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No service assignments yet" message="Assigned service specialties will appear here once linked to your staff profile." />
                )}
              </div>

              {/* Recent Attendance */}
              <div className="premium-card">
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span><Calendar size={18} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /></span> Recent Attendance
                </h3>
                <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>Last 10 attendance records</p>
                {attendanceHistory.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {attendanceHistory.slice(0, 10).map((row) => {
                      const cfg = statusConfig[row.status] || statusConfig.ABSENT;
                      return (
                        <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                              {new Date(row.attendanceDate || row.checkInAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                              {new Date(row.checkInAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              {row.checkOutAt ? ` → ${new Date(row.checkOutAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : " (ongoing)"}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                            <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>{cfg.label}</span>
                            {row.workedMinutes != null && (
                              <span style={{ fontSize: 12, color: "#0284c7", fontWeight: 700 }}>
                                {Math.floor(row.workedMinutes / 60)}h {row.workedMinutes % 60}m
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No attendance yet" message="Your recent attendance history will appear here once you start checking in." />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
