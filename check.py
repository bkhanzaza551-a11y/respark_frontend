with open('src/pages/owner/MembershipsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('activeSection === "memberships"')
print(text[idx-50:idx+600])
