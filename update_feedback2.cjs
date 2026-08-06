const fs = require('fs');
let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

const startTarget = '<label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer", marginBottom: 20 }}>';
const endTarget = '                  <button type="button" onClick={cancelDraft} style={{ padding: "10px 24px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#475569", fontSize: 13 }}>Cancel</button>';

const startIdx = content.indexOf(startTarget);
const endIdx = content.indexOf(endTarget);

if (startIdx !== -1 && endIdx !== -1) {
  const replacementStr = `<div style={{ marginBottom: 20 }}>
                  <ToggleSwitch 
                    checked={draftFeedbackType?.active ?? editing.active} 
                    onChange={(event) => draftFeedbackType && setDraftFeedbackType({ ...draftFeedbackType, active: event.target.checked })} 
                    label="Active" 
                    color="#3b82f6" 
                  />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
`;
  content = content.substring(0, startIdx) + replacementStr + content.substring(endIdx);
  fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
  console.log('Successfully updated feedback section');
} else {
  console.log('Target block not found');
}
