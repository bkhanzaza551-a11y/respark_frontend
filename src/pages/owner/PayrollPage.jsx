import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomDropdown from '../../components/common/CustomDropdown';
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";
import { useBranch } from "../../context/BranchContext";
import EmptyState from "../../components/EmptyState";
import ModuleTabs from "../../components/ModuleTabs";
import { formatApiError } from "../../utils/apiError";
import { normalizeImageUrl } from "../../utils/imageUrl";
import PageLoader from "../../components/PageLoader";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Edit3, Eye, FileText, History, LogIn, LogOut, MapPin, PlusCircle, Printer, RotateCcw, Save, Timer, User, UserPlus, Users, XCircle, Activity, List, LayoutDashboard } from "lucide-react";

const emptyAttendanceSettings = {
  officeStartTime: "09:00",
  officeEndTime: "18:00",
  lateAfterTime: "09:15",
  halfDayMinutes: 240,
  minimumWorkingMinutes: 480,
  overtimeEnabled: false,
  overtimeThresholdMinutes: 480,
  checkoutSelfieRequired: false,
  allowManualAttendanceEdits: true
};

const emptyAttendanceReport = {
  period: "daily",
  label: "Daily",
  start: null,
  end: null,
  rows: [],
  summary: { totalRows: 0, totalStaff: 0, present: 0, absent: 0, leave: 0, late: 0, halfDay: 0, working: 0, completedShift: 0 }
};

const emptyAttendanceCalendar = {
  period: "monthly",
  label: "Monthly",
  start: null,
  end: null,
  rows: [],
  summary: { totalRows: 0, totalStaff: 0, present: 0, absent: 0, leave: 0, late: 0, halfDay: 0, working: 0, completedShift: 0 }
};

const emptyManualEdit = {
  attendanceDate: "",
  checkInAt: "",
  checkOutAt: "",
  status: "",
  note: "",
  adminRemark: "",
  reason: ""
};

const emptyManualCreate = {
  userSalonId: "",
  attendanceDate: new Date().toISOString().slice(0, 10),
  checkInAt: "",
  checkOutAt: "",
  status: "",
  note: "",
  adminRemark: ""
};

const toLocalDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
};
const toMonthInput = (value) => {
  const date = value ? new Date(value) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const statusTheme = {
  PRESENT: { label: "P", bg: "#dcfce7", color: "#166534", gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" },
  LATE: { label: "L", bg: "#fef3c7", color: "#92400e", gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" },
  HALF_DAY: { label: "H", bg: "#fef9c3", color: "#854d0e", gradient: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)" },
  ABSENT: { label: "A", bg: "#fee2e2", color: "#b91c1c", gradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" },
  LEAVE: { label: "LV", bg: "#dbeafe", color: "#1d4ed8", gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)" },
  WORKING: { label: "W", bg: "#cffafe", color: "#0f766e", gradient: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)" },
  COMPLETED_SHIFT: { label: "C", bg: "#f3e8ff", color: "#6b21a8", gradient: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)" },
  OFF: { label: "OFF", bg: "#f1f5f9", color: "#475569", gradient: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)" }
};

const attendanceMetricKeys = ["present", "late", "halfDay", "absent", "leave", "working", "completedShift"];
const attendanceMetricLabel = {
  present: "Present",
  late: "Late",
  halfDay: "Half Day",
  absent: "Absent",
  leave: "Leave",
  working: "Working",
  completedShift: "Completed"
};

const toIsoDateFromMonthDay = (monthValue, day) => `${monthValue}-${String(day).padStart(2, "0")}`;

export default function PayrollPage() {
  const location = useLocation();
  const { selectedBranchId, selectedBranchName } = useBranch();
  const [attendance, setAttendance] = useState([]);
  const [attendanceMeta, setAttendanceMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [attendanceSummary, setAttendanceSummary] = useState({ totalStaff: 0, presentToday: 0, absentToday: 0, lateStaff: 0, currentlyWorking: 0, completedShift: 0, onLeave: 0 });
  const [attendanceSettings, setAttendanceSettings] = useState(emptyAttendanceSettings);
  const [attendanceReport, setAttendanceReport] = useState(emptyAttendanceReport);
  const [attendanceReportPeriod, setAttendanceReportPeriod] = useState("daily");
  const [attendanceCalendarMonth, setAttendanceCalendarMonth] = useState(() => toMonthInput());
  const [attendanceCalendar, setAttendanceCalendar] = useState(emptyAttendanceCalendar);
  const [staffUsers, setStaffUsers] = useState([]);
  const [attendanceDaySheet, setAttendanceDaySheet] = useState([]);
  const [daySheetDate, setDaySheetDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [filters, setFilters] = useState({ attendanceQ: "", attendanceStatus: "", attendanceDate: "" });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState("");
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [manualEdit, setManualEdit] = useState(emptyManualEdit);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualCreate, setManualCreate] = useState(emptyManualCreate);
  const [manualCreateSaving, setManualCreateSaving] = useState(false);
  const [selectedCalendarCell, setSelectedCalendarCell] = useState(null);
  const manualCreateRef = useRef(null);
  const detailPanelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const calendarDate = `${attendanceCalendarMonth}-01`;
      const branchParams = selectedBranchId ? { branchId: selectedBranchId } : {};

      const safeGet = async (url, params = {}) => {
        try { return (await api.get(url, { params })).data; } catch { return null; }
      };

      const [attendanceData, summaryData, settingsData, staffData, daySheetData, attendanceReportData, attendanceCalData] = await Promise.all([
        safeGet("/owner/attendance", { ...branchParams, page: attendanceMeta.page, limit: 50, ...(filters.attendanceQ ? { q: filters.attendanceQ } : {}), ...(filters.attendanceStatus ? { status: filters.attendanceStatus } : {}), ...(filters.attendanceDate ? { date: filters.attendanceDate } : {}) }),
        safeGet("/owner/attendance/summary", { ...branchParams, ...(filters.attendanceDate ? { date: filters.attendanceDate } : {}) }),
        safeGet("/owner/attendance/settings"),
        safeGet("/owner/staff-users", branchParams),
        safeGet("/owner/attendance/day-sheet", { ...branchParams, date: daySheetDate }),
        safeGet("/owner/attendance/reports", { ...branchParams, period: attendanceReportPeriod, ...(filters.attendanceDate ? { date: filters.attendanceDate } : {}) }),
        safeGet("/owner/attendance/reports", { ...branchParams, period: "monthly", date: calendarDate })
      ]);
      setAttendance(attendanceData?.rows || attendanceData || []);
      setAttendanceMeta({ total: attendanceData?.total || 0, page: attendanceData?.page || 1, limit: attendanceData?.limit || 50, totalPages: attendanceData?.totalPages || 1 });
      setAttendanceSummary(summaryData || {});
      setAttendanceSettings((current) => ({ ...current, ...(settingsData || {}) }));
      setStaffUsers(staffData || []);
      setAttendanceDaySheet(daySheetData?.rows || []);
      setAttendanceReport(attendanceReportData || emptyAttendanceReport);
      setAttendanceCalendar(attendanceCalData || emptyAttendanceCalendar);
      setLoading(false);
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not load attendance workspace"), success: "" });
      setLoading(false);
    }
  }, [attendanceCalendarMonth, attendanceMeta.page, attendanceReportPeriod, filters, selectedBranchId, daySheetDate]);

  const downloadAttendanceReport = (format) => {
    const searchParams = new URLSearchParams({
      period: attendanceReportPeriod,
      ...(filters.attendanceDate ? { date: filters.attendanceDate } : {}),
      ...(selectedBranchId ? { branchId: selectedBranchId } : {})
    });
    window.open(`/api/v1/owner/attendance/reports/export.${format}?${searchParams.toString()}`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  const selectedAttendanceRow = useMemo(
    () => attendance.find((row) => row.id === selectedAttendanceId) || null,
    [attendance, selectedAttendanceId]
  );
  const attendanceCalendarDays = useMemo(() => {
    const [year, month] = attendanceCalendarMonth.split("-").map(Number);
    const total = new Date(year, month, 0).getDate();
    return Array.from({ length: total }, (_, index) => index + 1);
  }, [attendanceCalendarMonth]);
  const attendanceCalendarWeekendMap = useMemo(() => {
    const [year, month] = attendanceCalendarMonth.split("-").map(Number);
    return Object.fromEntries(
      attendanceCalendarDays.map((day) => {
        const dow = new Date(year, month - 1, day).getDay();
        return [day, dow === 0];
      })
    );
  }, [attendanceCalendarDays, attendanceCalendarMonth]);
  const attendanceCalendarRows = useMemo(() => {
    const bucket = new Map();
    (attendanceCalendar.rows || []).forEach((row) => {
      if (!row?.staffCode || !row?.date) return;
      const date = new Date(row.date);
      const day = date.getDate();
      if (!bucket.has(row.staffCode)) {
        bucket.set(row.staffCode, {
          staffCode: row.staffCode,
          staffName: row.staffName,
          branchName: row.branchName,
          cells: {},
          totals: {
            present: 0,
            late: 0,
            halfDay: 0,
            absent: 0,
            leave: 0,
            working: 0,
            completedShift: 0
          }
        });
      }
      const staffRow = bucket.get(row.staffCode);
      staffRow.cells[day] = row;
      if (row.status === "PRESENT") staffRow.totals.present += 1;
      if (row.status === "LATE") staffRow.totals.late += 1;
      if (row.status === "HALF_DAY") staffRow.totals.halfDay += 1;
      if (row.status === "ABSENT") staffRow.totals.absent += 1;
      if (row.status === "LEAVE") staffRow.totals.leave += 1;
      if (row.status === "WORKING") staffRow.totals.working += 1;
      if (row.status === "COMPLETED_SHIFT") staffRow.totals.completedShift += 1;
    });
    return Array.from(bucket.values()).sort((left, right) => left.staffName.localeCompare(right.staffName));
  }, [attendanceCalendar.rows]);

  const loadAttendanceDetail = async (attendanceId) => {
    try {
      setDetailLoading(true);
      const response = await api.get(`/owner/attendance/records/${attendanceId}`);
      setSelectedAttendanceId(attendanceId);
      setSelectedAttendance(response.data);
      setManualEdit({
        attendanceDate: toLocalDateInput(response.data.attendanceDate),
        checkInAt: toLocalDateTimeInput(response.data.checkInAt),
        checkOutAt: toLocalDateTimeInput(response.data.checkOutAt),
        status: response.data.status || "",
        note: response.data.note || "",
        adminRemark: response.data.adminRemark || "",
        reason: ""
      });
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not load attendance details"), success: "" });
    } finally {
      setDetailLoading(false);
    }
  };

  const saveAttendanceSettings = async (event) => {
    event.preventDefault();
    try {
      setSettingsSaving(true);
      await api.post("/owner/attendance/settings", {
        ...attendanceSettings,
        halfDayMinutes: Number(attendanceSettings.halfDayMinutes),
        minimumWorkingMinutes: Number(attendanceSettings.minimumWorkingMinutes)
      });
      setStatus({ error: "", success: "Attendance settings updated." });
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not save attendance settings"), success: "" });
    } finally {
      setSettingsSaving(false);
    }
  };

  const saveManualEdit = async (event) => {
    event.preventDefault();
    if (!selectedAttendance) return;
    const confirmMsg = `Confirm manual attendance update for ${selectedAttendance.userSalon?.user?.name || "staff"}?\n\nReason: ${manualEdit.reason}`;
    if (!window.confirm(confirmMsg)) return;
    try {
      setManualSaving(true);
      await api.patch(`/owner/attendance/${selectedAttendance.id}/manual-update`, {
        attendanceDate: manualEdit.attendanceDate || undefined,
        checkInAt: manualEdit.checkInAt || undefined,
        checkOutAt: manualEdit.checkOutAt || undefined,
        status: manualEdit.status || undefined,
        note: manualEdit.note || undefined,
        adminRemark: manualEdit.adminRemark || undefined,
        reason: manualEdit.reason
      });
      setStatus({ error: "", success: "Attendance record updated with audit trail." });
      await load();
      await loadAttendanceDetail(selectedAttendance.id);
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not update attendance record"), success: "" });
    } finally {
      setManualSaving(false);
    }
  };

  const saveManualCreate = async (event) => {
    event.preventDefault();
    try {
      setManualCreateSaving(true);
      await api.post("/owner/attendance", {
        userSalonId: manualCreate.userSalonId,
        branchId: selectedBranchId || undefined,
        attendanceDate: manualCreate.attendanceDate,
        checkInAt: manualCreate.checkInAt || undefined,
        checkOutAt: manualCreate.checkOutAt || undefined,
        status: manualCreate.status || undefined,
        adminRemark: manualCreate.adminRemark || undefined,
        note: manualCreate.note || undefined,
        verificationMethod: "MANUAL"
      });
      setStatus({ error: "", success: "Manual attendance entry created." });
      setManualCreate((current) => ({ ...emptyManualCreate, attendanceDate: current.attendanceDate }));
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not create manual attendance"), success: "" });
    } finally {
      setManualCreateSaving(false);
    }
  };

  const fetchExistingAttendance = async (userSalonId, attendanceDate) => {
    if (!userSalonId || !attendanceDate) return;
    try {
      const res = await api.get("/owner/attendance", { params: { userSalonId, date: attendanceDate, limit: 1 } });
      const rows = res.data?.rows || res.data || [];
      const existing = Array.isArray(rows) ? rows.find((r) => r.userSalonId === userSalonId) : null;
      if (existing) {
        setManualCreate((current) => ({
          ...current,
          checkInAt: toLocalDateTimeInput(existing.checkInAt) || current.checkInAt,
          checkOutAt: toLocalDateTimeInput(existing.checkOutAt) || current.checkOutAt,
          status: existing.status || current.status,
          note: existing.note || current.note,
          adminRemark: existing.adminRemark || current.adminRemark
        }));
      }
    } catch {
      // silent — form stays as-is
    }
  };

  const openManualCorrectionFromCell = async () => {
    if (!selectedCalendarCell) return;
    const attendanceId = selectedCalendarCell.record?.attendanceId;
    if (attendanceId) {
      await loadAttendanceDetail(attendanceId);
      setSelectedCalendarCell(null);
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }

    setManualCreate((current) => ({
      ...current,
      userSalonId: selectedCalendarCell.staffCode,
      attendanceDate: selectedCalendarCell.record?.date
        ? new Date(selectedCalendarCell.record.date).toISOString().slice(0, 10)
        : toIsoDateFromMonthDay(attendanceCalendarMonth, selectedCalendarCell.day),
      status: selectedCalendarCell.record?.status === "ABSENT" ? "ABSENT" : ""
    }));
    setSelectedCalendarCell(null);
    setActiveTab("records");
    setTimeout(() => {
      manualCreateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const sanitizeHtml = (str) => {
    if (!str) return "-";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };

  const printAttendanceDaySheet = () => {
    const targetDate = daySheetDate;
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
    if (!printWindow) { setStatus({ error: "Pop-up was blocked. Please allow pop-ups for this site.", success: "" }); return; }
    const rowsHtml = attendanceDaySheet.map((row) => `
      <tr>
        <td>${sanitizeHtml(row.staffName)}</td>
        <td>${sanitizeHtml(row.branchName)}</td>
        <td>${sanitizeHtml(row.status)}</td>
        <td>${row.checkInAt ? new Date(row.checkInAt).toLocaleString() : "No check-in"}</td>
        <td>${row.checkOutAt ? new Date(row.checkOutAt).toLocaleString() : "No check-out"}</td>
      </tr>
    `).join("");
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Sheet - ${targetDate}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; }
            p { margin: 0 0 18px; color: #475569; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #eff6ff; }
          </style>
        </head>
        <body>
          <h1>Branch Attendance Sheet</h1>
          <p>Branch: ${sanitizeHtml(selectedBranchName) || "All Branches"} | Date: ${targetDate}</p>
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
              </tr>
            </thead>
            <tbody>${rowsHtml || '<tr><td colspan="5">No attendance rows available.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const downloadCalendarExport = async (format) => {
    try {
      const searchParams = new URLSearchParams({
        period: "monthly",
        date: `${attendanceCalendarMonth}-01`,
        ...(selectedBranchId ? { branchId: selectedBranchId } : {})
      });
      const response = await api.get(`/owner/attendance/reports/export.${format}?${searchParams.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_Monthly_${attendanceCalendarMonth}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to download report");
    }
  };

  const downloadDaySheetExport = async (format) => {
    try {
      const searchParams = new URLSearchParams({
        period: "daily",
        date: daySheetDate,
        ...(selectedBranchId ? { branchId: selectedBranchId } : {})
      });
      const response = await api.get(`/owner/attendance/reports/export.${format}?${searchParams.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_Daily_${daySheetDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to download report");
    }
  };

  const statCards = [
    { label: "Total Staff", value: attendanceSummary.totalStaff || 0, icon: Users, color: "#3b82f6", bg: "linear-gradient(135deg, #eff6ff, #dbeafe)" },
    { label: "Present Today", value: attendanceSummary.presentToday || 0, icon: CheckCircle2, color: "#16a34a", bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)" },
    { label: "Absent Today", value: attendanceSummary.absentToday || 0, icon: XCircle, color: "#ef4444", bg: "linear-gradient(135deg, #fef2f2, #fee2e2)" },
    { label: "Late Staff", value: attendanceSummary.lateStaff || 0, icon: Clock, color: "#f59e0b", bg: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
    { label: "Currently Working", value: attendanceSummary.currentlyWorking || 0, icon: Activity, color: "#0ea5e9", bg: "linear-gradient(135deg, #f0f9ff, #e0f2fe)" },
    { label: "Completed Shift", value: attendanceSummary.completedShift || 0, icon: Timer, color: "#8b5cf6", bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)" }
  ];

  return (
    <div className="page-shell" style={{ background: "#f1f5f9", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`
        .att-premium-tab {
          padding: 12px 24px;
          border-radius: 99px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: #64748b;
          position: relative;
          overflow: hidden;
        }
        .att-premium-tab:hover {
          color: #0f172a;
          background: rgba(255,255,255,0.6);
        }
        .att-premium-tab.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.1);
        }
        .att-stat-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .att-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .att-cal-cell { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px; }
        .att-cal-cell:hover { transform: scale(1.15) translateY(-2px); z-index: 2; box-shadow: 0 8px 16px rgba(0,0,0,0.12); }
        .att-glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
        }
        .att-btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .att-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }
        .modern-table-container {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
      `}</style>

      <ModuleTabs
        title="Staff Attendance"
        description="GPS-based attendance tracking, check-in/out, manual attendance editing, and attendance reports."
        items={[{ label: "Attendance", to: "/admin/attendance" }]}
      />
      {status.error && <div className="panel-card" style={{margin: "0 24px 16px", background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b"}}><p style={{margin: 0, padding: 16}}>{status.error}</p></div>}
      {status.success && <div className="panel-card" style={{margin: "0 24px 16px", background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534"}}><p style={{margin: 0, padding: 16}}>{status.success}</p></div>}

      <div style={{ display: "flex", gap: 12, padding: "0 24px", marginBottom: 24, overflowX: "auto" }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "calendar", label: "Calendar", icon: CalendarDays },
          { id: "records", label: "Records", icon: List },
          { id: "reports", label: "Reports", icon: FileText }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`att-premium-tab ${activeTab === t.id ? "active" : ""}`}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 24, minWidth: 0, maxWidth: "100%", padding: "0 24px" }}>
        {activeTab === "dashboard" && (
        <div className="att-glass-panel" style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", fontWeight: 700 }}>Overview</h3>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>Today's attendance snapshot and global settings.</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20, marginBottom: 40 }}>
            {statCards.map((stat, idx) => (
              <div key={idx} className="att-stat-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: stat.bg, display: "grid", placeItems: "center", color: stat.color }}>
                    <stat.icon size={22} />
                  </div>
                  <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>{stat.label}</div>
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32 }}>
            <h3 style={{ margin: 0, fontSize: 20, color: "#0f172a", marginBottom: 20 }}>Attendance Settings</h3>
            <form onSubmit={saveAttendanceSettings} style={{ background: "#f8fafc", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <div className="form-grid" style={{ gap: 24 }}>
                <label>
                  <span style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#475569", fontSize: 13 }}>Office Start</span>
                  <input type="time" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1" }} value={attendanceSettings.officeStartTime} onChange={(e) => setAttendanceSettings((current) => ({ ...current, officeStartTime: e.target.value }))} />
                </label>
                <label>
                  <span style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#475569", fontSize: 13 }}>Office End</span>
                  <input type="time" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1" }} value={attendanceSettings.officeEndTime} onChange={(e) => setAttendanceSettings((current) => ({ ...current, officeEndTime: e.target.value }))} />
                </label>
                <label>
                  <span style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#475569", fontSize: 13 }}>Late After</span>
                  <input type="time" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1" }} value={attendanceSettings.lateAfterTime} onChange={(e) => setAttendanceSettings((current) => ({ ...current, lateAfterTime: e.target.value }))} />
                </label>
                <label>
                  <span style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#475569", fontSize: 13 }}>Half Day Minutes</span>
                  <input type="number" min="30" max="1440" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1" }} value={attendanceSettings.halfDayMinutes} onChange={(e) => setAttendanceSettings((current) => ({ ...current, halfDayMinutes: e.target.value }))} />
                </label>
                <label>
                  <span style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#475569", fontSize: 13 }}>Minimum Working Minutes</span>
                  <input type="number" min="30" max="1440" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1" }} value={attendanceSettings.minimumWorkingMinutes} onChange={(e) => setAttendanceSettings((current) => ({ ...current, minimumWorkingMinutes: e.target.value }))} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24, background: "white", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <ToggleSwitch 
                  checked={attendanceSettings.overtimeEnabled} 
                  onChange={(e) => setAttendanceSettings((current) => ({ ...current, overtimeEnabled: e.target.checked }))} 
                  label="Enable overtime calculation" 
                  color="#2563eb"
                  labelColor="#0f172a"
                />
                {attendanceSettings.overtimeEnabled && (
                  <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontWeight: 500, color: "#475569" }}>Threshold (mins)</span>
                    <input type="number" min="60" max="720" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", width: 100 }} value={attendanceSettings.overtimeThresholdMinutes} onChange={(e) => setAttendanceSettings((current) => ({ ...current, overtimeThresholdMinutes: e.target.value }))} />
                  </label>
                )}
                <ToggleSwitch 
                  checked={attendanceSettings.checkoutSelfieRequired} 
                  onChange={(e) => setAttendanceSettings((current) => ({ ...current, checkoutSelfieRequired: e.target.checked }))} 
                  label="Require selfie on check-out" 
                  color="#2563eb"
                  labelColor="#0f172a"
                />
                <ToggleSwitch 
                  checked={attendanceSettings.allowManualAttendanceEdits} 
                  onChange={(e) => setAttendanceSettings((current) => ({ ...current, allowManualAttendanceEdits: e.target.checked }))} 
                  label="Allow manual attendance edits" 
                  color="#2563eb"
                  labelColor="#0f172a"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <button type="submit" className="att-btn-primary" disabled={settingsSaving}>{settingsSaving ? "Saving..." : <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Save size={18} /> Save Settings</span>}</button>
              </div>
            </form>
          </div>
        </div>
        )}

        {activeTab === "calendar" && (
        <div className="att-glass-panel" style={{ overflow: "hidden", padding: 32, maxWidth: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, display: "flex", alignItems: "center", gap: 10, color: "#0f172a" }}>
                Attendance Calendar
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Monthly overview. Click any cell for details. Today is highlighted in blue.</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#f8fafc", padding: "6px 8px", borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <button type="button" onClick={() => { const [y, m] = attendanceCalendarMonth.split("-").map(Number); const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`; setAttendanceCalendarMonth(prev); }} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "white", color: "#475569", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><ChevronLeft size={16} /></button>
              <input type="month" value={attendanceCalendarMonth} onChange={(e) => setAttendanceCalendarMonth(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "transparent", fontSize: 15, fontWeight: 700, color: "#0f172a", outline: "none" }} />
              <button type="button" onClick={() => { const [y, m] = attendanceCalendarMonth.split("-").map(Number); const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; setAttendanceCalendarMonth(next); }} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "white", color: "#475569", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><ChevronRight size={16} /></button>
              <div style={{ width: 1, height: 24, background: "#cbd5e1", margin: "0 8px" }} />
              <button type="button" onClick={() => setAttendanceCalendarMonth(toMonthInput())} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#2563eb", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center", boxShadow: "0 2px 8px rgba(37,99,235,0.2)" }}><CalendarDays size={14} /> Today</button>
              <button type="button" onClick={() => downloadCalendarExport("xlsx")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}><Download size={14} /> Excel</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
            {Object.entries(statusTheme).filter(([key]) => key !== "OFF").map(([key, theme]) => (
              <div key={key} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: theme.bg, color: theme.color, fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.color }} />
                {theme.label} = {key.replaceAll("_", " ")}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginTop: 24 }}>
            {[{ label: "Total Rows", value: attendanceCalendar.summary?.totalRows || 0, bg: "#f1f5f9", color: "#334155" },
              { label: "Present", value: attendanceCalendar.summary?.present || 0, bg: "#dcfce7", color: "#166534" },
              { label: "Late", value: attendanceCalendar.summary?.late || 0, bg: "#fef3c7", color: "#92400e" },
              { label: "Half Day", value: attendanceCalendar.summary?.halfDay || 0, bg: "#fef9c3", color: "#854d0e" },
              { label: "Absent", value: attendanceCalendar.summary?.absent || 0, bg: "#fee2e2", color: "#b91c1c" },
              { label: "Leave", value: attendanceCalendar.summary?.leave || 0, bg: "#dbeafe", color: "#1d4ed8" }
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "16px", textAlign: "center", border: "1px solid rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          
          <div className="modern-table-container" style={{ overflow: "auto", maxHeight: "60vh", marginTop: 24 }}>
            {(() => {
              const today = new Date();
              const todayDay = today.getMonth() + 1 === parseInt(attendanceCalendarMonth.split("-")[1]) && today.getFullYear() === parseInt(attendanceCalendarMonth.split("-")[0]) ? today.getDate() : null;
              return (
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: Math.max(900, 300 + attendanceCalendarDays.length * 44) }}>
                  <thead>
                    <tr>
                      <th style={{ position: "sticky", top: 0, left: 0, zIndex: 10, background: "#ffffff", padding: "16px 20px", fontWeight: 700, fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #f1f5f9", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.05)" }}>Staff Member</th>
                      {attendanceCalendarDays.map((day) => (
                        <th key={day} style={{ position: "sticky", top: 0, zIndex: 4, background: todayDay === day ? "#2563eb" : attendanceCalendarWeekendMap[day] ? "#f8fafc" : "#ffffff", textAlign: "center", padding: "12px 0", fontSize: 12, fontWeight: 700, color: todayDay === day ? "white" : attendanceCalendarWeekendMap[day] ? "#94a3b8" : "#475569", borderBottom: "1px solid #e2e8f0", minWidth: 44 }}>
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceCalendarRows.map((row, rowIdx) => (
                      <tr key={row.staffCode} style={{ background: "white", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                        <td style={{ position: "sticky", left: 0, zIndex: 5, padding: "14px 20px", borderRight: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", background: "inherit", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.02)" }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{row.staffName}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{row.branchName || "Unassigned"}</div>
                        </td>
                        {attendanceCalendarDays.map((day) => {
                          const cell = row.cells[day] || null;
                          const isWeekend = attendanceCalendarWeekendMap[day];
                          const isToday = todayDay === day;
                          const isFuture = todayDay !== null && day > todayDay;
                          let theme;
                          if (isFuture) {
                            theme = { label: "", bg: "transparent", color: "#d1d5db" };
                          } else if (isWeekend) {
                            theme = statusTheme.OFF;
                          } else {
                            theme = statusTheme[cell?.status] || { label: "-", bg: "#f8fafc", color: "#94a3b8" };
                          }
                          return (
                            <td key={`${row.staffCode}-${day}`} style={{ textAlign: "center", padding: "6px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f8fafc", background: isToday ? "#eff6ff" : "inherit" }}>
                              <button
                                type="button"
                                title={cell ? `${row.staffName} | ${cell.status} | ${new Date(cell.date).toLocaleDateString()}` : isFuture ? `${row.staffName} | Future` : isWeekend ? `${row.staffName} | Off` : `${row.staffName} | No mark`}
                                onClick={() => setSelectedCalendarCell({ staffName: row.staffName, branchName: row.branchName, staffCode: row.staffCode, record: cell, day, isWeekend })}
                                className="att-cal-cell"
                                style={{
                                  width: "100%",
                                  height: 36,
                                  borderRadius: 8,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: theme.gradient || theme.bg,
                                  color: theme.color,
                                  border: isToday ? "2px solid #3b82f6" : "1px solid transparent",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxSizing: "border-box"
                                }}
                              >
                                {theme.label}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
        )}

        {selectedCalendarCell ? (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "grid", placeItems: "center", zIndex: 1199, padding: 24, backdropFilter: "blur(8px)" }} onClick={() => setSelectedCalendarCell(null)}>
            <div className="att-glass-panel" style={{ width: "min(100%, 550px)", padding: 32, maxHeight: "90vh", overflowY: "auto", animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Attendance Details</h3>
                  <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{selectedCalendarCell.staffName} • {attendanceCalendarMonth}-{String(selectedCalendarCell.day).padStart(2, "0")}</div>
                </div>
                <button type="button" onClick={() => setSelectedCalendarCell(null)} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "#f1f5f9", color: "#475569", cursor: "pointer", display: "grid", placeItems: "center", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="#e2e8f0"} onMouseLeave={e => e.currentTarget.style.background="#f1f5f9"}><XCircle size={20} /></button>
              </div>
              
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", border: "1px solid #e2e8f0" }}>
                {[
                  ["Status", selectedCalendarCell.record?.status || "No mark"],
                  ["Worked Hours", selectedCalendarCell.record?.workedHours || "-"],
                  ["Check-In", selectedCalendarCell.record?.checkInAt ? new Date(selectedCalendarCell.record.checkInAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"],
                  ["Check-Out", selectedCalendarCell.record?.checkOutAt ? new Date(selectedCalendarCell.record.checkOutAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"],
                  ["Branch", selectedCalendarCell.branchName || "Unassigned"],
                  ["Verification", selectedCalendarCell.record?.verificationMethod || "-"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontSize: 15, color: "#0f172a", fontWeight: 600, marginTop: 4 }}>{value}</div>
                  </div>
                ))}
              </div>

              {selectedCalendarCell.record?.note && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Note</div>
                  <div style={{ fontSize: 14, color: "#334155", marginTop: 4, padding: 12, background: "#f1f5f9", borderRadius: 8 }}>{selectedCalendarCell.record.note}</div>
                </div>
              )}

              {selectedCalendarCell.record?.selfie ? (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>Verification Selfie</div>
                  <img src={normalizeImageUrl(selectedCalendarCell.record.selfie)} alt="Attendance selfie" style={{ width: "100%", borderRadius: 16, border: "1px solid #e2e8f0", objectFit: "cover", maxHeight: 300 }} />
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
                <button type="button" style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #cbd5e1", background: "white", fontWeight: 600, color: "#475569", cursor: "pointer" }} onClick={() => setSelectedCalendarCell(null)}>Close</button>
                <button type="button" className="att-btn-primary" onClick={() => void openManualCorrectionFromCell()}>
                  {selectedCalendarCell.record?.attendanceId ? <span style={{display: "flex", alignItems: "center", gap: 6}}><Edit3 size={16} /> Edit Record</span> : <span style={{display: "flex", alignItems: "center", gap: 6}}><PlusCircle size={16} /> Create Entry</span>}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "records" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(400px, 1.5fr)", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="att-glass-panel" ref={manualCreateRef} style={{ padding: 28 }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 16, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#3b82f6", borderRadius: 10, display: "flex", boxShadow: "0 2px 4px rgba(59,130,246,0.1)" }}><Edit3 size={18} /></div> Manual Entry
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Add or edit attendance records manually.</p>
              </div>
              <form onSubmit={saveManualCreate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Staff Member</span>
                  <CustomDropdown required value={manualCreate.userSalonId} onChange={(e) => {
                    const val = e.target.value;
                    setManualCreate((current) => ({ ...current, userSalonId: val }));
                    fetchExistingAttendance(val, manualCreate.attendanceDate);
                  }} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 14, outline: "none" }}>
                    <option value="">Select staff</option>
                    {staffUsers.map((row) => (
                      <option key={row.id} value={row.id}>{row.user?.name || row.name || row.id}</option>
                    ))}
                  </CustomDropdown>
                </label>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Date</span>
                    <input type="date" required value={manualCreate.attendanceDate} onChange={(e) => {
                      const val = e.target.value;
                      setManualCreate((current) => ({ ...current, attendanceDate: val }));
                      fetchExistingAttendance(manualCreate.userSalonId, val);
                    }} style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 14, outline: "none" }} />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</span>
                    <CustomDropdown value={manualCreate.status} onChange={(e) => setManualCreate((current) => ({ ...current, status: e.target.value }))} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 14, outline: "none" }}>
                      <option value="">Auto-calculate</option>
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="LEAVE">Leave</option>
                      <option value="ABSENT">Absent</option>
                      <option value="WORKING">Working</option>
                      <option value="COMPLETED_SHIFT">Completed Shift</option>
                    </CustomDropdown>
                  </label>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Check-in Time</span>
                    <input type="datetime-local" value={manualCreate.checkInAt} onChange={(e) => setManualCreate((current) => ({ ...current, checkInAt: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 14, outline: "none" }} />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Check-out Time</span>
                    <input type="datetime-local" value={manualCreate.checkOutAt} onChange={(e) => setManualCreate((current) => ({ ...current, checkOutAt: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 14, outline: "none" }} />
                  </label>
                </div>
                
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Admin Remark</span>
                  <textarea rows={2} value={manualCreate.adminRemark} onChange={(e) => setManualCreate((current) => ({ ...current, adminRemark: e.target.value }))} placeholder="Reason for manual entry" style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </label>
                
                <button type="submit" className="att-btn-primary" disabled={manualCreateSaving} style={{ width: "100%", padding: "14px", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 15 }}>
                  {manualCreateSaving ? "Saving..." : <><UserPlus size={18} /> Create Record</>}
                </button>
              </form>
            </div>
            
            <div className="att-glass-panel" ref={detailPanelRef} style={{ padding: 28, maxHeight: "55vh", overflowY: "auto" }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 16, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", color: "#16a34a", borderRadius: 10, display: "flex", boxShadow: "0 2px 4px rgba(22,163,74,0.1)" }}><Eye size={18} /></div> Record Details
                </h3>
              </div>
              
              {detailLoading ? <PageLoader compact /> : null}
              {!detailLoading && !selectedAttendance && (
                <EmptyState title="Select a record" message="Click on a record from the history logs to view its details." />
              )}
              {selectedAttendance ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0" }}>
                    {selectedAttendance.checkInSelfieUrl ? (
                      <img src={normalizeImageUrl(selectedAttendance.checkInSelfieUrl)} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid white", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "grid", placeItems: "center", fontSize: 24, fontWeight: 800, color: "white", border: "3px solid white", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
                        {(selectedAttendance.userSalon?.user?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{selectedAttendance.userSalon?.user?.name || "Unknown"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                        <MapPin size={12} /> {selectedAttendance.branch?.name || "No branch"}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                     <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginTop: 6 }}>{new Date(selectedAttendance.attendanceDate || selectedAttendance.checkInAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                     </div>
                     <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
                      <div style={{ marginTop: 6, display: "inline-block", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, background: statusTheme[selectedAttendance.status]?.bg || "#f1f5f9", color: statusTheme[selectedAttendance.status]?.color || "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        {selectedAttendance.status}
                      </div>
                     </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#f8fafc", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: 0.5 }}><LogIn size={14}/> Check-In</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>{selectedAttendance.checkInAt ? new Date(selectedAttendance.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: 0.5 }}><LogOut size={14}/> Check-Out</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>{selectedAttendance.checkOutAt ? new Date(selectedAttendance.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</div>
                    </div>
                  </div>

                  {attendanceSettings.allowManualAttendanceEdits && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => {
                        const target = document.getElementById("manual-edit-form");
                        if(target) {
                          target.style.display = target.style.display === "none" ? "block" : "none";
                        }
                      }} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#334155", fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", transition: "all 0.2s" }}>
                        <Edit3 size={16} /> Edit Record Details
                      </button>
                      <form id="manual-edit-form" onSubmit={saveManualEdit} style={{ display: "none", marginTop: 16, background: "#eff6ff", padding: 20, borderRadius: 16, border: "1px solid #bfdbfe" }}>
                         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                           <label style={{ display: "grid", gap: 6 }}>
                             <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Check-in Time</span>
                             <input type="datetime-local" value={manualEdit.checkInAt} onChange={(e) => setManualEdit((current) => ({ ...current, checkInAt: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1px solid #93c5fd", outline: "none" }} />
                           </label>
                           <label style={{ display: "grid", gap: 6 }}>
                             <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Check-out Time</span>
                             <input type="datetime-local" value={manualEdit.checkOutAt} onChange={(e) => setManualEdit((current) => ({ ...current, checkOutAt: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1px solid #93c5fd", outline: "none" }} />
                           </label>
                           <label style={{ display: "grid", gap: 6 }}>
                             <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Status</span>
                             <CustomDropdown value={manualEdit.status} onChange={(e) => setManualEdit((current) => ({ ...current, status: e.target.value }))} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #93c5fd", outline: "none" }}>
                               <option value="">Auto-calculate</option>
                               <option value="PRESENT">Present</option>
                               <option value="LATE">Late</option>
                               <option value="ABSENT">Absent</option>
                             </CustomDropdown>
                           </label>
                           <label style={{ display: "grid", gap: 6 }}>
                             <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Reason</span>
                             <input value={manualEdit.reason} required placeholder="Reason for edit" onChange={(e) => setManualEdit((current) => ({ ...current, reason: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1px solid #93c5fd", outline: "none" }} />
                           </label>
                           <button type="submit" className="att-btn-primary" style={{ padding: "12px", fontSize: 14, marginTop: 8 }}>Save Update</button>
                         </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="att-glass-panel" style={{ padding: 28, display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 16, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ padding: 8, background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", color: "#8b5cf6", borderRadius: 10, display: "flex", boxShadow: "0 2px 4px rgba(139,92,246,0.1)" }}><History size={18} /></div> History Logs
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Browse and filter staff attendance records.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: 12, marginBottom: 24, background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <input value={filters.attendanceQ} placeholder="Search name..." onChange={(e) => setFilters((current) => ({ ...current, attendanceQ: e.target.value }))} style={{ boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, outline: "none" }} />
              <CustomDropdown value={filters.attendanceStatus} onChange={(e) => setFilters((current) => ({ ...current, attendanceStatus: e.target.value }))} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, outline: "none" }}>
                <option value="">All statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
              </CustomDropdown>
              <input type="date" value={filters.attendanceDate} onChange={(e) => setFilters((current) => ({ ...current, attendanceDate: e.target.value }))} style={{ boxSizing: "border-box", padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, outline: "none" }} />
              <button onClick={() => setFilters({ attendanceQ: "", attendanceStatus: "", attendanceDate: "" })} style={{ padding: "0 14px", borderRadius: 10, background: "#fff", border: "1px solid #cbd5e1", cursor: "pointer", color: "#475569", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}><RotateCcw size={16} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 6 }}>
              {attendance.map((row) => {
                const sc = statusTheme[row.status] || { bg: "#f1f5f9", color: "#475569" };
                const name = row.userSalon?.user?.name || row.userSalonId;
                const isSelected = selectedAttendanceId === row.id;
                
                return (
                  <button
                    key={row.id}
                    onClick={() => loadAttendanceDetail(row.id)}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", width: "100%", boxSizing: "border-box",
                      background: isSelected ? "#eff6ff" : "white", border: isSelected ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                      borderRadius: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                      boxShadow: isSelected ? "0 4px 16px rgba(37,99,235,0.1)" : "0 2px 4px rgba(0,0,0,0.02)"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                      }
                    }}
                  >
                    {row.checkInSelfieUrl ? 
                      <img src={normalizeImageUrl(row.checkInSelfieUrl)} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid #f1f5f9" }} /> : 
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: sc.gradient || sc.bg, color: sc.color, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800, border: `2px solid ${sc.bg}` }}>{name?.charAt(0)?.toUpperCase()}</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{name}</span>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, background: sc.bg, color: sc.color }}>{row.status}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
                        <Clock size={14} /> 
                        {row.checkInAt ? new Date(row.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                        {row.checkOutAt ? ` → ${new Date(row.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
              {attendance.length === 0 && (
                <EmptyState title="No records found" message="Adjust your filters or add a manual entry." />
              )}
            </div>
          </div>
        </div>
        )}
{activeTab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="att-glass-panel" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", fontWeight: 700 }}>Attendance Exports</h3>
                <p style={{ margin: "4px 0 0", color: "#64748b" }}>Generate comprehensive attendance data for payroll.</p>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 24 }}>
               <label style={{ flex: 1 }}>
                 <span style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#475569", fontSize: 13 }}>Period</span>
                 <CustomDropdown value={attendanceReportPeriod} onChange={(e) => setAttendanceReportPeriod(e.target.value)}>
                   <option value="daily">Daily Report</option>
                   <option value="weekly">Weekly Report</option>
                   <option value="monthly">Monthly Report</option>
                 </CustomDropdown>
               </label>
               <button onClick={() => downloadAttendanceReport("xlsx")} style={{ height: 44, padding: "0 24px", borderRadius: 12, border: "1px solid #10b981", background: "#ecfdf5", color: "#047857", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><Download size={16} /> Excel</button>
               <button onClick={() => downloadAttendanceReport("pdf")} style={{ height: 44, padding: "0 24px", borderRadius: 12, border: "1px solid #ef4444", background: "#fef2f2", color: "#b91c1c", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><Download size={16} /> PDF</button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
