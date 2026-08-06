import re

with open('src/pages/owner/ReportsHubPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """        <div className="rpt-topbar" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {REPORTS_WITH_CHARTS.has(activeReport) && activeReport !== "sales_summary" && (
              <button
                type="button"
                className={`rpt-icon-btn ${showChart ? "active" : ""}`}
                title={showChart ? "Hide Chart" : "Show Chart"}
                onClick={() => setShowChart((current) => !current)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.78 1.02 6.43 2.66" />
                  <path d="M21 4v5h-5" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </button>
            )}
            {REPORTS_WITH_COLUMN_PICKER.has(activeReport) && activeReport !== "sales_summary" && (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className={`rpt-icon-btn ${columnPickerOpen ? "active" : ""}`}
                  title="Toggle Columns"
                  onClick={() => setColumnPickerOpen((current) => !current)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                    <line x1="7" y1="3" x2="7" y2="21" />
                  </svg>
                </button>
                {columnPickerOpen && (
                  <ColumnPicker
                    reportKey={activeReport}
                    visibleColumns={activeVisibleColumns}
                    onToggle={toggleColumn}
                    onSelectAll={() => setVisibleColumns([...allColumns])}
                    onClearAll={() => setVisibleColumns([])}
                    onClose={() => setColumnPickerOpen(false)}
                  />
                )}
              </div>
            )}
            <h2 className="rpt-title">{currentReport?.label || "Report"}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
            {activeReport !== "sales_summary" && (
              <button type="button" className="rpt-icon-btn" title="Export CSV" onClick={handleExportCSV}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}
            <button type="button" className="rpt-icon-btn" title="Print" onClick={() => window.print()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </button>
          </div>
        </div>

        <div id="report-filters" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {canSelectBranch && (
              <div style={{ minWidth: 180, maxWidth: 220 }}>
                <CustomDropdown
                  value={reportBranchId}
                  onChange={(e) => setReportBranchId(e.target.value)}
                  style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.82rem", width: "100%", fontWeight: 600, color: "#0f172a", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </CustomDropdown>
              </div>
            )}
            
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#e2e8f0", borderRadius: 8, padding: "4px 6px" }}>
              {QUICK_RANGES.map((qr) => (
                <button
                  key={qr.key}
                  type="button"
                  onClick={() => {
                    const range = computeQuickRange(qr.key);
                    setQuickRange(qr.key);
                    setFilters((current) => ({ ...current, start: range.start, end: range.end }));
                  }}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 11,
                    fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    background: quickRange === qr.key ? "#fff" : "transparent",
                    color: quickRange === qr.key ? "#0f172a" : "#475569",
                    boxShadow: quickRange === qr.key ? "0 1px 2px rgba(0,0,0,0.1)" : "none"
                  }}
                >{qr.label}</button>
              ))}
            </div>

            <div className="rpt-filter-chip" style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <span className="rpt-filter-label" style={{ fontWeight: 600, color: "#64748b" }}>From:</span>
              <input type="date" value={filters.start} onChange={(e) => { setQuickRange(""); setFilters((current) => ({ ...current, start: e.target.value })); }} max={filters.end || undefined} style={{ padding: "2px", border: "none", outline: "none", fontSize: "0.8rem", color: "#0f172a", background: "transparent" }} />
            </div>

            <div className="rpt-filter-chip" style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <span className="rpt-filter-label" style={{ fontWeight: 600, color: "#64748b" }}>To:</span>
              <input type="date" value={filters.end} onChange={(e) => { setQuickRange(""); setFilters((current) => ({ ...current, end: e.target.value })); }} min={filters.start || undefined} style={{ padding: "2px", border: "none", outline: "none", fontSize: "0.8rem", color: "#0f172a", background: "transparent" }} />
            </div>

            {(filters.start || filters.end) && (
              <button type="button" onClick={() => { setQuickRange(""); setFilters((current) => ({ ...current, start: "", end: "" })); }} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", color: "#ef4444", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>Clear Dates</button>
            )}

            <div style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }}></div>

            {filterConfig.map((f) => {
              const opts = getFilterOptions(f, filterOptions);
              const value = reportFilters[f.key] ?? "";
              return (
                <div key={f.key} className="rpt-filter-chip" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="rpt-filter-label" style={{ fontWeight: 600, color: "#475569" }}>{f.label}:</span>
                  {f.type === "text" ? (
                    <input
                      type="text"
                      value={value}
                      placeholder={f.placeholder || ""}
                      onChange={(e) => setReportFilters((current) => ({ ...current, [f.key]: e.target.value }))}
                      style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.82rem", minWidth: 130, color: "#0f172a" }}
                    />
                  ) : (
                    <CustomDropdown value={value} onChange={(e) => setReportFilters((current) => ({ ...current, [f.key]: e.target.value }))} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.82rem", minWidth: 130, background: "white", color: "#0f172a" }}>
                      {opts.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </CustomDropdown>
                  )}
                </div>
              );
            })}
        </div>
"""

# Find the start and end indices using regex
pattern = re.compile(r'<div className="rpt-topbar" style=\{\{ justifyContent: "space-between" \}\}>.*?<div className="rpt-table-wrap"', re.DOTALL)
text = pattern.sub(replacement + '\n        <div className="rpt-table-wrap"', text)

with open('src/pages/owner/ReportsHubPage.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('UI Restored successfully using full block regex.')
