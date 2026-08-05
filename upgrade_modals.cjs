const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function insertImport(content, importStatement) {
    if (content.includes(importStatement)) return content;
    const lines = content.split('\n');
    lines.splice(1, 0, importStatement);
    return lines.join('\n');
}

walkDir(path.join(__dirname, 'src/pages'), function(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Remove local ToggleSwitch definitions
    const localToggleSwitchRegex = /const ToggleSwitch = \(\{.*?\}\) => \([\s\S]*?<\/label>\s*\)?;/;
    if (localToggleSwitchRegex.test(content)) {
        content = content.replace(localToggleSwitchRegex, '');
        content = insertImport(content, "import ToggleSwitch from '../../components/common/ToggleSwitch';");
    }
    
    // Check if file uses ToggleSwitch and is missing import
    if (content.includes('<ToggleSwitch') && !content.includes("from '../../components/common/ToggleSwitch'")) {
         content = insertImport(content, "import ToggleSwitch from '../../components/common/ToggleSwitch';");
    }

    // 2. Standardize Modal Overlays (background: rgba(15, 23, 42, 0.6), backdropFilter: blur(4px))
    // We will ensure overlays have style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 9999, position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
    // But since many overlays have inline styles or CSS classes, let's just standardize the inline styles for the overlays.
    // Actually, safer to just standardize the headers and close buttons globally.

    // 3. Standardize Modal Headers
    // Find headers like: <div className="modal-header" ...> or <div className="hub-modal-header" ...> or <div className="premium-modal-header" ...>
    // And replace them.
    // This requires regex or AST. Given the variation, let's target the Close button (the <X /> button) and the title.
    // Instead of regexing all headers, let's fix the specific "Update Stock Details" modal in ProductCategoriesPage first:
    
    if (filePath.includes('ProductCategoriesPage.jsx')) {
        // Fix the Stock Details Modal Header
        const oldStockHeader = `<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Update Stock Details</span>
              <button type="button" onClick={() => { setStockModal({ open: false, product: null }); }} style={{ background: "#e2e8f0", border: "none", cursor: "pointer", color: "#475569", padding: 6, borderRadius: "50%", display: "flex" }} onMouseEnter={e=>e.currentTarget.style.background="#cbd5e1"} onMouseLeave={e=>e.currentTarget.style.background="#e2e8f0"}><X size={16} /></button>
            </div>`;
        const newStockHeader = `<div className="hub-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #e2e8f0", background: "#ffffff", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#f0f9ff", padding: 8, borderRadius: 10, display: "flex", color: "#0ea5e9" }}>
                   <Package size={20} />
                </div>
                Update Stock Details
              </h2>
              <button type="button" onClick={() => setStockModal({ open: false, product: null })} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", padding: 8, borderRadius: 8, display: "flex", transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="#f1f5f9"; e.currentTarget.style.color="#0f172a"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#94a3b8"}}><X size={20} /></button>
            </div>`;
        content = content.replace(oldStockHeader, newStockHeader);

        // Fix the Retail/Consumable custom toggle to use ToggleSwitch
        const oldRetailConsumable = `<div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "16px 20px", border: "1px solid #f1f5f9", borderRadius: 12, background: "#f8fafc" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  <span style={{ color: "#64748b" }}>Retail</span>
                  <button type="button" onClick={() => setStockForm({...stockForm, productType: stockForm.productType === "RETAIL" ? "CONSUMABLE" : "RETAIL"})} style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: stockForm.productType === "RETAIL" ? "#3b82f6" : "#cbd5e1", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: stockForm.productType === "RETAIL" ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  <span style={{ color: "#64748b" }}>Consumable</span>
                  <button type="button" onClick={() => setStockForm({...stockForm, productType: stockForm.productType === "CONSUMABLE" ? "RETAIL" : "CONSUMABLE"})} style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: stockForm.productType === "CONSUMABLE" ? "#3b82f6" : "#cbd5e1", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: stockForm.productType === "CONSUMABLE" ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </label>
              </div>`;
        const newRetailConsumable = `<div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "16px 20px", border: "1px solid #f1f5f9", borderRadius: 12, background: "#f8fafc" }}>
                <ToggleSwitch label="Retail" checked={stockForm.productType === "RETAIL"} onChange={e => setStockForm({...stockForm, productType: e.target.checked ? "RETAIL" : "CONSUMABLE"})} color="#3b82f6" />
                <ToggleSwitch label="Consumable" checked={stockForm.productType === "CONSUMABLE"} onChange={e => setStockForm({...stockForm, productType: e.target.checked ? "CONSUMABLE" : "RETAIL"})} color="#3b82f6" />
              </div>`;
        content = content.replace(oldRetailConsumable, newRetailConsumable);
    }
    
    // Globally replace circular background close buttons in ALL modals
    // Pattern for circular close button: style={{ background: "#... (or none)", border: "none", cursor: "pointer", color: "#...", padding: ..., borderRadius: "50%" (optional), display: "flex" }} onMouseEnter={...} ...><X size={...} /></button>
    // This is too hard to regex reliably across all variations.
    // Instead, I'll use a slightly safer regex for generic close buttons that have an X.
    
    const closeBtnRegex = /<button[^>]*onClick=\{[^}]*\}[^>]*><X (?:size=\{[0-9]+\}\s*)?(?:color="[^"]*"\s*)?\/><\/button>/g;
    content = content.replace(closeBtnRegex, (match) => {
        // Only replace if it doesn't already have the new transparent style
        if (match.includes('background: "transparent"')) return match;
        
        // Extract onClick handler
        const onClickMatch = match.match(/onClick=\{([^}]*)\}/);
        if (!onClickMatch) return match;
        const onClickFn = onClickMatch[1];
        
        return `<button type="button" onClick={${onClickFn}} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", padding: 8, borderRadius: 8, display: "flex", transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="#f1f5f9"; e.currentTarget.style.color="#0f172a"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#94a3b8"}}><X size={20} /></button>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated Modals in: " + filePath);
    }
});
