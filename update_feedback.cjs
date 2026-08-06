const fs = require('fs');

const originalFilePath = 'src/pages/owner/SettingsPage.jsx';
let content = fs.readFileSync(originalFilePath, 'utf8');

const targetStr = `<label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer", marginBottom: 20 }}>
                  <input type="checkbox" checked={draftFeedbackType?.active ?? editing.active} onChange={(event) => draftFeedbackType && setDraftFeedbackType({ ...draftFeedbackType, active: event.target.checked })} style={{ width: 18, height: 18, accentColor: "var(--accent, #3b82f6)", cursor: "pointer" }} />
                  Active
                </label>
                <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>How it works</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
                    Feedback types stay synced with the live feedback request flow. When an invoice completes or a service closes, the selected type can be used to organize the request and follow-up sequence.
                  </div>
                </div>`;

const replacementStr = `<div style={{ marginBottom: 20 }}>
                  <ToggleSwitch 
                    checked={draftFeedbackType?.active ?? editing.active} 
                    onChange={(event) => draftFeedbackType && setDraftFeedbackType({ ...draftFeedbackType, active: event.target.checked })} 
                    label="Active" 
                    color="#14b8a6" 
                  />
                </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  
  // also change the primary button background color to standard blue as in other forms, or keep it #14b8a6. 
  // Wait, the "Save" button has `background: "var(--button-bg-solid, #3b82f6)"`. That's already blue.
  
  fs.writeFileSync(originalFilePath, content);
  console.log('Successfully updated feedback section');
} else {
  console.log('Target string not found');
}
