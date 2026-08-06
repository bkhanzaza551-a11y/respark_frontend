const fs = require('fs');
let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

const startTarget = '<div className="settings-panel-card" style={{ marginBottom: 20 }}>';
const endTarget = '        <div className="shift-layout-grid">';

const startIdx = content.indexOf(startTarget);
const endIdx = content.indexOf(endTarget);

if (startIdx !== -1 && endIdx !== -1) {
    console.log(content.substring(startIdx, endIdx));
} else {
    console.log('Not found');
}
