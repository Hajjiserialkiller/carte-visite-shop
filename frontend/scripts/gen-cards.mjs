import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images", "cards");
mkdirSync(outDir, { recursive: true });

const W = 800;
const H = 600;

function card({ x = 150, y = 175, w = 500, h = 300, fill, stroke, textColor, lines = [], gloss = false, foil = false, rx = 18, pattern = null }) {
  const parts = [];
  const defs = [];
  const id = `card${Math.abs((fill?.charCodeAt(1) ?? 0) + (stroke?.length ?? 0)) % 7}_${gloss ? "g" : ""}${foil ? "f" : ""}`;
  let body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"`;

  if (pattern === "deboss") {
    defs.push(`<pattern id="dp" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.4" fill="${textColor}" opacity="0.16"/><circle cx="20" cy="20" r="2.4" fill="${textColor}" opacity="0.10"/></pattern>`);
    body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#dp)"/>`;
  } else if (pattern === "brushed") {
    defs.push(`<linearGradient id="bg_${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9BA3AF"/><stop offset="0.5" stop-color="#E5E7EB"/><stop offset="1" stop-color="#9BA3AF"/></linearGradient>`);
    body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#bg_${id})"/>`;
  } else if (pattern === "transparent") {
    body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#ffffff" opacity="0.42" stroke="#ffffff" stroke-width="2" stroke-dasharray="10 8"/>`;
  }

  parts.push(body);
  if (stroke) parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${stroke}" stroke-width="${pattern === "brushed" ? 2 : 4}"/>`);
  if (gloss) parts.push(`<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h / 2.4}" rx="${rx - 6}" fill="#ffffff" opacity="0.13"/>`);
  if (foil) parts.push(`<g fill="${textColor}"><circle cx="${x + w - 70}" cy="${y + 52}" r="3"/><circle cx="${x + w - 52}" cy="${y + 70}" r="2"/><circle cx="${x + w - 88}" cy="${y + 84}" r="2.4"/><circle cx="${x + w - 40}" cy="${y + 100}" r="1.8"/></g>`);

  lines.forEach(([lx, ly, lw, lh, col], i) => {
    const opacity = col === "accent" ? 1 : 0.55;
    const fill = col === "accent" ? textColor : textColor;
    const extra = col === "accent" ? ` fill-opacity="1"` : ` fill-opacity="0.5"`;
    parts.push(`<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="${lh / 2}" fill="${fill}"${col === "accent" ? "" : extra} opacity="${opacity}"/>`);
    void i;
  });

  const rect = defs.length ? `<defs>${defs.join("")}</defs>` : "";
  return `${rect}<g>${parts.join("")}</g>`;
}

function scene({ bg, bg2, cardSvg, decor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${decor ?? ""}
  <g transform="rotate(-4 400 325)">${cardSvg}</g>
</svg>`;
}

const txt = (x, y, len, h, col = "base") => [x, y, len, h, col];

const cards = {
  "classic-matte": scene({
    bg: "#F3EEE3", bg2: "#E4DCC9",
    cardSvg: card({ fill: "#FFFFFF", stroke: "#D8D2C4", textColor: "#14141A", lines: [
      txt(260, 235, 90, 12, "accent"), txt(260, 262, 60, 8), txt(260, 285, 40, 8), txt(260, 390, 120, 7), txt(260, 412, 90, 7),
    ] }),
  }),
  "classic-gloss": scene({
    bg: "#E8ECF0", bg2: "#CBD5E1",
    cardSvg: card({ fill: "#FFFFFF", stroke: "#94A3B8", textColor: "#0F172A", gloss: true, lines: [
      txt(255, 230, 100, 12, "accent"), txt(255, 258, 64, 8), txt(255, 395, 130, 7), txt(255, 418, 96, 7),
    ] }),
  }),
  "premium-soft-touch": scene({
    bg: "#2A2438", bg2: "#1A1524",
    cardSvg: card({ fill: "#0E0E13", stroke: "#3A3646", textColor: "#E3C566", lines: [
      txt(255, 232, 100, 12, "accent"), txt(255, 260, 58, 8), txt(255, 388, 120, 7), txt(255, 410, 88, 7),
    ] }),
  }),
  "premium-gold-foil": scene({
    bg: "#101014", bg2: "#000000",
    decor: `<g stroke="#C9A227" opacity="0.5"><circle cx="640" cy="120" r="90" fill="none" stroke-width="1"/><circle cx="640" cy="120" r="120" fill="none" stroke-width="0.5"/></g>`,
    cardSvg: card({ fill: "#0B0B0E", stroke: "#2A2A30", textColor: "#D4AF37", foil: true, lines: [
      txt(255, 230, 105, 12, "accent"), txt(255, 258, 60, 8), txt(255, 388, 118, 7), txt(255, 410, 86, 7),
    ] }),
  }),
  "metal-brushed": scene({
    bg: "#3F454D", bg2: "#262B31",
    cardSvg: card({ pattern: "brushed", stroke: "#6B7280", textColor: "#374151", lines: [
      txt(255, 232, 100, 12, "accent"), txt(255, 260, 60, 8), txt(255, 388, 120, 7), txt(255, 410, 90, 7),
    ] }),
  }),
  "transparent-crystal": scene({
    bg: "#DCE6EE", bg2: "#B9C8D6",
    decor: `<g opacity="0.5"><circle cx="130" cy="470" r="60" fill="#ffffff" opacity="0.5"/><circle cx="680" cy="110" r="45" fill="#ffffff" opacity="0.6"/></g>`,
    cardSvg: card({ pattern: "transparent", fill: "#ffffff", textColor: "#334155", lines: [
      txt(260, 232, 90, 12, "accent"), txt(260, 260, 56, 8), txt(260, 388, 110, 7), txt(260, 410, 80, 7),
    ] }),
  }),
  "velvet-deboss": scene({
    bg: "#123B2E", bg2: "#0A241C",
    cardSvg: card({ pattern: "deboss", fill: "#0E2A20", stroke: "#1E4A3A", textColor: "#D9B36C", lines: [
      txt(258, 236, 92, 11, "accent"), txt(258, 264, 54, 8), txt(258, 390, 112, 7), txt(258, 412, 82, 7),
    ] }),
  }),
  "kraft-eco": scene({
    bg: "#C9B18C", bg2: "#B29872",
    cardSvg: card({ fill: "#D9C4A0", stroke: "#A98F68", textColor: "#4A3A28", lines: [
      txt(258, 234, 96, 12, "accent"), txt(258, 262, 58, 8), txt(258, 390, 118, 7), txt(258, 412, 86, 7),
    ] }),
  }),
};

for (const [name, svg] of Object.entries(cards)) {
  writeFileSync(join(outDir, `${name}.svg`), svg, "utf8");
  console.log(`generated ${name}.svg`);
}
