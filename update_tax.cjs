const fs = require('fs');
let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

const oldSection = `  const renderTaxSection = () => {
    const taxRows = taxRates;
    const inclusiveTax = form.advancedSettings.taxMapping.inclusiveTax ?? false;

    const selectedRow = taxRows.find((r) => r.id === selectedTaxId) || null;

    const startCreate = () => {
      setDraftTax({ id: null, label: "", code: "", rate: 0, active: true, applicableFor: ["SERVICE", "PRODUCT"], _isNew: true });
      setSelectedTaxId(null);
      setStatus((prev) => ({ ...prev, error: "", success: "" }));
    };

    const startEdit = (row) => {
      setDraftTax({ ...row, applicableFor: typeof row.applicableFor === "string" ? row.applicableFor.split(",").filter(Boolean) : (row.applicableFor || []), _isNew: false });
      setSelectedTaxId(row.id);
    };

    const cancelDraft = () => {
      setDraftTax(null);
      setSelectedTaxId(null);
      setStatus((prev) => ({ ...prev, error: "", success: "" }));
    };

    const saveDraft = async () => {
      if (!draftTax) return;
      if (!draftTax.label.trim()) return;
      try {
        const payload = {
          label: draftTax.label.trim(),
          code: draftTax.code?.trim() || draftTax.label.trim().toUpperCase().replace(/\\s+/g, "").slice(0, 8),
          rate: Number(draftTax.rate) || 0,
          active: draftTax.active !== false,
          applicableFor: Array.isArray(draftTax.applicableFor) ? draftTax.applicableFor : ["SERVICE", "PRODUCT"],
          branchId: selectedBranchId || null
        };
        if (draftTax._isNew) {
          const res = await api.post("/owner/tax-rates", payload);
          setTaxRates((prev) => [...prev, res.data]);
        } else {
          const res = await api.patch(\`/owner/tax-rates/\${draftTax.id}\`, payload);
          setTaxRates((prev) => prev.map((r) => (r.id === draftTax.id ? res.data : r)));
        }
        cancelDraft();
        setStatus({ loading: false, error: "", success: "Tax rate saved." });
      } catch (err) {
        setStatus({ loading: false, error: formatApiError(err, "Could not save tax rate"), success: "" });
      }
    };

    const deleteTax = async (id) => {
      try {
        await api.delete(\`/owner/tax-rates/\${id}\`);
        setTaxRates((prev) => prev.filter((r) => r.id !== id));
        if (selectedTaxId === id) cancelDraft();
        setStatus({ loading: false, error: "", success: "Tax rate deleted." });
      } catch (err) {
        setStatus({ loading: false, error: formatApiError(err, "Could not delete tax rate"), success: "" });
      }
    };

    const toggleApplicable = (key) => {
      if (!draftTax) return;
      const current = draftTax.applicableFor || [];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      setDraftTax({ ...draftTax, applicableFor: next });
    };

    const editing = draftTax || selectedRow;

    return (
      <>
        <SectionHeader title="Tax Mapping" description="Define named tax mappings for billing, services, packages, and reporting labels." badges={["Tax label: " + form.taxLabel, taxRows.length + " tax rows", inclusiveTax ? "Inclusive" : "Exclusive"]} />

        <div className="shift-layout-grid">
          {/* LEFT PANEL — Tax List */}
          <div style={{ width: "100%", flexShrink: 0 }}>
            <div className="settings-panel-card" style={{ padding: 0 }}>
              <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
                <button type="button" onClick={startCreate} style={{ width: "100%", padding: "10px", background: "#14b8a6", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Create New</button>
              </div>
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {taxRows.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      background: selectedTaxId === row.id ? "#eff6ff" : "white",
                      borderLeft: selectedTaxId === row.id ? "3px solid #3b82f6" : "3px solid transparent",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ flex: 1 }} onClick={() => { setSelectedTaxId(row.id); setDraftTax(null); }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{row.label || "Untitled Tax"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{row.code}</span>
                        <span>·</span>
                        <span>{row.rate}%</span>
                        <span>·</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.active ? "#22c55e" : "#94a3b8" }} />
                          {row.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); startEdit(row); }} title="Edit tax" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", color: "#475569", padding: 0 }}><Edit2 size={13} /></button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteTax(row.id); }} title="Delete tax" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", color: "#dc2626", padding: 0 }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
                {!taxRows.length && <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No taxes defined</div>}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL â€” Form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div className="settings-panel-card">
                <h3 style={{ color: "#14b8a6" }}>{draftTax?._isNew ? "Create Tax" : \`Edit: \${editing.label || "Tax"}\`}</h3>

                <div className="settings-form-grid" style={{ marginBottom: 16 }}>
                  <label className="settings-input-group">
                    <span className="muted">Tax Name</span>
                    <input value={draftTax?.label ?? editing.label} onChange={(e) => draftTax && setDraftTax({ ...draftTax, label: e.target.value })} placeholder="Enter Tax Name" />
                  </label>
                  <label className="settings-input-group">
                    <span className="muted">Tax Value</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input type="number" value={draftTax?.rate ?? editing.rate} onChange={(e) => draftTax && setDraftTax({ ...draftTax, rate: Number(e.target.value) })} placeholder="Enter Tax Value" style={{ flex: 1 }} />
                      <span style={{ padding: "8px 12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderLeft: "none", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#475569" }}>%</span>
                    </div>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
                  <ToggleSwitch
                    checked={draftTax?.active ?? editing.active}
                    onChange={(e) => draftTax && setDraftTax({ ...draftTax, active: e.target.checked })}
                    label="Active"
                    color="#14b8a6"
                  />
                  <ToggleSwitch
                    checked={inclusiveTax}
                    onChange={(e) => updateAdvancedObject("taxMapping", { inclusiveTax: e.target.checked })}
                    label="Inclusive Taxes"
                    color="#14b8a6"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 12 }}>Applicable For</div>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    {[{ key: "SERVICE", label: "Service" }, { key: "PRODUCT", label: "Product" }, { key: "MEMBERSHIP", label: "Membership" }, { key: "PACKAGE", label: "Packages" }].map(({ key, label }) => (
                      <ToggleSwitch
                        key={key}
                        checked={(draftTax?.applicableFor ?? (typeof editing.applicableFor === "string" ? editing.applicableFor.split(",") : (editing.applicableFor || []))).includes(key)}
                        onChange={() => draftTax && toggleApplicable(key)}
                        label={label}
                        color="#3b82f6"
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <button type="button" onClick={cancelDraft} style={{ padding: "10px 24px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#475569", fontSize: 13 }}>Cancel</button>
                  <button type="button" onClick={saveDraft} style={{ padding: "10px 24px", background: "var(--button-bg-solid, #14b8a6)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Save</button>
                </div>
              </div>
            ) : (
              <div className="settings-panel-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#94a3b8", fontSize: 14 }}>
                Select a tax from the left panel or click "Create New"
              </div>
            )}
          </div>
        </div>
      </>
    );
  };`;

const startStr = '  const renderTaxSection = () => {';
const startIdx = content.indexOf(startStr);
const endStr = '  const renderLoyaltySettingsSection = () => {';
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + oldSection + '\n\n' + content.substring(endIdx);
    fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
    console.log('Successfully updated tax section checkboxes to toggles!');
} else {
    console.log('Could not find tax section');
}
