const fs = require('fs');
const path = require('path');

const directories = [
  'C:/Users/neeli/.gemini/antigravity/scratch/breathe_esg/breathe_esg_frontend/src/pages',
  'C:/Users/neeli/.gemini/antigravity/scratch/breathe_esg/breathe_esg_frontend/src/components'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We don't want to change LoginPage since it's already perfectly dark
      if (file === 'LoginPage.jsx') continue;
      // We don't want to mess up Layout too much since we already hand-styled it, but it should be fine.
      
      content = content.replace(/bg-white/g, 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg');
      content = content.replace(/text-gray-900/g, 'text-white font-bold');
      content = content.replace(/text-gray-700/g, 'text-gray-200');
      content = content.replace(/text-gray-600/g, 'text-gray-300');
      content = content.replace(/text-gray-500/g, 'text-gray-400');
      content = content.replace(/bg-gray-50/g, 'bg-gray-800/50');
      content = content.replace(/border-gray-200/g, 'border-gray-700');
      content = content.replace(/border-gray-100/g, 'border-gray-700');
      
      // Specifically target "Courier New" for headings where text-white font-bold is applied
      content = content.replace(/text-2xl font-bold text-white font-bold/g, 'text-2xl font-bold text-white tracking-widest uppercase" style={{fontFamily: \'"Courier New", monospace\'}} className="');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

directories.forEach(processDirectory);
console.log('Done replacing theme strings.');
