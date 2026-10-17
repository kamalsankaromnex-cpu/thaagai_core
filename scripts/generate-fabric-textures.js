const fs = require("node:fs");
const path = require("node:path");

const fabricsDir = path.resolve(process.cwd(), "public/fabrics");
if (!fs.existsSync(fabricsDir)) {
  fs.mkdirSync(fabricsDir, { recursive: true });
}

// 1. Chettinad Cotton Maroon Butta (Seamless Repeating Pattern)
const chettinadSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <!-- Background Weave Texture -->
    <pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="#721C24" />
      <path d="M0 0h4v4H0zm4 4h4v4H4z" fill="#65171F" opacity="0.6"/>
      <path d="M0 4h4v4H0zm4-4h4v4H4z" fill="#7D232C" opacity="0.4"/>
    </pattern>
    <!-- Traditional Tamil Butta Motif -->
    <g id="butta">
      <!-- Gold Zari Petals -->
      <path d="M 0,-24 C 10,-12 10,12 0,24 C -10,12 -10,-12 0,-24 Z" fill="#D4AF37" />
      <path d="M -24,0 C -12,10 12,10 24,0 C 12,-10 -12,-10 -24,0 Z" fill="#D4AF37" />
      <circle cx="0" cy="0" r="6" fill="#800000" stroke="#FFD700" stroke-width="1.5" />
      <!-- Delicate corner dots -->
      <circle cx="-14" cy="-14" r="2" fill="#FFDF73" />
      <circle cx="14" cy="-14" r="2" fill="#FFDF73" />
      <circle cx="-14" cy="14" r="2" fill="#FFDF73" />
      <circle cx="14" cy="14" r="2" fill="#FFDF73" />
    </g>
  </defs>

  <rect width="512" height="512" fill="url(#weave)" />

  <g transform="translate(128, 128)"><use href="#butta" /></g>
  <g transform="translate(384, 128)"><use href="#butta" /></g>
  <g transform="translate(128, 384)"><use href="#butta" /></g>
  <g transform="translate(384, 384)"><use href="#butta" /></g>
  <g transform="translate(256, 256)"><use href="#butta" transform="scale(1.15)" /></g>
  <g transform="translate(0, 0)"><use href="#butta" /></g>
  <g transform="translate(512, 0)"><use href="#butta" /></g>
  <g transform="translate(0, 512)"><use href="#butta" /></g>
  <g transform="translate(512, 512)"><use href="#butta" /></g>
  <g transform="translate(256, 0)"><use href="#butta" /></g>
  <g transform="translate(256, 512)"><use href="#butta" /></g>
  <g transform="translate(0, 256)"><use href="#butta" /></g>
  <g transform="translate(512, 256)"><use href="#butta" /></g>
</svg>`;

// 2. Madurai Sungudi Royal Indigo with Temple Border
const sungudiSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <g id="sungudi-dot">
      <circle cx="0" cy="0" r="5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="0" cy="0" r="8" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.6" stroke-dasharray="2,2" />
    </g>
    <pattern id="temple-border" width="32" height="64" patternUnits="userSpaceOnUse">
      <rect width="32" height="64" fill="#C0392B" />
      <polygon points="16,4 32,56 0,56" fill="#F39C12" stroke="#D35400" stroke-width="1" />
      <polygon points="16,14 26,52 6,52" fill="#F1C40F" />
      <line x1="0" y1="60" x2="32" y2="60" stroke="#F1C40F" stroke-width="3" />
    </pattern>
  </defs>

  <rect width="512" height="512" fill="#15263F" />

  ${Array.from({ length: 8 })
    .map((_, row) =>
      Array.from({ length: 8 })
        .map((_, col) => {
          const x = col * 64 + (row % 2 === 0 ? 32 : 0);
          const y = row * 52 + 20;
          if (y > 420) return "";
          return `<g transform="translate(${x}, ${y})"><use href="#sungudi-dot" /></g>`;
        })
        .join("")
    )
    .join("")}

  <g transform="translate(0, 416)">
    <rect width="512" height="96" fill="url(#temple-border)" />
    <rect width="512" height="8" y="-8" fill="#F1C40F" />
    <rect width="512" height="4" y="-14" fill="#E67E22" />
  </g>
</svg>`;

