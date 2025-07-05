// build.js - Build script for optimizing the project

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Simple CSS minifier
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around brackets, colons, semicolons, commas
    .replace(/;\}/g, '}') // Remove trailing semicolons
    .trim();
}

// Simple JS minifier
function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around brackets, colons, semicolons, commas
    .replace(/;\}/g, '}') // Remove trailing semicolons
    .trim();
}

// Bundle CSS files
function bundleCSS() {
  const cssFiles = [
    'src/css/common.css',
    'src/css/login.css',
    'src/css/signup.css'
  ];
  
  let bundledCSS = '';
  
  cssFiles.forEach(file => {
    if (existsSync(file)) {
      const css = readFileSync(file, 'utf8');
      bundledCSS += `/* ${file} */\n${css}\n\n`;
    }
  });
  
  // Create dist directory if it doesn't exist
  const distDir = 'dist';
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }
  
  // Write minified CSS
  const minifiedCSS = minifyCSS(bundledCSS);
  writeFileSync(join(distDir, 'bundle.min.css'), minifiedCSS);
  
  console.log('✅ CSS bundled and minified');
}

// Bundle JS files
function bundleJS() {
  const jsFiles = [
    'src/js/utils.js',
    'src/js/login.js',
    'src/js/signup.js',
    'src/js/dashboard.js'
  ];
  
  let bundledJS = '';
  
  jsFiles.forEach(file => {
    if (existsSync(file)) {
      const js = readFileSync(file, 'utf8');
      bundledJS += `// ${file}\n${js}\n\n`;
    }
  });
  
  // Create dist directory if it doesn't exist
  const distDir = 'dist';
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }
  
  // Write minified JS
  const minifiedJS = minifyJS(bundledJS);
  writeFileSync(join(distDir, 'bundle.min.js'), minifiedJS);
  
  console.log('✅ JavaScript bundled and minified');
}

// Copy HTML files
function copyHTML() {
  const htmlFiles = [
    'src/index.html',
    'src/pages/login.html',
    'src/pages/signup.html',
    'src/pages/dashboard.html'
  ];
  
  const distDir = 'dist';
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }
  
  htmlFiles.forEach(file => {
    if (existsSync(file)) {
      const html = readFileSync(file, 'utf8');
      const fileName = file.replace('src/', '');
      const distPath = join(distDir, fileName);
      
      // Create subdirectories if needed
      const distDirPath = dirname(distPath);
      if (!existsSync(distDirPath)) {
        mkdirSync(distDirPath, { recursive: true });
      }
      
      writeFileSync(distPath, html);
    }
  });
  
  console.log('✅ HTML files copied');
}

// Main build function
function build() {
  console.log('🚀 Starting build process...');
  
  try {
    bundleCSS();
    bundleJS();
    copyHTML();
    
    console.log('🎉 Build completed successfully!');
    console.log('📁 Output files are in the "dist" directory');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}

export { build, bundleCSS, bundleJS, copyHTML }; 