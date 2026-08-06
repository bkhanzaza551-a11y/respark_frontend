import re

with open('src/pages/owner/MembershipsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add ToggleSwitch import
if 'ToggleSwitch' not in text:
    text = text.replace("import CustomDropdown from '../../components/common/CustomDropdown';", "import CustomDropdown from '../../components/common/CustomDropdown';\nimport ToggleSwitch from '../../components/common/ToggleSwitch';")

# 2. Strip the ugly inline styles from all inputs and selects
ugly_style = ' style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box", outline: "none" }}'
ugly_style_2 = ' style={{ marginBottom: "12px", padding: "8px 12px", width: "100%", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.8rem", outline: "none" }}'
ugly_dropdown_style = ' style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", marginBottom: "12px" }}'

text = text.replace(ugly_style, '')
text = text.replace(ugly_style_2, '')
text = text.replace(ugly_dropdown_style, '')

# 3. Replace Active checkboxes with ToggleSwitch
active_check_pkg = """<div style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px" }}>
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    style={{ accentColor: "var(--accent, #3b82f6)", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>Active</span>
                </div>"""

active_check_mem = """<div style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px" }}>
                  <input 
                    type="checkbox" 
                    checked={membershipForm.isActive} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, isActive: e.target.checked })}
                    style={{ accentColor: "var(--accent, #3b82f6)", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>Active</span>
                </div>"""

text = text.replace(active_check_pkg, '<ToggleSwitch label="Active" checked={true} onChange={() => {}} />')
text = text.replace(active_check_mem, '<ToggleSwitch label="Active" checked={membershipForm.isActive} onChange={(e) => setMembershipForm({ ...membershipForm, isActive: e.target.checked })} />')

# 4. Replace custom toggles
custom_toggle_pkg = """<label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", width: "fit-content" }}>
                  <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>Does this package include physical products?</span>
                  <div style={{ position: "relative", width: "36px", height: "20px", background: packageForm.includeProducts ? "#3b82f6" : "#cbd5e1", borderRadius: "20px", transition: "background 0.3s" }}>
                    <div style={{ position: "absolute", top: "2px", left: packageForm.includeProducts ? "18px" : "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%", transition: "left 0.3s" }}></div>
                  </div>
                  <input type="checkbox" checked={packageForm.includeProducts} onChange={e => setPackageForm({...packageForm, includeProducts: e.target.checked})} style={{ display: "none" }} />
                </label>"""

custom_toggle_sharable = """<label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", width: "fit-content" }}>
                  <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>Membership Sharable</span>
                  <div style={{ position: "relative", width: "36px", height: "20px", background: membershipForm.isSharable ? "#3b82f6" : "#cbd5e1", borderRadius: "20px", transition: "background 0.3s" }}>
                    <div style={{ position: "absolute", top: "2px", left: membershipForm.isSharable ? "18px" : "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%", transition: "left 0.3s" }}></div>
                  </div>
                  <input type="checkbox" checked={membershipForm.isSharable} onChange={e => setMembershipForm({...membershipForm, isSharable: e.target.checked})} style={{ display: "none" }} />
                </label>"""

custom_toggle_days = """<label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", width: "fit-content" }}>
                      <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>Apply Membership For Selected Days</span>
                      <div style={{ position: "relative", width: "36px", height: "20px", background: membershipForm.applySelectedDays ? "#3b82f6" : "#cbd5e1", borderRadius: "20px", transition: "background 0.3s" }}>
                        <div style={{ position: "absolute", top: "2px", left: membershipForm.applySelectedDays ? "18px" : "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%", transition: "left 0.3s" }}></div>
                      </div>
                      <input type="checkbox" checked={membershipForm.applySelectedDays} onChange={e => setMembershipForm({...membershipForm, applySelectedDays: e.target.checked})} style={{ display: "none" }} />
                    </label>"""

custom_toggle_services = """<label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", width: "fit-content" }}>
                      <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>Apply Membership On Selected Services</span>
                      <div style={{ position: "relative", width: "36px", height: "20px", background: membershipForm.applySelectedServices ? "#3b82f6" : "#cbd5e1", borderRadius: "20px", transition: "background 0.3s" }}>
                        <div style={{ position: "absolute", top: "2px", left: membershipForm.applySelectedServices ? "18px" : "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%", transition: "left 0.3s" }}></div>
                      </div>
                      <input type="checkbox" checked={membershipForm.applySelectedServices} onChange={e => setMembershipForm({...membershipForm, applySelectedServices: e.target.checked})} style={{ display: "none" }} />
                    </label>"""

text = text.replace(custom_toggle_pkg, '<ToggleSwitch label="Include physical products" checked={packageForm.includeProducts} onChange={e => setPackageForm({...packageForm, includeProducts: e.target.checked})} />')
text = text.replace(custom_toggle_sharable, '<ToggleSwitch label="Membership Sharable" checked={membershipForm.isSharable} onChange={e => setMembershipForm({...membershipForm, isSharable: e.target.checked})} />')
text = text.replace(custom_toggle_days, '<ToggleSwitch label="Apply For Selected Days" checked={membershipForm.applySelectedDays} onChange={e => setMembershipForm({...membershipForm, applySelectedDays: e.target.checked})} />')
text = text.replace(custom_toggle_services, '<ToggleSwitch label="Apply On Selected Services" checked={membershipForm.applySelectedServices} onChange={e => setMembershipForm({...membershipForm, applySelectedServices: e.target.checked})} />')

# Write back
with open('src/pages/owner/MembershipsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('UI Cleaned up successfully')
