const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Only target lines with <input, <textarea, <select
  const lines = newContent.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<input') || lines[i].includes('<textarea') || lines[i].includes('<select')) {
      if (lines[i].includes('text-white')) {
        lines[i] = lines[i].replace(/text-white/g, 'text-foreground');
        changed = true;
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Updated ${filePath}`);
  }
}

walkDir('app', replaceInFile);
walkDir('components', replaceInFile);
