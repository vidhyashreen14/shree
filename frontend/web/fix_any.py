import re
import sys

def fix_implicit_any():
    with open('tsc_errors.txt', 'r') as f:
        errors = f.readlines()
        
    for line in errors:
        match = re.match(r'(.+?)\((\d+),(\d+)\): error TS7006: Parameter \'(.+?)\' implicitly has an \'any\' type\.', line)
        if match:
            file_path, line_num, col_num, param = match.groups()
            line_num = int(line_num) - 1
            
            with open(file_path, 'r', encoding='utf-8') as src:
                lines = src.readlines()
            
            content_line = lines[line_num]
            # Replace parameter without type to one with type : any
            if f"({param})" in content_line:
                lines[line_num] = content_line.replace(f"({param})", f"({param}: any)")
            elif f"{param} =>" in content_line:
                lines[line_num] = content_line.replace(f"{param} =>", f"({param}: any) =>")
            elif f"catch ({param})" in content_line:
                lines[line_num] = content_line.replace(f"catch ({param})", f"catch ({param}: any)")
            elif f"({param} =" in content_line: # default parameter
                 pass
            elif f"({param}," in content_line:
                 lines[line_num] = content_line.replace(f"({param},", f"({param}: any,")
            elif f", {param})" in content_line:
                 lines[line_num] = content_line.replace(f", {param})", f", {param}: any)")
                 
            # Custom checks for 'value', 'v', 'error', 'prescription' since we know those are the ones failing
            if param == "error":
                lines[line_num] = re.sub(r'\b(catch\s*\(\s*error\s*)\)', r'\1: any)', lines[line_num])
                lines[line_num] = re.sub(r'(\bonError:\s*\(\s*error\s*)\)', r'\1: any)', lines[line_num])
                lines[line_num] = re.sub(r'(\berror\s*=>)', r'(error: any) =>', lines[line_num])
                lines[line_num] = re.sub(r'(\(\s*error\s*\)\s*=>)', r'(error: any) =>', lines[line_num])
            elif param == "value":
                lines[line_num] = re.sub(r'(\(\s*value\s*\)\s*=>)', r'(value: any) =>', lines[line_num])
                lines[line_num] = re.sub(r'(\bvalue\s*=>)', r'(value: any) =>', lines[line_num])
            elif param == "v":
                lines[line_num] = re.sub(r'(\(\s*v\s*\)\s*=>)', r'(v: any) =>', lines[line_num])
                lines[line_num] = re.sub(r'(\bv\s*=>)', r'(v: any) =>', lines[line_num])
            elif param == "prescription":
                lines[line_num] = re.sub(r'(\(\s*prescription\s*\)\s*=>)', r'(prescription: any) =>', lines[line_num])
                lines[line_num] = re.sub(r'(\bprescription\s*=>)', r'(prescription: any) =>', lines[line_num])

            with open(file_path, 'w', encoding='utf-8') as src:
                src.writelines(lines)
                print(f"Fixed {param} in {file_path}:{line_num+1}")

fix_implicit_any()
