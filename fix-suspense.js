const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const stat = fs.statSync(dir);
  if (stat.isDirectory()) {
    fs.readdirSync(dir).forEach(f => walk(path.join(dir, f), callback));
  } else {
    callback(dir);
  }
}

let modified = 0;
walk('c:/Users/rarsh/Documents/CodeLab/master-module-admin-dashboard/app/dashboard', function(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('useSearchParams') && !content.includes('<Suspense') && !content.includes('export const dynamic')) {
    
    // Import Suspense if not there
    if (!content.includes('Suspense')) {
      content = content.replace(/"use client"\r?\n/, '"use client"\nimport { Suspense } from "react"\n');
    }

    const exportRegex = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/;
    const match = content.match(exportRegex);
    if (match) {
      const functionName = match[1];
      const newFunctionName = functionName + 'Content';
      content = content.replace(exportRegex, `function ${newFunctionName}() {`);
      
      content += `\n\nexport default function ${functionName}() {\n  return (\n    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement...</div>}>\n      <${newFunctionName} />\n    </Suspense>\n  )\n}\n`;
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
      modified++;
    }
  }
});

console.log('Total files modified:', modified);
