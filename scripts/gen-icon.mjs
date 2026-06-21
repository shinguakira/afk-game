import sharp from "sharp";
import { writeFileSync } from "fs";

const SIZE = 1024;

// AFK Engineer icon: dark bg + terminal prompt ">_" in green
const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" rx="180" fill="#0f1216"/>

  <!-- Terminal prompt ">" -->
  <text
    x="200"
    y="580"
    font-family="'Courier New', Courier, monospace"
    font-size="420"
    font-weight="700"
    fill="#22c55e"
  >&gt;</text>

  <!-- Cursor "_" -->
  <rect x="540" y="530" width="240" height="60" rx="8" fill="#22c55e" opacity="0.9"/>

  <!-- "AFK" label bottom-right -->
  <text
    x="820"
    y="920"
    font-family="'Courier New', Courier, monospace"
    font-size="100"
    font-weight="700"
    fill="#22c55e"
    text-anchor="end"
    opacity="0.5"
  >AFK</text>
</svg>`;

writeFileSync("icon-source.svg", svg);

await sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png()
  .toFile("src-tauri/icons/icon-source.png");

console.log("icon-source.png generated");
