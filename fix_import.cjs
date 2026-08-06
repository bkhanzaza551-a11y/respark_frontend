const fs = require('fs');
let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

if (!content.includes('import ToggleSwitch')) {
  const importIdx = content.indexOf('import ');
  
  if (importIdx > -1) {
    const importStatement = 'import ToggleSwitch from "../../components/common/ToggleSwitch";\n';
    content = content.slice(0, importIdx) + importStatement + content.slice(importIdx);
    fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
    console.log('Added ToggleSwitch import');
  }
}
