const fs = require('fs');

function refactorDashboard() {
  let code = fs.readFileSync('src/pages/owner/MyDashboardPage.jsx', 'utf8');

  const newStyles = `      <style>{\`
        @keyframes spinAround { to { transform: rotate(360deg); } }
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
        }
        .premium-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .premium-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }
        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
      \`}</style>`;

  code = code.replace(/<div className="page-shell">/, '<div className="page-shell" style={{ background: "#f1f5f9", minHeight: "100vh", paddingBottom: 60 }}>');
  code = code.replace(/<style>{\`\s*@keyframes spinAround { to { transform: rotate\(360deg\); } }\s*\`}<\/style>/, newStyles);
  
  // replace inline styles with glass-panel
  code = code.replace(/style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba\(0,0,0,0\.04\)", border: "1px solid rgba\(226,232,240,0\.8\)", position: "relative" }}/g, 'className="glass-panel" style={{ padding: 32, position: "relative" }}');
  code = code.replace(/style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba\(0,0,0,0\.04\)", border: "1px solid rgba\(226,232,240,0\.8\)" }}/g, 'className="glass-panel" style={{ padding: 32 }}');

  // replace appointment card with premium-card
  code = code.replace(/style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, boxShadow: "0 2px 4px rgba\(0,0,0,0\.01\)", transition: "transform 0\.2s" }} onMouseEnter={\(e\) => e.currentTarget.style.transform = "translateY\(-2px\)"} onMouseLeave={\(e\) => e.currentTarget.style.transform = "translateY\(0\)"}/g, 'className="premium-card" style={{ padding: 20, display: "flex", flexDirection: "column" }}');

  fs.writeFileSync('src/pages/owner/MyDashboardPage.jsx', code);
  console.log("MyDashboardPage updated.");
}

refactorDashboard();
