const fs = require('fs');

const originalFilePath = 'src/pages/owner/SettingsPage.jsx';
let content = fs.readFileSync(originalFilePath, 'utf8');

const replacement = `  const renderShiftSection = () => {
    const shiftList = shifts;
    const selectedShift = shiftList.find(s => s.id === selectedShiftId) || shiftList[0] || null;

    const createShift = async () => {
      try {
        setShiftSaving(true);
        const payload = {
          name: "New Shift",
          active: true,
          sameForAllDays: true,
          startTime: "09:00",
          endTime: "21:00",
          days: WEEK_DAYS.map(d => ({ dayOfWeek: d.dayOfWeekValue, startTime: "09:00", endTime: "21:00", active: true })),
          breaks: [],
          branchId: selectedBranchId || undefined
        };
        const res = await api.post("/owner/shifts", payload);
        setShifts((prev) => [...prev, res.data]);
        setSelectedShiftId(res.data.id);
        setForm((prev) => ({
          ...prev,
          advancedSettings: {
            ...prev.advancedSettings,
            shiftManagement: {
              ...(prev.advancedSettings?.shiftManagement || {}),
              shifts: [...((prev.advancedSettings?.shiftManagement?.shifts) || []), res.data]
            }
          }
        }));
        setStatus({ loading: false, error: "", success: "Shift created." });
      } catch (err) {
        setStatus({ loading: false, error: formatApiError(err, "Could not create shift"), success: "" });
      } finally {
        setShiftSaving(false);
      }
    };

    const deleteShift = async (id) => {
      try {
        setShiftSaving(true);
        await api.delete(\`/owner/shifts/\${id}\`);
        setShifts((prev) => prev.filter(s => s.id !== id));
        if (selectedShiftId === id) setSelectedShiftId(null);
        setForm((prev) => ({
          ...prev,
          advancedSettings: {
            ...prev.advancedSettings,
            shiftManagement: {
              ...(prev.advancedSettings?.shiftManagement || {}),
              shifts: (prev.advancedSettings?.shiftManagement?.shifts || []).filter(s => s.id !== id)
            }
          }
        }));
        setStatus({ loading: false, error: "", success: "Shift deleted." });
      } catch (err) {
        setStatus({ loading: false, error: formatApiError(err, "Could not delete shift"), success: "" });
      } finally {
        setShiftSaving(false);
      }
    };

    const saveShift = async () => {
      if (!selectedShift || !shiftDraft) return;
      try {
        setShiftSaving(true);
        const payload = {
          name: shiftDraft.name?.trim() || "Untitled Shift",
          active: shiftDraft.active !== false,
          sameForAllDays: shiftDraft.sameForAllDays !== false,
          startTime: shiftDraft.sameForAllDays ? (shiftDraft.startTime || "09:00") : null,
          endTime: shiftDraft.sameForAllDays ? (shiftDraft.endTime || "21:00") : null,
          sortOrder: shiftDraft.sortOrder || 0,
          days: shiftDraft.sameForAllDays ? [] : (shiftDraft.days || []).map(d => ({
            dayOfWeek: Number(d.dayOfWeek),
            startTime: d.startTime || "09:00",
            endTime: d.endTime || "21:00",
            active: d.active !== false
          })),
          breaks: (shiftDraft.breaks || []).filter(b => b.name || b.fromTime || b.toTime).map(b => ({
            name: b.name || "Break",
            active: b.active !== false,
            fromTime: b.fromTime || "00:00",
            toTime: b.toTime || "00:00"
          })),
          branchId: selectedBranchId || undefined
        };
        const res = await api.patch(\`/owner/shifts/\${selectedShift.id}\`, payload);
        setShifts((prev) => prev.map(s => s.id === res.data.id ? res.data : s));
        setForm((prev) => ({
          ...prev,
          advancedSettings: {
            ...prev.advancedSettings,
            shiftManagement: {
              ...(prev.advancedSettings?.shiftManagement || {}),
              shifts: (prev.advancedSettings?.shiftManagement?.shifts || []).map(s => s.id === res.data.id ? res.data : s)
            }
          }
        }));
        setStatus({ loading: false, error: "", success: "Shift saved." });
        setSelectedShiftId(null); // Close modal on save
      } catch (err) {
        setStatus({ loading: false, error: formatApiError(err, "Could not save shift"), success: "" });
      } finally {
        setShiftSaving(false);
      }
    };

    const updateDraftField = (field, value) => {
      setShiftDraft((current) => current ? { ...current, [field]: value } : current);
    };

    const updateDayField = (dayOfWeek, patch) => {
      setShiftDraft((current) => {
        if (!current) return current;
        const days = (current.days || []).map(d => d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d);
        return { ...current, days };
      });
    };

    const addBreakToDraft = () => {
      setShiftDraft((current) => current ? {
        ...current,
        breaks: [...(current.breaks || []), { name: "", active: true, fromTime: "", toTime: "" }]
      } : current);
    };

    const updateBreakInDraft = (index, patch) => {
      setShiftDraft((current) => {
        if (!current) return current;
        const breaks = (current.breaks || []).map((b, i) => i === index ? { ...b, ...patch } : b);
        return { ...current, breaks };
      });
    };

    const removeBreakFromDraft = (index) => {
      setShiftDraft((current) => {
        if (!current) return current;
        const breaks = (current.breaks || []).filter((_, i) => i !== index);
        return { ...current, breaks };
      });
    };

    const toggleSameForAllDays = (checked) => {
      setShiftDraft((current) => {
        if (!current) return current;
        if (checked) {
          const firstDay = (current.days || [])[0] || {};
          const startTime = firstDay.startTime || "09:00";
          const endTime = firstDay.endTime || "21:00";
          return {
            ...current,
            sameForAllDays: true,
            startTime,
            endTime,
            days: WEEK_DAYS.map(d => ({ dayOfWeek: d.dayOfWeekValue, startTime, endTime, active: true }))
          };
        } else {
          const startTime = current.startTime || "09:00";
          const endTime = current.endTime || "21:00";
          return {
            ...current,
            sameForAllDays: false,
            startTime: null,
            endTime: null,
            days: WEEK_DAYS.map(d => ({ dayOfWeek: d.dayOfWeekValue, startTime, endTime, active: true }))
          };
        }
      });
    };

    return (
      <>
        <SectionHeader title="Shift Management" description="Create reusable shift templates with per-day timing so roster planning stays consistent across staff, roles, and branches." badges={[\`\${shiftList.length} shifts\`]} />

        {/* Modal Overlay */}
        {selectedShiftId && selectedShift && shiftDraft && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" }}>
            <div style={{ width: "100%", maxWidth: 850, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 40, position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
              <button 
                onClick={() => setSelectedShiftId(null)} 
                style={{ position: "absolute", top: 24, right: 24, background: "#f1f5f9", border: "none", width: 36, height: 36, borderRadius: "50%", fontSize: 16, display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "#64748b", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
              >
                ✕
              </button>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ background: "#eff6ff", color: "#2563eb", width: 48, height: 48, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 12, fontSize: 20 }}>🕒</span> 
                  {shiftDraft.name || "Shift Details"}
                </h2>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: shiftDraft.active ? "#ecfdf5" : "#f8fafc", padding: "10px 20px", borderRadius: 24, border: \`1px solid \${shiftDraft.active ? "#d1fae5" : "#e2e8f0"}\`, transition: "all 0.2s" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: shiftDraft.active ? "#059669" : "#64748b" }}>{shiftDraft.active ? "Active" : "Inactive"}</span>
                  <ToggleSwitch checked={Boolean(shiftDraft.active)} onChange={(e) => updateDraftField("active", e.target.checked)} />
                </label>
              </div>

              <div className="settings-form-grid" style={{ marginBottom: 32 }}>
                <label style={{ display: "block" }}>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Shift Name</div>
                  <input
                    value={shiftDraft.name || ""}
                    onChange={(event) => updateDraftField("name", event.target.value)}
                    placeholder="e.g. Morning Shift"
                    style={{ width: "100%", padding: "14px 18px", border: "2px solid #e2e8f0", borderRadius: 12, fontSize: 16, fontWeight: 600, color: "#1e293b", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </label>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 24 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 16, background: shiftDraft.sameForAllDays ? "#eff6ff" : "#f8fafc", border: shiftDraft.sameForAllDays ? "2px solid #bfdbfe" : "2px solid #e2e8f0", padding: "16px 20px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s" }}>
                    <ToggleSwitch checked={Boolean(shiftDraft.sameForAllDays)} onChange={(e) => toggleSameForAllDays(e.target.checked)} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: shiftDraft.sameForAllDays ? "#1e40af" : "#334155" }}>Same Timing For All Days</span>
                      <span style={{ fontSize: 13, color: shiftDraft.sameForAllDays ? "#3b82f6" : "#64748b", marginTop: 2 }}>Apply one schedule to every day</span>
                    </div>
                  </label>
                </div>
              </div>

              {shiftDraft.sameForAllDays ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                  <label>
                    <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Start Time</div>
                    <input type="time" value={shiftDraft.startTime || "09:00"} onChange={(event) => updateDraftField("startTime", event.target.value)} style={{ width: "100%", padding: "14px 18px", border: "2px solid #e2e8f0", borderRadius: 12, fontSize: 16, fontWeight: 600, color: "#1e293b", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                  </label>
                  <label>
                    <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>End Time</div>
                    <input type="time" value={shiftDraft.endTime || "21:00"} onChange={(event) => updateDraftField("endTime", event.target.value)} style={{ width: "100%", padding: "14px 18px", border: "2px solid #e2e8f0", borderRadius: 12, fontSize: 16, fontWeight: 600, color: "#1e293b", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                  </label>
                </div>
              ) : (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 100px", gap: 16, padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      <div>Day</div><div>Start Time</div><div>End Time</div><div>Status</div>
                    </div>
                  {WEEK_DAYS.map((day) => {
                    const dayData = (shiftDraft.days || []).find(d => d.dayOfWeek === day.dayOfWeekValue) || { dayOfWeek: day.dayOfWeekValue, startTime: "09:00", endTime: "21:00", active: true };
                    return (
                      <div key={day.key} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 100px", gap: 16, padding: "16px 24px", borderBottom: "1px solid #f1f5f9", alignItems: "center", opacity: dayData.active !== false ? 1 : 0.6 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{day.label}</div>
                        <input type="time" disabled={dayData.active === false} value={dayData.startTime || "09:00"} onChange={(event) => updateDayField(day.dayOfWeekValue, { startTime: event.target.value })} style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, color: "#334155", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        <input type="time" disabled={dayData.active === false} value={dayData.endTime || "21:00"} onChange={(event) => updateDayField(day.dayOfWeekValue, { endTime: event.target.value })} style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, color: "#334155", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        <ToggleSwitch checked={dayData.active !== false} onChange={(e) => updateDayField(day.dayOfWeekValue, { active: e.target.checked })} />
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingTop: 16 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>☕</span> Break Types
                </h3>
                <button type="button" onClick={addBreakToDraft} style={{ padding: "10px 20px", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}>
                  <Plus size={16} /> Add Break
                </button>
              </div>

              {(shiftDraft.breaks || []).length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 15, background: "#f8fafc", borderRadius: 16, border: "2px dashed #cbd5e1", marginBottom: 32 }}>
                  No breaks added yet. Add lunch or rest breaks here.
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 32 }}>
                {(shiftDraft.breaks || []).map((brk, idx) => (
                  <div key={idx} style={{ padding: 24, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                    <button type="button" onClick={() => removeBreakFromDraft(idx)} style={{ position: "absolute", top: 16, right: 16, background: "#fee2e2", color: "#991b1b", border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: 10, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fca5a5"} onMouseLeave={(e) => e.currentTarget.style.background = "#fee2e2"}>✕</button>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 24, marginBottom: 20, paddingRight: 48 }}>
                      <label>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Break Name</div>
                        <input value={brk.name || ""} onChange={(e) => updateBreakInDraft(idx, { name: e.target.value })} placeholder="e.g. Lunch Break" style={{ padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 10, width: "100%", fontSize: 15, fontWeight: 600, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                      </label>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", height: 44 }}>
                          <ToggleSwitch checked={brk.active !== false} onChange={(e) => updateBreakInDraft(idx, { active: e.target.checked })} />
                          <span style={{ fontSize: 14, fontWeight: 700, color: brk.active !== false ? "#059669" : "#64748b" }}>{brk.active !== false ? "Active" : "Off"}</span>
                        </label>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <label>
                          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>From Time</div>
                          <input type="time" value={brk.fromTime || ""} onChange={(e) => updateBreakInDraft(idx, { fromTime: e.target.value })} style={{ padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 10, width: "100%", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", fontWeight: 600, fontSize: 15 }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </label>
                        <label>
                          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>To Time</div>
                          <input type="time" value={brk.toTime || ""} onChange={(e) => updateBreakInDraft(idx, { toTime: e.target.value })} style={{ padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 10, width: "100%", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", fontWeight: 600, fontSize: 15 }} onFocus={(e) => e.target.style.borderColor = "#3b82f6"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={() => deleteShift(selectedShift.id)} disabled={shiftSaving} style={{ padding: "14px 28px", background: "#fff", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 12, fontWeight: 700, cursor: shiftSaving ? "not-allowed" : "pointer", fontSize: 15, transition: "background 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
                  Delete Shift
                </button>
                <div style={{ display: "flex", gap: 16 }}>
                  <button type="button" onClick={() => setSelectedShiftId(null)} disabled={shiftSaving} style={{ padding: "14px 28px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontWeight: 700, cursor: shiftSaving ? "not-allowed" : "pointer", fontSize: 15 }}>
                    Cancel
                  </button>
                  <button type="button" onClick={saveShift} disabled={shiftSaving} style={{ padding: "14px 40px", background: "var(--button-bg-solid, #2563eb)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: shiftSaving ? "not-allowed" : "pointer", fontSize: 15, opacity: shiftSaving ? 0.7 : 1, boxShadow: "0 8px 16px rgba(37, 99, 235, 0.25)" }}>
                    {shiftSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shift Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, marginTop: 24 }}>
          {/* Create New Card */}
          <div 
            onClick={createShift}
            style={{ border: "2px dashed #cbd5e1", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 180, cursor: shiftSaving ? "not-allowed" : "pointer", background: "#f8fafc", transition: "all 0.2s", opacity: shiftSaving ? 0.6 : 1 }}
            onMouseEnter={(e) => { if(!shiftSaving) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; } }}
            onMouseLeave={(e) => { if(!shiftSaving) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; } }}
          >
            <div style={{ background: "#e0f2fe", color: "#0284c7", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)" }}>
              <Plus size={28} />
            </div>
            <span style={{ fontWeight: 700, color: "#334155", fontSize: 15 }}>{shiftSaving ? "Creating..." : "Create New Shift"}</span>
          </div>

          {/* Shift Cards */}
          {shiftList.map((shift) => (
            <div key={shift.id} style={{ border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 180, transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)"; }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{shift.name || "Untitled Shift"}</h3>
                  <span style={{ background: shift.active ? "#dcfce7" : "#f1f5f9", color: shift.active ? "#15803d" : "#64748b", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
                    {shift.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>⏱️</span> 
                  {shift.sameForAllDays ? \`\${shift.startTime || '09:00'} - \${shift.endTime || '21:00'}\` : "Custom daily timings"}
                </div>
              </div>
              <button 
                onClick={() => setSelectedShiftId(shift.id)}
                style={{ width: "100%", padding: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, color: "#334155", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontSize: 14 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.color = "#1d4ed8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
              >
                Edit Details
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };`;

const startStr = '  const renderShiftSection = () => {';
const startIdx = content.indexOf(startStr);
const endStr = '  const renderRosterSection = () => {';
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + replacement + '\n\n' + content.substring(endIdx);
    fs.writeFileSync(originalFilePath, content);
    console.log('Successfully refactored shift section!');
} else {
    console.log('Could not find shift section');
}