// 3. Festive Kanchipuram Peacock Teal Raw Silk
const silkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <pattern id="silk-slub" width="64" height="64" patternUnits="userSpaceOnUse">
      <rect width="64" height="64" fill="#0B4B48" />
      <line x1="0" y1="12" x2="48" y2="12" stroke="#0F5E5A" stroke-width="2" opacity="0.7" />
      <line x1="20" y1="28" x2="64" y2="28" stroke="#083E3B" stroke-width="1.5" opacity="0.8" />
      <line x1="0" y1="44" x2="36" y2="44" stroke="#126B66" stroke-width="2.5" opacity="0.6" />
      <line x1="30" y1="58" x2="64" y2="58" stroke="#0F5E5A" stroke-width="1.8" opacity="0.7" />
    </pattern>
    <g id="zari-star">
      <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#E5C158" opacity="0.9" />
      <circle cx="0" cy="0" r="1.5" fill="#FFF4D0" />
    </g>
  </defs>

  <rect width="512" height="512" fill="url(#silk-slub)" />

  <g transform="translate(96, 96)"><use href="#zari-star" /></g>
  <g transform="translate(256, 64)"><use href="#zari-star" /></g>
  <g transform="translate(416, 112)"><use href="#zari-star" /></g>
  <g transform="translate(160, 240)"><use href="#zari-star" /></g>
  <g transform="translate(352, 224)"><use href="#zari-star" /></g>
  <g transform="translate(80, 384)"><use href="#zari-star" /></g>
  <g transform="translate(256, 368)"><use href="#zari-star" /></g>
  <g transform="translate(432, 400)"><use href="#zari-star" /></g>
</svg>`;

// 4. Photorealistic Cloth Micro-Weave & Drape Fold Bump Map
const bumpSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <!-- Micro-yarn interlacing pattern -->
    <pattern id="cloth-grid" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#7E7E7E" />
      <rect x="0" y="0" width="3" height="3" fill="#999999" />
      <rect x="3" y="3" width="3" height="3" fill="#606060" />
      <line x1="0" y1="3" x2="6" y2="3" stroke="#707070" stroke-width="0.5" />
      <line x1="3" y1="0" x2="3" y2="6" stroke="#707070" stroke-width="0.5" />
    </pattern>

    <!-- Subtle organic fabric drape gradient -->
    <linearGradient id="drape-gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#808080" stop-opacity="0.2"/>
      <stop offset="25%" stop-color="#A5A5A5" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#707070" stop-opacity="0.4"/>
      <stop offset="75%" stop-color="#A0A0A0" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#808080" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#cloth-grid)" />
  <rect width="512" height="512" fill="url(#drape-gradient)" />
</svg>`;

// 5. Atelier Haute Couture Mannequin Linen Fabric
const mannequinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <pattern id="linen-weave" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#E6DED1" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="#DACFBF" stroke-width="1.5" />
      <line x1="6" y1="0" x2="6" y2="12" stroke="#DACFBF" stroke-width="1.5" />
      <circle cx="3" cy="3" r="0.8" fill="#C9BDA9" />
      <circle cx="9" cy="9" r="0.8" fill="#C9BDA9" />
    </pattern>
  </defs>
  <rect width="256" height="256" fill="url(#linen-weave)" />
</svg>`;

fs.writeFileSync(path.join(fabricsDir, "chettinad-maroon-butta.svg"), chettinadSvg);
fs.writeFileSync(path.join(fabricsDir, "madurai-sungudi-blue.svg"), sungudiSvg);
fs.writeFileSync(path.join(fabricsDir, "kanchipuram-peacock-silk.svg"), silkSvg);
fs.writeFileSync(path.join(fabricsDir, "cloth-bump.svg"), bumpSvg);
fs.writeFileSync(path.join(fabricsDir, "mannequin-linen.svg"), mannequinSvg);

console.log("Generated textures including cloth-bump and mannequin-linen successfully!");
