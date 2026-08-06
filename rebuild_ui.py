import re

with open('src/pages/owner/MembershipsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Search import if missing
if 'Search,' not in text and 'Search }' not in text:
    text = text.replace('import { Trash2, Edit2, Plus, PackageOpen, Package, X, UserPlus } from "lucide-react";', 'import { Trash2, Edit2, Plus, PackageOpen, Package, X, UserPlus, Search } from "lucide-react";')


# 2. Change wrapper class
text = text.replace('className="crm-table-container"', 'className="page-shell"')

# 3. Replace the inner div blocks for memberships and packages to match Branches page
# Memberships replacement
text = re.sub(
    r'<div style=\{\{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba\(0,0,0,0\.05\)" \}\}>\s*<div style=\{\{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 \}\}>\s*<h3 style=\{\{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" \}\}>\{customerMembershipMode \? "Assigned Memberships" : "Membership Plans"\}</h3>\s*<div style=\{\{ display: "flex", gap: 12 \}\}>\s*\{!customerMembershipMode && \(\s*<button onClick=\{\(\) => setShowAssignMembershipModal\(true\)\} className="secondary-button" style=\{\{ display: "flex", alignItems: "center", gap: 8 \}\}><UserPlus size=\{16\}/> Assign</button>\s*\)\}\s*\{!customerMembershipMode && \(\s*<button onClick=\{\(\) => setShowMembershipModal\(true\)\} className="cta-button" style=\{\{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" \}\}><Plus size=\{16\}/> Create Plan</button>\s*\)\}\s*\{customerMembershipMode && \(\s*<button onClick=\{\(\) => setShowAssignMembershipModal\(true\)\} className="cta-button" style=\{\{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" \}\}><Plus size=\{16\}/> Assign Membership</button>\s*\)\}\s*</div>\s*</div>',
    """<div className="panel-card" style={{ padding: 0, overflow: "hidden", marginTop: 24 }}>
              <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 10, color: "#64748b" }} />
                  <input 
                    placeholder="Search memberships..." 
                    value={searchQuery || ""} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {!customerMembershipMode && (
                    <button onClick={() => setShowAssignMembershipModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer" }}><UserPlus size={16}/> Assign</button>
                  )}
                  {!customerMembershipMode && (
                    <button onClick={() => setShowMembershipModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Create Plan</button>
                  )}
                  {customerMembershipMode && (
                    <button onClick={() => setShowAssignMembershipModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Assign Membership</button>
                  )}
                </div>
              </div>""", text)

text = re.sub(
    r'<table className="crm-table" style=\{\{ width: "100%", textAlign: "left", borderCollapse: "collapse" \}\}>\s*<thead>\s*<tr>\s*<th>PLAN NAME</th>\s*<th>TYPE</th>\s*<th>PRICE</th>\s*<th>VALIDITY</th>\s*<th>BENEFIT</th>\s*<th style=\{\{ textAlign: "right" \}\}>ACTIONS</th>\s*</tr>\s*</thead>',
    """<table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Plan Name</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Type</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Price</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Validity</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Benefit</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>""", text)

# Packages replacement
text = re.sub(
    r'<div style=\{\{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba\(0,0,0,0\.05\)" \}\}>\s*<div style=\{\{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 \}\}>\s*<h3 style=\{\{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" \}\}>\{customerPackageMode \? "Assigned Packages" : "Packages"\}</h3>\s*<div style=\{\{ display: "flex", gap: 12 \}\}>\s*\{!customerPackageMode && \(\s*<button onClick=\{\(\) => setShowAssignPackageModal\(true\)\} className="secondary-button" style=\{\{ display: "flex", alignItems: "center", gap: 8 \}\}><UserPlus size=\{16\}/> Assign</button>\s*\)\}\s*\{!customerPackageMode && \(\s*<button onClick=\{\(\) => setShowPackageModal\(true\)\} className="cta-button" style=\{\{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" \}\}><Plus size=\{16\}/> Create Package</button>\s*\)\}\s*\{customerPackageMode && \(\s*<button onClick=\{\(\) => setShowAssignPackageModal\(true\)\} className="cta-button" style=\{\{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600, border: "none", cursor: "pointer" \}\}><Plus size=\{16\}/> Assign Package</button>\s*\)\}\s*</div>\s*</div>',
    """<div className="panel-card" style={{ padding: 0, overflow: "hidden", marginTop: 24 }}>
              <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 10, color: "#64748b" }} />
                  <input 
                    placeholder="Search packages..." 
                    value={searchQuery || ""} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {!customerPackageMode && (
                    <button onClick={() => setShowAssignPackageModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer" }}><UserPlus size={16}/> Assign</button>
                  )}
                  {!customerPackageMode && (
                    <button onClick={() => setShowPackageModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Create Package</button>
                  )}
                  {customerPackageMode && (
                    <button onClick={() => setShowAssignPackageModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Assign Package</button>
                  )}
                </div>
              </div>""", text)


text = re.sub(
    r'<table className="crm-table" style=\{\{ width: "100%", textAlign: "left", borderCollapse: "collapse" \}\}>\s*<thead>\s*<tr>\s*<th>PACKAGE NAME</th>\s*<th>PRICE</th>\s*<th>SESSIONS</th>\s*<th>VALIDITY</th>\s*<th style=\{\{ textAlign: "right" \}\}>ACTIONS</th>\s*</tr>\s*</thead>',
    """<table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Package Name</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Price</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Sessions</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Validity</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>""", text)

# Table rows
text = text.replace('<tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>', '<tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff" }}>')
text = text.replace('<td style={{ padding: "16px", color: "#0f172a", fontSize: 14, fontWeight: 600 }}>', '<td style={{ padding: "16px", color: "#0f172a", fontSize: 14, fontWeight: 500 }}>')

# Button "Edit" to icon
text = text.replace('<button type="button" onClick={() => navigate(`/admin/memberships/${item.id}/edit`)} style={{ background: "white", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 6, fontSize: 13, color: "#475569", cursor: "pointer" }}>Edit</button>', '<button type="button" onClick={() => navigate(`/admin/memberships/${item.id}/edit`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}><Edit2 size={16} /></button>')
text = text.replace('<button type="button" onClick={() => navigate(`/admin/packages/${item.id}/edit`)} style={{ background: "white", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 6, fontSize: 13, color: "#475569", cursor: "pointer" }}>Edit</button>', '<button type="button" onClick={() => navigate(`/admin/packages/${item.id}/edit`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}><Edit2 size={16} /></button>')

# Trash button
text = text.replace('<button type="button" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }} disabled={deletingId === item.id}', '<button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }} disabled={deletingId === item.id}')

with open('src/pages/owner/MembershipsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('UI Restored successfully using regex.')
