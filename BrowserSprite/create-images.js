// Simple SVG creation for placeholder sprite images
const fs = require('fs');
const path = require('path');

// Create cat idle SVG
const catIdle = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="40" rx="25" ry="20" fill="#f4c542"/>
  <circle cx="22" cy="30" r="4" fill="#333"/>
  <circle cx="42" cy="30" r="4" fill="#333"/>
  <path d="M 25 45 Q 32 50 39 45" stroke="#333" stroke-width="2" fill="none"/>
  <path d="M 15 20 L 25 10 L 25 25" fill="#f4c542"/>
  <path d="M 49 20 L 39 10 L 39 25" fill="#f4c542"/>
</svg>`;

// Create dog idle SVG
const dogIdle = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="40" rx="25" ry="20" fill="#a67c52"/>
  <circle cx="22" cy="30" r="4" fill="#333"/>
  <circle cx="42" cy="30" r="4" fill="#333"/>
  <path d="M 25 45 Q 32 50 39 45" stroke="#333" stroke-width="2" fill="none"/>
  <ellipse cx="32" cy="15" rx="20" ry="10" fill="#a67c52"/>
  <path d="M 15 25 L 10 15 L 20 10" fill="#a67c52"/>
  <path d="M 49 25 L 54 15 L 44 10" fill="#a67c52"/>
</svg>`;

// Create slime idle SVG
const slimeIdle = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <path d="M 10 45 Q 32 70 54 45 Q 54 20 32 15 Q 10 20 10 45 Z" fill="#5cdb95"/>
  <circle cx="25" cy="35" r="5" fill="#333"/>
  <circle cx="39" cy="35" r="5" fill="#333"/>
  <path d="M 25 50 Q 32 45 39 50" stroke="#333" stroke-width="2" fill="none"/>
</svg>`;

// Create icon SVGs
const icon16 = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" rx="3" fill="#4285f4"/>
  <circle cx="6" cy="6" r="1.5" fill="#fff"/>
  <circle cx="10" cy="6" r="1.5" fill="#fff"/>
  <path d="M 5 9 Q 8 11 11 9" stroke="#fff" stroke-width="1" fill="none"/>
</svg>`;

const icon48 = `<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="8" fill="#4285f4"/>
  <circle cx="18" cy="18" r="4" fill="#fff"/>
  <circle cx="30" cy="18" r="4" fill="#fff"/>
  <path d="M 15 30 Q 24 36 33 30" stroke="#fff" stroke-width="3" fill="none"/>
</svg>`;

const icon128 = `<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="20" fill="#4285f4"/>
  <circle cx="48" cy="48" r="10" fill="#fff"/>
  <circle cx="80" cy="48" r="10" fill="#fff"/>
  <path d="M 40 80 Q 64 96 88 80" stroke="#fff" stroke-width="6" fill="none"/>
</svg>`;

// Write files
const imagesDir = path.join(__dirname, 'images');

fs.writeFileSync(path.join(imagesDir, 'cat-idle.svg'), catIdle);
fs.writeFileSync(path.join(imagesDir, 'dog-idle.svg'), dogIdle);
fs.writeFileSync(path.join(imagesDir, 'slime-idle.svg'), slimeIdle);
fs.writeFileSync(path.join(imagesDir, 'icon16.svg'), icon16);
fs.writeFileSync(path.join(imagesDir, 'icon48.svg'), icon48);
fs.writeFileSync(path.join(imagesDir, 'icon128.svg'), icon128);

console.log('Created placeholder sprite images');
