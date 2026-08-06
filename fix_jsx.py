import re

with open('src/pages/owner/MembershipsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# The regex left behind duplicate tags inside the ModalWrappers.
# Specifically, we need to remove lines that look like:
# { setShowPackageModal(false); setPackageForm(emptyPackage); }} title={packageEditMode ? "Edit Package" : "Create Package"}>
# setShowAssignMembershipModal(false)} title="Assign Membership">
# setShowAssignPackageModal(false)} title="Assign Package">

lines = text.split('\n')
new_lines = []
for line in lines:
    if '{ setShowPackageModal(false); setPackageForm(emptyPackage); }} title={packageEditMode ? "Edit Package" : "Create Package"}>' in line:
        continue
    if 'setShowAssignMembershipModal(false)} title="Assign Membership">' in line:
        continue
    if 'setShowAssignPackageModal(false)} title="Assign Package">' in line:
        continue
    if '{ setShowMembershipModal(false); setMembershipForm(emptyMembership); }} title={membershipEditMode ? "Edit Membership Plan" : "Create Membership Plan"}>' in line:
        continue
    new_lines.append(line)

with open('src/pages/owner/MembershipsPage.jsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
print('JSX fixed')
