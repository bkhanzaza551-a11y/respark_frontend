const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/CouponsPage.jsx', 'utf8');

const regex1 = /<div className=\"premium-modal-overlay\" onClick=\{\(\) => setShowCouponModal\(false\)\} style=\{\{ zIndex: 9999, background: 'rgba\(0,0,0,0\.6\)' \}\}>/g;
const replacement1 = `<div className="premium-modal-overlay" onClick={() => setShowCouponModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>`;

const regex2 = /<div className=\"premium-modal-overlay\" onClick=\{\(\) => setShowGiftCardModal\(false\)\} style=\{\{ zIndex: 9999, background: 'rgba\(0,0,0,0\.6\)' \}\}>\s*<div className=\"premium-modal-content\" onClick=\{e => e\.stopPropagation\(\)\} style=\{\{ maxWidth: 500, padding: 32, borderRadius: 16 \}\}>/g;
const replacement2 = `<div className="premium-modal-overlay" onClick={() => setShowGiftCardModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: 32, borderRadius: 16, background: '#ffffff', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>`;

if (content.match(regex1)) {
    content = content.replace(regex1, replacement1);
    console.log("Replaced coupon overlay.");
} else {
    console.log("Could not find coupon overlay to replace.");
}

if (content.match(regex2)) {
    content = content.replace(regex2, replacement2);
    console.log("Replaced gift card overlay.");
} else {
    console.log("Could not find gift card overlay to replace.");
}

fs.writeFileSync('src/pages/owner/CouponsPage.jsx', content);

