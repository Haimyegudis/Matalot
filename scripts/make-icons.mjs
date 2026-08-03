// Rasterize the app icon SVG to PNG sizes for PWA/TWA.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const svg = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${pad ? 0 : 110}" fill="#9b5de5"/>
  <g transform="translate(256 268)">
    <path d="M-150 -40 L0 -160 L150 -40 L150 130 A24 24 0 0 1 126 154 L-126 154 A24 24 0 0 1 -150 130 Z"
      fill="#fff7ea" stroke="#2b2145" stroke-width="18" stroke-linejoin="round"/>
    <path d="M-178 -28 L0 -172 L178 -28" fill="none" stroke="#ff6b6b" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M0 -70 l22 44 48 7 -35 34 8 48 -43 -22 -43 22 8 -48 -35 -34 48 -7 z"
      fill="#ffc53d" stroke="#2b2145" stroke-width="14" stroke-linejoin="round"/>
    <circle cx="-16" cy="10" r="7" fill="#2b2145"/>
    <circle cx="16" cy="10" r="7" fill="#2b2145"/>
    <path d="M-14 34 q14 14 28 0" fill="none" stroke="#2b2145" stroke-width="10" stroke-linecap="round"/>
    <path d="M-96 92 h192" stroke="#2ec4b6" stroke-width="22" stroke-linecap="round"/>
  </g>
</svg>`

mkdirSync('public/icons', { recursive: true })
await sharp(Buffer.from(svg(false))).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(svg(false))).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(Buffer.from(svg(true))).resize(512, 512).png().toFile('public/icons/icon-maskable-512.png')
console.log('icons written')
