const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

const targetStr = `                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleChange(item.key, e.target.checked)}
                        style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent, #3b82f6)" }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: channelLabels[item.key] === "Not wired yet" ? "#b45309" : "#475569" }}>
                        {channelLabels[item.key] || "Saved rule"}
                      </span>
                    </label>`;

const replacementStr = `                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                      <ToggleSwitch
                        checked={isChecked}
                        onChange={(e) => handleToggleChange(item.key, e.target.checked)}
                        label={channelLabels[item.key] || "Saved rule"}
                        color="#3b82f6"
                        labelColor={channelLabels[item.key] === "Not wired yet" ? "#b45309" : "#475569"}
                      />
                    </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
  console.log('Successfully updated notification checkboxes to toggles');
} else {
  console.log('Target block not found!');
}
