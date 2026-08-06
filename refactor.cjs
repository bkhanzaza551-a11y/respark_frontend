const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/MembershipsPage.jsx', 'utf8');

// 1. Add new icons and ModalWrapper
content = content.replace(
  'import { Trash2, Edit2, Plus, PackageOpen, Package } from "lucide-react";',
  'import { Trash2, Edit2, Plus, PackageOpen, Package, X, UserPlus, CheckCircle, ChevronRight } from "lucide-react";'
);

// 2. Add ModalWrapper component and states
const modalWrapperStr = `
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }} className="hub-form-group">
          {children}
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace('const emptyMembership = {', modalWrapperStr + '\\nconst emptyMembership = {');

content = content.replace(
  'const [deletingId, setDeletingId] = useState(null);',
  `const [deletingId, setDeletingId] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAssignMembershipModal, setShowAssignMembershipModal] = useState(false);
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  
  useEffect(() => {
    if (editableMembershipId || location.pathname.includes('/memberships/create')) {
      setShowMembershipModal(true);
    } else {
      setShowMembershipModal(false);
    }
  }, [editableMembershipId, location.pathname]);
  
  useEffect(() => {
    if (editablePackageId || location.pathname.includes('/packages/create')) {
      setShowPackageModal(true);
    } else {
      setShowPackageModal(false);
    }
  }, [editablePackageId, location.pathname]);
