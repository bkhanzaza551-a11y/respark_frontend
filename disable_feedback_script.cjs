const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

const regex = /<div className="settings-panel-card" style={{ marginBottom: 20 }}>\s*<div className="settings-toggle-grid">\s*<ToggleRow checked={feedback.enabled} label="Enable feedback" onChange={\(value\) => updateAdvancedObject\("feedbackSetting", { enabled: value }\)} \/>\s*<ToggleRow checked={feedback.sendSms} label="Send feedback SMS" onChange={\(value\) => updateAdvancedObject\("feedbackSetting", { sendSms: value }\)} \/>\s*<ToggleRow checked={feedback.sendWhatsapp} label="Send follow-up WhatsApp" onChange={\(value\) => updateAdvancedObject\("feedbackSetting", { sendWhatsapp: value }\)} \/>\s*<\/div>\s*<div className="settings-form-grid" style={{ marginTop: 18 }}>\s*<label className="settings-input-group"><span className="muted">Feedback delay \(hours\)<\/span><input type="number" value={feedback.feedbackDelayHours} onChange={\(event\) => updateAdvancedObject\("feedbackSetting", { feedbackDelayHours: Number\(event.target.value\) }\)} \/><\/label>\s*<label className="settings-input-group"><span className="muted">Low rating alert email<\/span><input value={feedback.lowRatingAlertEmail} onChange={\(event\) => updateAdvancedObject\("feedbackSetting", { lowRatingAlertEmail: event.target.value }\)} \/><\/label>\s*<label className="settings-input-group"><span className="muted">Rating prompt<\/span><textarea rows="3" value={feedback.ratingPrompt} onChange={\(event\) => updateAdvancedObject\("feedbackSetting", { ratingPrompt: event.target.value }\)} \/><\/label>\s*<label className="settings-input-group"><span className="muted">Thank you message<\/span><textarea rows="3" value={feedback.thankYouMessage} onChange={\(event\) => updateAdvancedObject\("feedbackSetting", { thankYouMessage: event.target.value }\)} \/><\/label>\s*<\/div>\s*<\/div>\s*<div className="shift-layout-grid">/g;

const replacementStr = `<div className="settings-panel-card" style={{ marginBottom: 20 }}>
          <div className="settings-toggle-grid" style={{ paddingBottom: feedback.enabled ? 16 : 0, borderBottom: feedback.enabled ? '1px solid #f1f5f9' : 'none', transition: 'all 0.3s' }}>
            <ToggleRow checked={feedback.enabled} label="Enable feedback" onChange={(value) => updateAdvancedObject("feedbackSetting", { enabled: value })} />
          </div>
          <div style={{ opacity: feedback.enabled ? 1 : 0.4, pointerEvents: feedback.enabled ? 'auto' : 'none', height: feedback.enabled ? 'auto' : 0, overflow: 'hidden', transition: 'all 0.3s' }}>
            <div className="settings-toggle-grid" style={{ marginTop: 16 }}>
              <ToggleRow checked={feedback.sendSms} label="Send feedback SMS" onChange={(value) => updateAdvancedObject("feedbackSetting", { sendSms: value })} disabled={!feedback.enabled} />
              <ToggleRow checked={feedback.sendWhatsapp} label="Send follow-up WhatsApp" onChange={(value) => updateAdvancedObject("feedbackSetting", { sendWhatsapp: value })} disabled={!feedback.enabled} />
            </div>
            <div className="settings-form-grid" style={{ marginTop: 18 }}>
              <label className="settings-input-group"><span className="muted">Feedback delay (hours)</span><input type="number" value={feedback.feedbackDelayHours} onChange={(event) => updateAdvancedObject("feedbackSetting", { feedbackDelayHours: Number(event.target.value) })} disabled={!feedback.enabled} /></label>
              <label className="settings-input-group"><span className="muted">Low rating alert email</span><input value={feedback.lowRatingAlertEmail} onChange={(event) => updateAdvancedObject("feedbackSetting", { lowRatingAlertEmail: event.target.value })} disabled={!feedback.enabled} /></label>
              <label className="settings-input-group"><span className="muted">Rating prompt</span><textarea rows="3" value={feedback.ratingPrompt} onChange={(event) => updateAdvancedObject("feedbackSetting", { ratingPrompt: event.target.value })} disabled={!feedback.enabled} /></label>
              <label className="settings-input-group"><span className="muted">Thank you message</span><textarea rows="3" value={feedback.thankYouMessage} onChange={(event) => updateAdvancedObject("feedbackSetting", { thankYouMessage: event.target.value })} disabled={!feedback.enabled} /></label>
            </div>
          </div>
        </div>

        <div className="shift-layout-grid" style={{ opacity: feedback.enabled ? 1 : 0.4, pointerEvents: feedback.enabled ? 'auto' : 'none', transition: 'all 0.3s' }}>`;

if (content.match(regex)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
  console.log('Successfully disabled feedback section on toggle');
} else {
  console.log('Regex fail');
}
