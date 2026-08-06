with open('src/pages/owner/MembershipsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad1 = '{ setShowPackageModal(false); setPackageForm(emptyPackage); }} title={packageEditMode ? "Edit Package" : "Create Package"}>\n'
bad2 = '{ setShowAssignMembershipModal(false)}} title="Assign Membership">\n'
bad3 = '{ setShowAssignPackageModal(false)}} title="Assign Package">\n'

text = text.replace(bad1, '')
text = text.replace(bad2, '')
text = text.replace(bad3, '')

with open('src/pages/owner/MembershipsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed Modals')