`
);

content = content.replace(
  'import { Link, useLocation, useParams } from "react-router-dom";',
  'import { Link, useLocation, useParams, useNavigate } from "react-router-dom";'
);
content = content.replace(
  'const location = useLocation();',
  'const location = useLocation();\\n  const navigate = useNavigate();'
);

// 3. Replace the form cancel buttons to close modal
content = content.replace(
  /<button type="button" onClick={\(\) => setMembershipForm\(emptyMembership\)} style={{ padding: "8px 24px"[^>]+>Cancel<\/button>/g,
  '<button type="button" onClick={() => { setMembershipForm(emptyMembership); navigate("/admin/memberships"); setShowMembershipModal(false); }} style={{ padding: "8px 24px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f1f5f9", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>'
);
content = content.replace(
  /<button type="button" onClick={\(\) => { setPackageForm\(emptyPackage\); setServiceSearch\(""\); setProductSearch\(""\); }} style={{ padding: "8px 24px"[^>]+>Cancel<\/button>/g,
  '<button type="button" onClick={() => { setPackageForm(emptyPackage); setServiceSearch(""); setProductSearch(""); navigate("/admin/packages"); setShowPackageModal(false); }} style={{ padding: "8px 24px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f1f5f9", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>'
);

// Modify submit handlers to close modals and navigate
content = content.replace(
  'setStatus({ error: "", success: membershipEditMode ? "Membership updated." : "Membership created." });',
  'setStatus({ error: "", success: membershipEditMode ? "Membership updated." : "Membership created." });\\n                setShowMembershipModal(false);\\n                navigate("/admin/memberships");'
);
content = content.replace(
  'setStatus({ error: "", success: packageEditMode ? "Package updated." : "Package created." });',
  'setStatus({ error: "", success: packageEditMode ? "Package updated." : "Package created." });\\n                setShowPackageModal(false);\\n                navigate("/admin/packages");'
);


// 4. Transform Form Wrappers to Modals
// Original memberships form wrapper:
// {(activeSection === "memberships") && !customerMembershipMode && (
//   <div className="panel-card">
//     <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>

// Transform to:
content = content.replace(
  /\{\(activeSection === "memberships"\) && !customerMembershipMode && \(\\s*<div className="panel-card">\\s*<div[^>]+>\\s*<span[^>]+>\\s*(?:\{membershipEditMode[^}]+\})\\s*<\/span>\\s*<\/div>/g,
  '<ModalWrapper isOpen={showMembershipModal} onClose={() => { setShowMembershipModal(false); navigate("/admin/memberships"); setMembershipForm(emptyMembership); }} title={membershipEditMode ? "Edit Membership Plan" : "Create Membership Plan"}>'
);
content = content.replace(
  /\{\(activeSection === "packages"\) && !customerPackageMode && \(\\s*<div className="panel-card">\\s*<div[^>]+>\\s*<span[^>]+>\\s*(?:\{packageEditMode[^}]+\})\\s*<\/span>\\s*<\/div>/g,
  '<ModalWrapper isOpen={showPackageModal} onClose={() => { setShowPackageModal(false); navigate("/admin/packages"); setPackageForm(emptyPackage); }} title={packageEditMode ? "Edit Package" : "Create Package"}>'
);

// The closing tags for these forms are:
//             </form>
//           </div>
//         )}
// We need to replace these with </ModalWrapper>
let newContent = "";
let replacements = 0;
const lines = content.split('\\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</form>') && lines[i+1] && lines[i+1].includes('</div>') && lines[i+2] && lines[i+2].includes(')}')) {
    // Only replace if it's one of the 4 forms.
    if (replacements < 4) {
      newContent += lines[i] + '\\n';
      newContent += '        </ModalWrapper>\\n';
      i += 2; // skip </div> and )}
      replacements++;
      continue;
    }
  }
  newContent += lines[i] + '\\n';
}
content = newContent;

// 5. Replace the assign wrappers with Modals
content = content.replace(
  /\{\(activeSection === "memberships"\) && <div className="panel-card">\\s*<h3>Assign Membership<\/h3>\\s*<p className="muted"[^>]+>\{customerScopeLabel\}<\/p>/g,
  '<ModalWrapper isOpen={showAssignMembershipModal} onClose={() => setShowAssignMembershipModal(false)} title="Assign Membership">'
);
content = content.replace(
  /\{\(activeSection === "packages"\) && <div className="panel-card">\\s*<h3>Assign Package<\/h3>\\s*<p className="muted"[^>]+>\{customerScopeLabel\}<\/p>/g,
  '<ModalWrapper isOpen={showAssignPackageModal} onClose={() => setShowAssignPackageModal(false)} title="Assign Package">'
);

// Submit handlers for assigns to close modal
content = content.replace(
  'setStatus({ error: "", success: "Membership assigned." });',
  'setStatus({ error: "", success: "Membership assigned." });\\n              setShowAssignMembershipModal(false);'
);
content = content.replace(
  'setStatus({ error: "", success: "Package assigned." });',
  'setStatus({ error: "", success: "Package assigned." });\\n              setShowAssignPackageModal(false);'
);

// 6. Rewrite the lists as tables!
// Replace: <div className="settings-section-grid">
content = content.replace('<div className="settings-section-grid">', '<div className="crm-table-container">');

const membershipTable = `
        {(activeSection === "memberships") && (
          <div style={{ padding: 24, background: "white", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{customerMembershipMode ? "Assigned Memberships" : "Membership Plans"}</h3>
              <div style={{ display: "flex", gap: 12 }}>
                {!customerMembershipMode && (
                  <button onClick={() => setShowAssignMembershipModal(true)} className="secondary-button" style={{ display: "flex", alignItems: "center", gap: 8 }}><UserPlus size={16}/> Assign</button>
                )}
                {!customerMembershipMode && (
                  <Link to="/admin/memberships/create" className="cta-button" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}><Plus size={16}/> Create Plan</Link>
                )}
                {customerMembershipMode && (
                  <button onClick={() => setShowAssignMembershipModal(true)} className="cta-button" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600 }}><Plus size={16}/> Assign Membership</button>
                )}
              </div>
            </div>
            
            {loading ? <PageLoader compact title="Loading memberships" message="Preparing plans and assignments..." /> : null}
            
            <table className="crm-table">
              <thead>
                <tr>
                  <th>PLAN NAME</th>
                  <th>TYPE</th>
                  <th>PRICE</th>
                  <th>VALIDITY</th>
                  <th>BENEFIT</th>
                  <th style={{ width: 120 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {(customerMembershipMode ? (selectedCustomerHistory?.memberships || []) : filteredMemberships).map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{customerMembershipMode ? item.membershipPlan?.name : item.name}</td>
                    <td><span className="badge">{customerMembershipMode ? item.status : (item.benefitType === "WALLET_VALUE" ? "Fixed Wallet" : "Percentage")}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatMoney(Number(item.price || 0))}</td>
                    <td>{customerMembershipMode ? \`Ends \${String(item.endsAt).slice(0, 10)}\` : \`\${item.validityDays} days\`}</td>
                    <td>{customerMembershipMode ? formatMoney(Number(item.remainingWalletValue || 0)) : (item.benefitType === "WALLET_VALUE" ? formatMoney(Number(item.walletValue || 0)) : \`\${item.discountValue}%\`)}</td>
                    <td>
                      {!customerMembershipMode && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Link to={\`/admin/memberships/\${item.id}/edit\`} className="secondary-button" style={{ padding: "6px 12px" }}>Edit</Link>
                          <button type="button" className="secondary-button" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px" }} disabled={deletingId === item.id} onClick={async () => {
                            if (!window.confirm(\`Delete membership plan "\${item.name}"?\`)) return;
                            try {
                              setDeletingId(item.id);
                              await api.delete(\`/owner/memberships/\${item.id}\`);
                              setStatus({ error: "", success: "Membership plan deleted." });
                              setTimeout(() => setStatus({ error: "", success: "" }), 3000);
                              await loadAll(customerId);
                            } catch (error) {
                              setStatus({ error: formatApiError(error, "Could not delete plan"), success: "" });
                            } finally {
                              setDeletingId(null);
                            }
                          }}>{deletingId === item.id ? "..." : <Trash2 size={14} />}</button>
                        </div>
                      )}
                      {customerMembershipMode && (
                        <button type="button" className="secondary-button" onClick={() => setMembershipLifecycleForm((current) => ({ ...current, customerMembershipId: item.id }))}>Lifecycle</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customerMembershipMode && !loading && !selectedCustomerHistory?.memberships?.length && <EmptyState title="No memberships assigned" />}
            {!customerMembershipMode && !loading && !filteredMemberships.length && <EmptyState title="No membership plans yet" />}
          </div>
        )}
`;

const packageTable = `
        {(activeSection === "packages") && (
          <div style={{ padding: 24, background: "white", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{customerPackageMode ? "Assigned Packages" : "Packages"}</h3>
              <div style={{ display: "flex", gap: 12 }}>
                {!customerPackageMode && (
                  <button onClick={() => setShowAssignPackageModal(true)} className="secondary-button" style={{ display: "flex", alignItems: "center", gap: 8 }}><UserPlus size={16}/> Assign</button>
                )}
                {!customerPackageMode && (
                  <Link to="/admin/packages/create" className="cta-button" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}><Plus size={16}/> Create Package</Link>
                )}
                {customerPackageMode && (
                  <button onClick={() => setShowAssignPackageModal(true)} className="cta-button" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600 }}><Plus size={16}/> Assign Package</button>
                )}
              </div>
            </div>
            
            {loading ? <PageLoader compact title="Loading packages" message="Preparing packages and assignments..." /> : null}
            
            <table className="crm-table">
              <thead>
                <tr>
                  <th>PACKAGE NAME</th>
                  <th>PRICE</th>
                  <th>SESSIONS</th>
                  <th>VALIDITY</th>
                  <th style={{ width: 120 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {(customerPackageMode ? (selectedCustomerHistory?.packages || []) : filteredPackages).map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{customerPackageMode ? item.package?.name : item.name}</td>
                    <td style={{ fontWeight: 600 }}>{formatMoney(Number(item.price || 0))}</td>
                    <td>{customerPackageMode ? <span className="badge">{item.remainingSessions} remaining</span> : \`\${item.totalSessions} sessions\`}</td>
                    <td>{customerPackageMode ? \`Ends \${String(item.endsAt).slice(0, 10)}\` : \`\${item.validityDays} days\`}</td>
                    <td>
                      {!customerPackageMode && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Link to={\`/admin/packages/\${item.id}/edit\`} className="secondary-button" style={{ padding: "6px 12px" }}>Edit</Link>
                          <button type="button" className="secondary-button" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px" }} disabled={deletingId === item.id} onClick={async () => {
                            if (!window.confirm(\`Delete package "\${item.name}"?\`)) return;
                            try {
                              setDeletingId(item.id);
                              await api.delete(\`/owner/packages/\${item.id}\`);
                              setStatus({ error: "", success: "Package deleted." });
                              setTimeout(() => setStatus({ error: "", success: "" }), 3000);
                              await loadAll(customerId);
                            } catch (error) {
                              setStatus({ error: formatApiError(error, "Could not delete package"), success: "" });
                            } finally {
                              setDeletingId(null);
                            }
                          }}>{deletingId === item.id ? "..." : <Trash2 size={14} />}</button>
                        </div>
                      )}
                      {customerPackageMode && (
                        <button type="button" className="secondary-button" onClick={() => setPackageLifecycleForm((current) => ({ ...current, customerPackageId: item.id }))}>Lifecycle</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customerPackageMode && !loading && !selectedCustomerHistory?.packages?.length && <EmptyState title="No packages assigned" />}
            {!customerPackageMode && !loading && !filteredPackages.length && <EmptyState title="No packages yet" />}
          </div>
        )}
`;

// Now replace the old lists with the new tables
content = content.replace(
  /\{\(activeSection === "memberships"\) && <div className="panel-card">\\s*<h3>\{customerMembershipMode[^<]+<\/h3>[\\s\\S]*?<\/div>\s*<\/div>\s*\}/,
  membershipTable
);

content = content.replace(
  /\{\(activeSection === "packages"\) && <div className="panel-card">\\s*<h3>\{customerPackageMode[^<]+<\/h3>[\\s\\S]*?<\/div>\s*<\/div>\s*\}/,
  packageTable
);

fs.writeFileSync('src/pages/owner/MembershipsPage.jsx', content);
console.log("Refactoring complete!");
