import re

def fix_unused_vars():
    files = [
        ('src/routes/_app.admin.staff.tsx', [(138, 'value'), (344, 'error'), (536, 'v'), (763, 'v'), (1286, 'v')]),
        ('src/routes/_app.doctor.patients.$id.tsx', [(1450, 'v')]),
        ('src/routes/_app.doctor.prescriptions.tsx', [(132, 'prescription')]),
        ('src/routes/_app.frontdesk.billing.tsx', [(213, 'error')]),
        ('src/routes/_app.frontdesk.register.tsx', [(481, 'error')]),
        ('src/routes/_app.nurse.vitals.tsx', [(127, 'error')]),
        ('src/routes/_app.pharmacy.inventory.tsx', [(420, 'error'), (833, 'v'), (852, 'v'), (987, 'v')]),
        ('src/routes/_app.superadmin.hospitals.tsx', [(104, 'e'), (430, 'v'), (477, 'error')]),
        ('src/routes/_app.superadmin.subscriptions.tsx', [(240, 'error'), (519, 'v')]),
        ('src/routes/_app.superadmin.support.tsx', [(367, 'v'), (487, 'v'), (525, 'v')]),
        ('src/routes/_app.superadmin.users.tsx', [(63, 'e'), (388, 'v')])
    ]
    
    for file_path, fixes in files:
        with open(file_path, 'r', encoding='utf-8') as src:
            lines = src.readlines()
            
        for lnum, var in fixes:
            idx = lnum - 1
            if idx < len(lines):
                content = lines[idx]
                
                # Replace exact parameter name
                content = re.sub(r'\(\s*' + var + r'\s*\)', f'(_{var})', content)
                content = re.sub(r'\b' + var + r'\s*=>', f'_{var} =>', content)
                
                if var == 'error':
                   content = re.sub(r'catch\s*\(\s*error\s*\)', 'catch (_error)', content)
                   
                lines[idx] = content
                
        with open(file_path, 'w', encoding='utf-8') as src:
            src.writelines(lines)
            print(f"Fixed in {file_path}")
            
fix_unused_vars()
