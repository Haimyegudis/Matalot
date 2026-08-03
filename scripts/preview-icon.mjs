// Render a chore icon SVG to PNG for visual inspection during design.
import sharp from 'sharp'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="240" height="240">
  <rect width="48" height="48" fill="#1b1729"/>
  <!-- spitz head, front view: pointy ears, fluffy white, collar + tag -->
  <g>
    <!-- ears -->
    <path d="M11 16 L8 4 L20 9 Z" fill="#fff" stroke="#ded8f7" stroke-width="2" stroke-linejoin="round"/>
    <path d="M37 16 L40 4 L28 9 Z" fill="#fff" stroke="#ded8f7" stroke-width="2" stroke-linejoin="round"/>
    <path d="M11.5 13.5 L10.5 8 L16 10.5 Z" fill="#fbb1c0"/>
    <path d="M36.5 13.5 L37.5 8 L32 10.5 Z" fill="#fbb1c0"/>
    <!-- fluffy head: main circle + side tufts -->
    <circle cx="24" cy="23" r="14.5" fill="#fff" stroke="#ded8f7" stroke-width="2"/>
    <path d="M10.5 28 C8 30 8 33 10 35 M37.5 28 C40 30 40 33 38 35"
          stroke="#ded8f7" stroke-width="2" fill="#fff" stroke-linecap="round"/>
    <!-- eyes -->
    <ellipse cx="18.5" cy="21" rx="2" ry="2.4" fill="#1b1729"/>
    <ellipse cx="29.5" cy="21" rx="2" ry="2.4" fill="#1b1729"/>
    <!-- nose + mouth + tongue -->
    <path d="M21.5 27.5 L26.5 27.5 L24 30.5 Z" fill="#1b1729"/>
    <path d="M24 30.5 L24 32.5 M24 32.5 C22.5 34.5 20 34.5 19 33 M24 32.5 C25.5 34.5 28 34.5 29 33"
          stroke="#1b1729" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M22.5 34.5 C22.5 37 25.5 37 25.5 34.5 L25.2 33.6 L22.8 33.6 Z" fill="#fb7185"/>
    <!-- collar -->
    <path d="M14 34.5 C17 38.5 31 38.5 34 34.5 L34.5 37.5 C30.5 41.5 17.5 41.5 13.5 37.5 Z"
          fill="#fb7185" stroke="#e4566b" stroke-width="1"/>
    <circle cx="24" cy="40.5" r="2.6" fill="#fbbf24" stroke="#e4a90f" stroke-width="1"/>
  </g>
</svg>`

await sharp(Buffer.from(svg)).png().toFile('scripts/icon-preview.png')
console.log('written scripts/icon-preview.png')
