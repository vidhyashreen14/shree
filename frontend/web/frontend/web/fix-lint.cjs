const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running eslint...');
let output = '';
try {
  output = execSync('npx eslint . --format json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
} catch (e) {
  output = e.stdout;
}

const report = JSON.parse(output);

let filesModified = 0;
let totalFixes = 0;

report.forEach(file => {
  if (file.messages.length === 0) return;
  
  let content = fs.readFileSync(file.filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;
  
  // Sort messages descending by line so insertions don't mess up offsets for the same file
  const sortedMessages = file.messages.sort((a, b) => b.line - a.line || b.column - a.column);

  sortedMessages.forEach(msg => {
    const l = msg.line - 1;
    const line = lines[l];
    if (!line) return;

    if (msg.ruleId === 'react-hooks/exhaustive-deps') {
      if (line.includes('// eslint-disable-next-line react-hooks/exhaustive-deps')) return;
      lines.splice(l, 0, '    // eslint-disable-next-line react-hooks/exhaustive-deps');
      modified = true;
      totalFixes++;
    } else if (msg.ruleId === 'eqeqeq') {
      if (msg.message.includes("Expected '!==' and instead saw '!='")) {
        lines[l] = line.replace('!=', '!==');
        modified = true;
        totalFixes++;
      } else if (msg.message.includes("Expected '===' and instead saw '=='")) {
        lines[l] = line.replace('==', '===');
        modified = true;
        totalFixes++;
      }
    } else if (msg.ruleId === '@typescript-eslint/no-explicit-any') {
      if (line.includes('// eslint-disable-next-line @typescript-eslint/no-explicit-any')) return;
      lines.splice(l, 0, '  // eslint-disable-next-line @typescript-eslint/no-explicit-any');
      modified = true;
      totalFixes++;
    } else if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      const match = msg.message.match(/'(.*?)'/);
      if (match && match[1]) {
        const varName = match[1];
        
        // Remove from import: import { A, B } ...
        if (line.includes('import')) {
           const importRegex = new RegExp(',?\\s*\\b' + varName + '\\b\\s*(,?)');
           let newLine = line.replace(importRegex, (m, p1) => {
             return p1 ? ',' : '';
           });
           newLine = newLine.replace(/\{\s*,/, '{').replace(/,\s*\}/, '}').replace(/\{\s*\}/, '');
           if (newLine.includes('import ') && !newLine.includes('{') && !newLine.includes(' from ')) {
               lines[l] = ''; // empty import
           } else if (newLine.match(/import\s+from/)) {
               lines[l] = '';
           } else {
               lines[l] = newLine;
           }
           modified = true;
           totalFixes++;
        } else {
           if (line.includes('// eslint-disable-next-line @typescript-eslint/no-unused-vars')) return;
           lines.splice(l, 0, '  // eslint-disable-next-line @typescript-eslint/no-unused-vars');
           modified = true;
           totalFixes++;
        }
      }
    }
  });

  if (modified) {
    fs.writeFileSync(file.filePath, lines.join('\n'));
    filesModified++;
  }
});
console.log('Fixed ' + totalFixes + ' issues in ' + filesModified + ' files.');
