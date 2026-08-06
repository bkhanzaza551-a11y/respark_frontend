const fs = require('fs');
let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');
const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('const renderNotificationsSection'));
if(startIdx !== -1) {
    for(let i=startIdx+60; i<startIdx+200; i++) {
        if (lines[i] && lines[i].includes('type="checkbox"')) {
             for(let j=i-3; j<i+6; j++) {
                 if(lines[j]) console.log(lines[j]);
             }
             break;
        }
    }
}
