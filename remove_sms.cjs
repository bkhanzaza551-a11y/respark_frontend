const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

// Find the renderSmsSection and remove it
const startStr = '  const renderSmsSection = () => (';
const startIdx = content.indexOf(startStr);
if (startIdx !== -1) {
    // Find the end of this block
    const endStr = '  );';
    const endIdx = content.indexOf(endStr, startIdx);
    if (endIdx !== -1) {
        content = content.substring(0, startIdx) + content.substring(endIdx + endStr.length);
    }
}

// Also remove the case block
const caseStart = '      case "sms-center":';
const caseStartIdx = content.indexOf(caseStart);
if (caseStartIdx !== -1) {
    const caseEndStr = '        return renderSmsSection();';
    const caseEndIdx = content.indexOf(caseEndStr, caseStartIdx);
    if (caseEndIdx !== -1) {
        content = content.substring(0, caseStartIdx) + content.substring(caseEndIdx + caseEndStr.length);
    }
}

fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
console.log('Removed sms-center section');
