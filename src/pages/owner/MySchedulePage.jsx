import { useEffect, useState } from "react";
import { Calendar, Coffee, Clock } from "lucide-react";
import { api } from "../../api/client";
import EmptyState from "../../components/EmptyState";
import ModuleTabs from "../../components/ModuleTabs";
import PageLoader from "../../components/PageLoader";

export default function MySchedulePage() {
  const [data, setData] = useState({ schedules: [], breaks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/owner/my-schedule").then((response) => {
      setData(response.data);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

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
          padding: 32px;
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
        .schedule-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .schedule-row:hover {
          transform: scale(1.02);
        }
        .schedule-row.active {
          background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
          border: 1px solid #99f6e4;
        }
        .schedule-row.off {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .schedule-row.break {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 1px solid #fde68a;
        }
        .time-badge {
          font-size: 14px;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
      `}</style>
      <ModuleTabs
        title="My Schedule"
        description="Your working hours and break windows are scoped to your own membership."
        items={[
          { label: "My Dashboard", to: "/admin/my-dashboard", hint: "Overview" },
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
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>My Schedule</h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>Review your weekly hours and protected break windows without leaving your personal workspace.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <span style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(59,130,246,0.3)" }}>
              <Clock size={16} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Hours: {data.schedules.length}
            </span>
            <span style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(245,158,11,0.3)" }}>
              <Coffee size={18} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> Breaks: {data.breaks.length}
            </span>
          </div>
        </div>
      </div>

      {loading ? <PageLoader title="Loading your schedule" message="Collecting weekly working hours and break windows." /> : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
        {/* Weekly Hours Card */}
        <div className="premium-card">
          <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <span><Calendar size={18} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /></span> Weekly Hours
          </h3>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: 13 }}>Your recurring roster shifts and active duty times</p>
          
          <div style={{ display: "grid", gap: 14 }}>
            {data.schedules.map((item) => (
              <div key={item.id} className={`schedule-row ${item.isOffDay ? "off" : "active"}`}>
                <strong style={{ color: item.isOffDay ? "#64748b" : "#0f766e", fontSize: 16, fontWeight: 800 }}>
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][item.weekday] || `Day ${item.weekday}`}
                </strong>
                <div className="time-badge" style={{ color: item.isOffDay ? "#94a3b8" : "#0d9488", background: "#fff" }}>
                  {item.isOffDay ? "Off Day" : `${item.startTime} - ${item.endTime}`}
                </div>
              </div>
            ))}
            {!data.schedules.length && <EmptyState title="No weekly schedule saved yet" message="Your scheduled working days and hours will appear here once configured." />}
          </div>
        </div>
        
        {/* Protected Breaks Card */}
        <div className="premium-card">
          <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <span><Coffee size={18} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /></span> Protected Breaks
          </h3>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: 13 }}>Scheduled rest intervals when booking is blocked</p>
          
          <div style={{ display: "grid", gap: 14 }}>
            {data.breaks.map((item) => (
              <div key={item.id} className="schedule-row break">
                <strong style={{ color: "#b45309", fontSize: 16, fontWeight: 800 }}>
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][item.weekday] || `Day ${item.weekday}`}
                </strong>
                <div className="time-badge" style={{ color: "#d97706", background: "#fff" }}>
                  {item.startTime} - {item.endTime}
                </div>
              </div>
            ))}
            {!data.breaks.length && <EmptyState title="No break windows yet" message="Protected break times will appear here once they are added to your roster." />}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
