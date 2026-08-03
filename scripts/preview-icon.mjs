// Render a chore icon SVG to PNG for visual inspection during design.
import sharp from 'sharp'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="240" height="240">
  <rect width="48" height="48" fill="#1b1729"/>
  <!-- dog head, front view: floppy ears, muzzle, big nose, hanging tongue, collar -->
  <g>
    <!-- floppy ears behind head -->
    <path d="M13 11 C6 12 4 20 6 28 C7 32 10 33 12.5 31 L15 17 Z"
          fill="#e8e2fb" stroke="#c9c0ea" stroke-width="2" stroke-linejoin="round"/>
    <path d="M35 11 C42 12 44 20 42 28 C41 32 38 33 35.5 31 L33 17 Z"
          fill="#e8e2fb" stroke="#c9c0ea" stroke-width="2" stroke-linejoin="round"/>
    <!-- head -->
    <circle cx="24" cy="23" r="14" fill="#fff" stroke="#ded8f7" stroke-width="2"/>
    <!-- eyes + brows -->
    <ellipse cx="18.5" cy="19.5" rx="2" ry="2.4" fill="#1b1729"/>
    <ellipse cx="29.5" cy="19.5" rx="2" ry="2.4" fill="#1b1729"/>
    <!-- muzzle -->
    <ellipse cx="24" cy="29" rx="8" ry="6.5" fill="#fff" stroke="#ded8f7" stroke-width="1.8"/>
    <path d="M20.5 25.5 A4 3.4 0 0 1 27.5 25.5 A3.5 3 0 0 1 24 28.4 A3.5 3 0 0 1 20.5 25.5 Z" fill="#1b1729"/>
    <path d="M24 28.4 L24 31 M24 31 C22 33 20 33 19 31.5 M24 31 C26 33 28 33 29 31.5"
          stroke="#1b1729" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <!-- hanging tongue -->
    <path d="M21.8 32.8 C21.8 37.5 26.2 37.5 26.2 32.8 L25.8 31.8 L22.2 31.8 Z" fill="#fb7185" stroke="#e4566b" stroke-width="1"/>
    <path d="M24 32.5 L24 35.5" stroke="#e4566b" stroke-width="1"/>
    <!-- collar + tag -->
    <path d="M15 35 C18.5 38.5 29.5 38.5 33 35 L33.5 38 C29.5 42 18.5 42 14.5 38 Z"
          fill="#8b5cf6" stroke="#6d3ee8" stroke-width="1"/>
    <circle cx="24" cy="41" r="2.4" fill="#fbbf24" stroke="#e4a90f" stroke-width="1"/>
  </g>
</svg>`

await sharp(Buffer.from(svg)).png().toFile('scripts/icon-preview.png')
console.log('written scripts/icon-preview.png')
