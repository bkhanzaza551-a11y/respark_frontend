const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/PayrollPage.jsx', 'utf8');

const startIdx = content.indexOf('{activeTab === "records" && (');
const endIdx = content.indexOf('{activeTab === "reports" && (');

if (startIdx === -1 || endIdx === -1) {
    console.error('Failed to find markers');
    process.exit(1);
}

const newChunk = `{activeTab === "records" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(400px, 1.5fr)", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="att-glass-panel" ref={manualCreateRef} style={{ padding: 28 }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 16, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✍️</span> Manual Entry
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
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔍</span> Record Details
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
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <span>📜</span> History Logs
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
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: sc.gradient || sc.bg, color: sc.color, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800, border: \`2px solid \${sc.bg}\` }}>{name?.charAt(0)?.toUpperCase()}</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{name}</span>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, background: sc.bg, color: sc.color }}>{row.status}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
                        <Clock size={14} /> 
                        {row.checkInAt ? new Date(row.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                        {row.checkOutAt ? \` → \${new Date(row.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\` : ""}
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
`;

const newContent = content.substring(0, startIdx) + newChunk + content.substring(endIdx);

fs.writeFileSync('src/pages/owner/PayrollPage.jsx', newContent);
console.log('Updated PayrollPage.jsx');
