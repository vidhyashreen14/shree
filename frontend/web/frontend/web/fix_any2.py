import re

def fix_implicit_any():
    with open('tsc_errors.txt', 'r', encoding='utf-8') as f:
        errors = f.readlines()
        
    for line in errors:
        match = re.match(r'(.+?)\((\d+),(\d+)\): error TS7006: Parameter \'(.+?)\' implicitly has an \'any\' type\.', line)
        if match:
            file_path, line_num, col_num, param = match.groups()
            line_num = int(line_num) - 1
            
            with open(file_path, 'r', encoding='utf-8') as src:
                lines = src.readlines()
            
            content_line = lines[line_num]
            
            # Simple targeted replace for exactly the parameter name on that line
            # We look for param used as a standalone parameter
            if f"({param})" in content_line:
                lines[line_num] = content_line.replace(f"({param})", f"({param}: any)")
            elif f"{param} =>" in content_line:
                lines[line_num] = content_line.replace(f"{param} =>", f"({param}: any) =>")
            elif "catch" in content_line and param in content_line:
                lines[line_num] = re.sub(f'catch\s*\(\s*{param}\s*\)', f'catch ({param}: any)', content_line)
            else:
                 # fallback generic regex for parameter in arrow function or catch
                 lines[line_num] = re.sub(rf'\b{param}\b', f'({param}: any)', content_line, count=1)

            with open(file_path, 'w', encoding='utf-8') as src:
                src.writelines(lines)
                print(f"Fixed {param} in {file_path}:{line_num+1}")

fix_implicit_any()
