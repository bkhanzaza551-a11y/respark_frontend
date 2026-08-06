const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

// 1. Redefine SectionHeader to remove the right-side actions
const sectionHeaderRegex = /const SectionHeader = \(\{ title, description, badges, action \}\) => \([\s\S]*?className="settings-section-head"[\s\S]*?<div>\s*<h2>\{title\}<\/h2>\s*<p>\{description\}<\/p>\s*<\/div>\s*<div className="settings-section-head-actions">[\s\S]*?<\/div>\s*<\/div>\s*\);/;

const newSectionHeader = `const SectionHeader = ({ title, description, badges, action }) => (
  <div className="settings-section-head">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);`;

content = content.replace(sectionHeaderRegex, newSectionHeader);

// 2. Remove the explanatory muted divs that appear right after SectionHeader
// These typically look like:
// <SectionHeader ... />
// <div className="muted" style={{ marginBottom: 12, fontSize: 12 }}>...</div>
// Sometimes they don't have style, sometimes they do.
// But they are always direct siblings.
// We can just find all instances of <div className="muted" ...> that contain long text and remove them.
// Let's use a regex that matches <div className="muted"[^>]*>...</div> where ... does NOT contain <input or <select or <span
// Wait, a better way is to just find `<SectionHeader ... />` and then remove the immediate `<div className="muted"...>...</div>` if it exists.

const parts = content.split('<SectionHeader');
for (let i = 1; i < parts.length; i++) {
    // Find the end of this SectionHeader tag
    const endIdx = parts[i].indexOf('/>');
    if (endIdx !== -1) {
        // Look at the text immediately following the `/>`
        const afterHeader = parts[i].substring(endIdx + 2);
        
        // Check if it's followed by a muted div
        const match = afterHeader.match(/^\s*<div className="muted"[^>]*>([\s\S]*?)<\/div>/);
        
        if (match) {
            // Remove it!
            const toRemove = match[0];
            // Ensure we aren't removing a div that contains complex nested elements, just text or simple tags
            // The text we want to remove is usually a paragraph of text.
            if (!toRemove.includes('<input') && !toRemove.includes('<label')) {
                parts[i] = parts[i].substring(0, endIdx + 2) + afterHeader.substring(toRemove.length);
            }
        }
    }
}

content = parts.join('<SectionHeader');

// There are also some `<p className="muted"...>` that follow SectionHeader. Let's remove those too.
const partsP = content.split('<SectionHeader');
for (let i = 1; i < partsP.length; i++) {
    const endIdx = partsP[i].indexOf('/>');
    if (endIdx !== -1) {
        const afterHeader = partsP[i].substring(endIdx + 2);
        const match = afterHeader.match(/^\s*<p className="muted"[^>]*>([\s\S]*?)<\/p>/);
        if (match) {
            const toRemove = match[0];
            partsP[i] = partsP[i].substring(0, endIdx + 2) + afterHeader.substring(toRemove.length);
        }
    }
}
content = partsP.join('<SectionHeader');

fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
console.log('Successfully updated SettingsPage.jsx');
