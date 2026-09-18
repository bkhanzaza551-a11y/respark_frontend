import { useEffect, useMemo, useState } from "react";
import CustomDropdown from '../../components/common/CustomDropdown';
import { CalendarDays, CheckCircle2, Clock, Filter, LogIn, LogOut, RotateCcw, Timer, XCircle, Camera, Building2, CalendarOff } from "lucide-react";
import { Calendar, Timer } from 'lucide-react';
import { api } from "../../api/client";
import EmptyState from "../../components/EmptyState";
import ModuleTabs from "../../components/ModuleTabs";
import PageLoader from "../../components/PageLoader";
import { formatApiError } from "../../utils/apiError";

const statusColor = (status) => {
  switch (status) {
    case "PRESENT": return { bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", text: "#166534", border: "#86efac" };
    case "LATE": return { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", text: "#92400e", border: "#fcd34d" };
    case "HALF_DAY": return { bg: "linear-gradient(135deg, #ffedd5, #fed7aa)", text: "#9a3412", border: "#fdba74" };
    case "ABSENT": return { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", text: "#991b1b", border: "#fca5a5" };
    case "LEAVE": return { bg: "linear-gradient(135deg, #f3e8ff, #e9d5ff)", text: "#6b21a8", border: "#d8b4fe" };
    case "WORKING": return { bg: "linear-gradient(135deg, #e0f2fe, #bae6fd)", text: "#075985", border: "#7dd3fc" };
    case "COMPLETED_SHIFT": return { bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", text: "#166534", border: "#86efac" };
    default: return { bg: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", text: "#334155", border: "#cbd5e1" };
  }
};

const formatTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const formatHours = (minutes) => {
  if (minutes == null) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export default function MyAttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ status: "", month: "" });

  useEffect(() => {
    const controller = new AbortController();
    api.get("/owner/my-attendance", { signal: controller.signal })
      .then((res) => {
        setRecords(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(formatApiError(err, "Failed to load attendance history."));
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredRecords = useMemo(() => {
    let rows = [...records];
    if (filter.status) {
      rows = rows.filter((r) => r.status === filter.status);
    }
    if (filter.month) {
      rows = rows.filter((r) => {
        const d = new Date(r.attendanceDate || r.checkInAt);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return iso === filter.month;
      });
    }
    return rows;
  }, [records, filter]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === "PRESENT" || r.status === "COMPLETED_SHIFT").length;
    const late = filteredRecords.filter((r) => r.status === "LATE").length;
    const absent = filteredRecords.filter((r) => r.status === "ABSENT").length;
    const leave = filteredRecords.filter((r) => r.status === "LEAVE").length;
    const halfDay = filteredRecords.filter((r) => r.status === "HALF_DAY").length;
    const totalMinutes = filteredRecords.reduce((sum, r) => sum + (r.workedMinutes || 0), 0);
    return { total, present, late, absent, leave, halfDay, totalMinutes };
  }, [filteredRecords]);

  const months = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      const d = new Date(r.attendanceDate || r.checkInAt);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(set).sort().reverse();
  }, [records]);

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
          padding: 24px;
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
        .stat-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
        }
        .record-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .record-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
      `}</style>
      <ModuleTabs
        title="My Attendance"
        description="View your personal attendance history, check-in/check-out times, and working hours."
        items={[
          { label: "My Dashboard", to: "/admin/my-dashboard", hint: "Overview" },
          { label: "My Attendance", to: "/admin/my-attendance", hint: "History" },
          { label: "My Appointments", to: "/admin/my-appointments", hint: "Bookings" },
          { label: "My Schedule", to: "/admin/my-schedule", hint: "Hours" },
          { label: "My Profile", to: "/admin/my-profile", hint: "Profile" }
        ]}
      />
      
      {/* Hero Banner */}
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>My Attendance</h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>Your personal attendance history with check-in/check-out times and working hours.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(59,130,246,0.3)" }}>
              <Calendar size={16} style={{ display: 'inline', marginBottom: -2, marginRight: 4 }} /> Total: {stats.total}
            </span>
            <span style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle2 size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Present: {stats.present}
            </span>
            <span style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(245,158,11,0.3)" }}>
              <Timer size={16} style={{ display: 'inline', marginBottom: -2, marginRight: 4 }} /> Hours: {formatHours(stats.totalMinutes)}
            </span>
          </div>
        </div>
      </div>

      {error ? <div style={{ padding: "14px 20px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>{error}</div> : null}
      
      {loading ? <PageLoader title="Loading attendance history" message="Fetching your check-in and check-out records." /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "#1e293b", fontSize: 24, fontWeight: 800 }}>{stats.total}</div>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Total Days</div>
            </div>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "#166534", fontSize: 24, fontWeight: 800 }}>{stats.present}</div>
              <div style={{ color: "#15803d", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Present</div>
            </div>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "#92400e", fontSize: 24, fontWeight: 800 }}>{stats.late}</div>
              <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Late</div>
            </div>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "#9a3412", fontSize: 24, fontWeight: 800 }}>{stats.halfDay}</div>
              <div style={{ color: "#c2410c", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Half Day</div>
            </div>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "#991b1b", fontSize: 24, fontWeight: 800 }}>{stats.absent}</div>
              <div style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Absent</div>
            </div>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "#6b21a8", fontSize: 24, fontWeight: 800 }}>{stats.leave}</div>
              <div style={{ color: "#7e22ce", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>On Leave</div>
            </div>
            <div className="premium-card" style={{ padding: "20px 16px", textAlign: "center", gridColumn: "1 / -1" }}>
              <div style={{ color: "#0f172a", fontSize: 28, fontWeight: 800 }}>{formatHours(stats.totalMinutes)}</div>
              <div style={{ color: "#475569", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Total Worked Hours</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <label style={{ flex: 1, minWidth: 200 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Status Filter</span>
                <CustomDropdown value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                  <option value="WORKING">Working</option>
                  <option value="COMPLETED_SHIFT">Completed Shift</option>
                </CustomDropdown>
              </label>
              <label style={{ flex: 1, minWidth: 200 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Month Filter</span>
                <CustomDropdown value={filter.month} onChange={(e) => setFilter((f) => ({ ...f, month: e.target.value }))}>
                  <option value="">All Months</option>
                  {months.map((m) => {
                    const [y, mo] = m.split("-");
                    const label = new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                    return <option key={m} value={m}>{label}</option>;
                  })}
                </CustomDropdown>
              </label>
              {(filter.status || filter.month) && (
                <button type="button" onClick={() => setFilter({ status: "", month: "" })} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#f8fafc", fontWeight: 700, color: "#475569", cursor: "pointer", height: 42 }}>
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 32 }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Attendance Records</h3>
            
            <div style={{ display: "grid", gap: 16 }}>
              {filteredRecords.map((row) => {
                const sc = statusColor(row.status);
                return (
                  <div key={row.id} className="record-card" style={{ borderLeft: `4px solid ${sc.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                      <div>
                        <strong style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{formatDate(row.attendanceDate || row.checkInAt)}</strong>
                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                          <Building2 size={14} /> {row.branch?.name || "No branch"}
                        </div>
                      </div>
                      <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        {row.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                      <div style={{ padding: "12px 16px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <LogIn size={12} /> Check In
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#064e3b" }}>{formatTime(row.checkInAt)}</div>
                      </div>
                      <div style={{ padding: "12px 16px", borderRadius: 12, background: row.checkOutAt ? "#fef2f2" : "#f1f5f9", border: row.checkOutAt ? "1px solid #fecaca" : "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: row.checkOutAt ? "#991b1b" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <LogOut size={12} /> Check Out
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: row.checkOutAt ? "#7f1d1d" : "#475569" }}>{formatTime(row.checkOutAt)}</div>
                      </div>
                      <div style={{ padding: "12px 16px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#075985", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <Clock size={12} /> Working Hours
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0c4a6e" }}>{formatHours(row.workedMinutes)}</div>
                      </div>
                      {row.overtimeMinutes > 0 && (
                        <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fff7ed", border: "1px solid #ffedd5" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <Timer size={12} /> Overtime
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#7c2d12" }}>{formatHours(row.overtimeMinutes)}</div>
                        </div>
                      )}
                    </div>
                    {row.checkInSelfieUrl || row.checkOutSelfieUrl ? (
                      <div style={{ display: "flex", gap: 16, marginTop: 16, borderTop: "1px dashed #e2e8f0", paddingTop: 16 }}>
                        {row.checkInSelfieUrl && (
                          <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                            <Camera size={14} /> Check-in selfie captured
                          </span>
                        )}
                        {row.checkOutSelfieUrl && (
                          <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                            <Camera size={14} /> Check-out selfie captured
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {!filteredRecords.length && <EmptyState title="No attendance records found" message={filter.status || filter.month ? "No records match your filters. Try adjusting the filters." : "Your check-in and check-out history will appear here once you start marking attendance."} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
