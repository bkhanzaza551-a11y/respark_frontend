import re

f = open('src/pages/owner/PayrollPage.jsx', 'r', encoding='utf-8')
content = f.read()
f.close()

idx = content.find('`\n        @media')
if idx != -1:
    print('Found broken css')
    content = content[:idx] + content[idx+1:].replace('}</style>', '`}</style>')
else:
    print('Not found')

f = open('src/pages/owner/PayrollPage.jsx', 'w', encoding='utf-8')
f.write(content)
f.close()