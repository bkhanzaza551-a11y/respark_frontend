const fs = require('fs');
let content = fs.readFileSync('src/pages/owner/CouponsPage.jsx', 'utf8');

// Update emptyGiftCard
content = content.replace(
  'const emptyGiftCard = {\n  code: "",\n  title: "",\n  originalAmount: 1000,\n  note: ""\n};',
  'const emptyGiftCard = {\n  code: "",\n  title: "",\n  originalAmount: 1000,\n  note: "",\n  isActive: true,\n  validityDays: 365\n};'
);

// Update setEditingGc initialization
content = content.replace(
  'setGiftCardForm({ code: gc.code, title: gc.title, originalAmount: gc.originalAmount, note: gc.note || "" });',
  'setGiftCardForm({ code: gc.code, title: gc.title, originalAmount: gc.originalAmount, note: gc.note || "", isActive: gc.isActive ?? true, validityDays: gc.expiresAt ? Math.max(1, Math.round((new Date(gc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))) : 365 });'
);

// Update saveGiftCard post/patch body
const oldPatch = 'originalAmount: Number(giftCardForm.originalAmount),\n          note: giftCardForm.note,\n          branchId: selectedBranchId || null';
const newPatch = 'originalAmount: Number(giftCardForm.originalAmount),\n          note: giftCardForm.note,\n          isActive: giftCardForm.isActive,\n          validityDays: Number(giftCardForm.validityDays),\n          branchId: selectedBranchId || null';
content = content.replaceAll(oldPatch, newPatch);

// Update the modal UI
const modalUI = `{showGiftCardModal && (
        <div className="premium-modal-overlay" onClick={() => setShowGiftCardModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, padding: 32, borderRadius: 16, background: '#ffffff', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{editingGc ? "Update Gift Card" : "Issue Gift Card"}</h2>
              <button onClick={() => setShowGiftCardModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={saveGiftCard} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
                <ToggleSwitch
                  checked={giftCardForm.isActive}
                  onChange={(val) => setGiftCardForm({ ...giftCardForm, isActive: val })}
                  label={giftCardForm.isActive ? "Active" : "Inactive"}
                  color="#7c3aed"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Gift Card Code</span><input placeholder="e.g. GC-2024-001" required value={giftCardForm.code} onChange={(e) => setGiftCardForm({ ...giftCardForm, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Title</span><input placeholder="e.g. Birthday Voucher" required value={giftCardForm.title} onChange={(e) => setGiftCardForm({ ...giftCardForm, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Amount (₹)</span><input type="number" min="1" placeholder="e.g. 1000" required value={giftCardForm.originalAmount} onChange={(e) => setGiftCardForm({ ...giftCardForm, originalAmount: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Validity (Days)</span><input type="number" min="1" placeholder="365" required value={giftCardForm.validityDays} onChange={(e) => setGiftCardForm({ ...giftCardForm, validityDays: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              </div>
              <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Note (Optional)</span><input placeholder="Internal note..." value={giftCardForm.note} onChange={(e) => setGiftCardForm({ ...giftCardForm, note: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowGiftCardModal(false)} className="secondary-button">Cancel</button>
                <button type="submit" className="primary-button" style={{ background: '#7c3aed' }}>{editingGc ? "Update Gift Card" : "Issue Gift Card"}</button>
              </div>
            </form>
          </div>
        </div>
      )}`;

const oldModalRegex = /\{showGiftCardModal && \([\s\S]*?(?=\}\)\n    <\/div>\n  \);\n\})/m;
if (content.match(oldModalRegex)) {
    content = content.replace(oldModalRegex, modalUI);
    fs.writeFileSync('src/pages/owner/CouponsPage.jsx', content);
    console.log('Successfully updated GiftCard form');
} else {
    console.log('Could not find modal to replace');
}
