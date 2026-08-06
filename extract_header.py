with open('src/pages/owner/ReportsHubPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('<div className="rpt-header"')
end = text.find('className="rpt-table-wrap"')

print(text[start:end])
