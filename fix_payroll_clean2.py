import re

f = open('src/pages/owner/PayrollPage.jsx', 'r', encoding='utf-8')
content = f.read()
f.close()

# 1. Add class to grids
content = re.sub(
    r'<div style=\{\{\s*display:\s*"grid"',
    r'<div className="responsive-att-grid" style={{ display: "grid"',
    content
)

# 2. Add class to tabs container
content = content.replace(
    '<div style={{ padding: "0 24px", display: "flex", gap: 12, marginBottom: 32 }}>',
    '<div className="att-tabs-container" style={{ padding: "0 24px", display: "flex", gap: 12, marginBottom: 32 }}>'
)

# 3. Add CSS
idx = content.find('}</style>')
css_to_add = '''
        @media (max-width: 900px) {
          .responsive-att-grid { grid-template-columns: 1fr !important; }
          .att-tabs-container { flex-wrap: wrap !important; overflow-x: auto !important; }
          .modern-table-container { overflow-x: auto !important; }
          .att-stat-card { width: 100% !important; }
        }
'''
if idx != -1:
    content = content[:idx] + css_to_add + content[idx:]

f = open('src/pages/owner/PayrollPage.jsx', 'w', encoding='utf-8')
f.write(content)
f.close()
