// Draws the size-guide illustrations into public/assets/guides/*.svg.
// Dog and person outlines were traced from the brand's own walk photos,
// so proportions stay true to life. Labels with numbers live in the page
// (they change with the language), not in these files.
// Run: node scripts/media/generate-guide-illustrations.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const out = join(process.cwd(), "public/assets/guides");
const shapes = JSON.parse(
  await readFile(join(import.meta.dirname, "guide-outlines.json"), "utf8"),
);

const INK = "#34362f";
const MUTED = "#8b8e82";
const ACCENT = "#e0702f";

/** Catmull-Rom through traced points, as cubic Bézier segments. */
function smooth(points, closed = true, tension = 0.5) {
  const n = points.length;
  const at = (i) =>
    closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [
      p1[0] + ((p2[0] - p0[0]) * tension) / 3,
      p1[1] + ((p2[1] - p0[1]) * tension) / 3,
    ];
    const c2 = [
      p2[0] - ((p3[0] - p1[0]) * tension) / 3,
      p2[1] - ((p3[1] - p1[1]) * tension) / 3,
    ];
    d += `C${c1.map((v) => v.toFixed(1)).join(" ")} ${c2
      .map((v) => v.toFixed(1))
      .join(" ")} ${p2[0]} ${p2[1]}`;
  }
  return closed ? `${d}Z` : d;
}

const svg = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`;

/* BioThane webbing: a darker edge under the face colour reads as a flat strap. */
function strap(d, { colour = "#6d7357", edge = "#4c513e", width = 11 } = {}) {
  return `<path d="${d}" stroke="${edge}" stroke-width="${width + 3}"/><path d="${d}" stroke="${colour}" stroke-width="${width}"/><path d="${d}" stroke="#ffffff" stroke-opacity=".16" stroke-width="2" transform="translate(0 -2.5)"/>`;
}

/* Matte black hardware: a ring that the hook can clip into. */
function ring(x, y, { r = 8, metal = "#2b2c28", active = false } = {}) {
  const halo = active
    ? `<circle cx="${x}" cy="${y}" r="${r + 9}" fill="${ACCENT}" fill-opacity=".16" stroke="${ACCENT}" stroke-width="2"/>`
    : "";
  return `${halo}<circle cx="${x}" cy="${y}" r="${r}" stroke="${metal}" stroke-width="4"/>`;
}

/* Rivet plate where the strap folds back on itself. */
function joint(x, y, angle = 0, metal = "#2b2c28") {
  return `<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="-9" y="-10" width="18" height="20" rx="4" fill="${metal}"/><circle cx="0" cy="-4" r="2" fill="#77796f"/><circle cx="0" cy="4" r="2" fill="#77796f"/></g>`;
}

/* Swivel snap hook (carabiner style), drawn pointing right from (x, y). */
function snapHook(x, y, { metal = "#2b2c28", angle = 0, scale = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" stroke="${metal}">
<rect x="-2" y="-7" width="11" height="14" rx="3" fill="${metal}" stroke="none"/>
<circle cx="14" cy="0" r="4.2" stroke-width="3.2"/>
<rect x="18" y="-3.6" width="9" height="7.2" rx="2.4" fill="${metal}" stroke="none"/>
<path d="M27 0C27-9 37-13 49-12C61-11 68-5 68 1C68 8 61 12 50 12C40 12 33 10 30 6" stroke-width="5"/>
<path d="M32 3.5L45 9.5" stroke="#8d8f85" stroke-width="3"/>
</g>`;
}

/* Dimension line with end ticks. */
function dimension(x1, x2, y) {
  return `<path d="M${x1} ${y}H${x2}M${x1} ${y - 7}V${y + 7}M${x2} ${y - 7}V${y + 7}" stroke="${MUTED}" stroke-width="1.6"/>`;
}

/* ---------- Leash: 1.5 m standard with a fixed handle ---------- */
function standardLeash() {
  const y = 112;
  const loop = `M150 ${y} C112 ${y} 46 ${y - 4} 46 ${y - 34} C46 ${y - 66} 108 ${y - 58} 150 ${y}`;
  return svg(
    "0 0 640 170",
    `${strap(loop)}${strap(`M150 ${y} H548`)}${joint(150, y)}${snapHook(548, y)}${dimension(44, 614, 150)}`,
  );
}

/* ---------- Leash: 2.5 m multifunctional, three configurations ---------- */
function convertible(mode) {
  const y = 118;
  const hookEnd = snapHook(556, y);
  if (mode === "full") {
    // End hook clipped to the first ring: a small handle.
    const loop = `M150 ${y} C112 ${y} 46 ${y - 4} 46 ${y - 34} C46 ${y - 62} 86 ${y - 66} 106 ${y - 50}`;
    return svg(
      "0 0 640 170",
      `${strap(loop)}${strap(`M150 ${y} H556`)}${snapHook(104, y - 50, { angle: 62, scale: 0.85 })}${ring(150, y, { active: true })}${ring(300, y)}${hookEnd}${dimension(44, 622, 156)}`,
    );
  }
  // End hook clipped to the second ring: a larger loop as the handle.
  const loop = `M300 ${y} C230 ${y} 46 ${y + 2} 46 ${y - 42} C46 ${y - 86} 210 ${y - 84} 254 ${y - 52}`;
  return svg(
    "0 0 640 170",
    `${strap(loop)}${strap(`M300 ${y} H556`)}${ring(104, y - 70)}${snapHook(252, y - 52, { angle: 48, scale: 0.85 })}${ring(300, y, { active: true })}${hookEnd}${dimension(44, 622, 156)}`,
  );
}

/* ---------- Hands-free: person with the loop across the body ---------- */
function handsFree() {
  const { dog, person, dogBackLeg } = shapes;
  const dogScale = 0.84;
  const dogX = -46;
  const dogY = 978 - 756 * dogScale;
  const toScene = ([x, y]) => [
    +(x * dogScale + dogX).toFixed(1),
    +(y * dogScale + dogY).toFixed(1),
  ];
  const dogPath = smooth(dog.map(toScene));
  const backLeg = smooth(dogBackLeg.map(toScene));
  const ear = smooth(
    [
      [228, 249],
      [262, 262],
      [292, 292],
      [300, 322],
      [286, 342],
      [264, 334],
      [246, 300],
    ].map(toScene),
  );
  const [eyeX, eyeY] = toScene([178, 272]);
  const [noseX, noseY] = toScene([92, 273]);
  const mouth = smooth(
    [
      [96, 302],
      [132, 318],
      [174, 318],
    ].map(toScene),
    false,
  );
  const collar = smooth(
    [
      [292, 330],
      [240, 368],
      [168, 404],
    ].map(toScene),
    false,
  );
  const [collarRingX, collarRingY] = toScene([268, 352]);

  const body = smooth(person);
  const hair = smooth([
    [604, 50],
    [640, 24],
    [676, 22],
    [703, 38],
    [714, 70],
    [700, 62],
    [668, 52],
    [640, 60],
    [618, 84],
    [612, 118],
    [592, 112],
    [578, 88],
    [584, 62],
  ]);
  const hem = smooth(
    [
      [552, 442],
      [668, 452],
      [784, 444],
    ],
    false,
  );
  const legGap = smooth(
    [
      [668, 600],
      [680, 580],
      [694, 660],
    ],
    false,
  );
  const cup = `<rect x="664" y="262" width="34" height="58" rx="5" fill="#c9a77c" stroke="${INK}" stroke-width="2"/><rect x="660" y="256" width="42" height="12" rx="4" fill="#efe9dd" stroke="${INK}" stroke-width="2"/>`;
  // Clothing is painted inside the traced outline, so edges always match.
  const clothing = `<clipPath id="person"><path d="${body}"/></clipPath>
<g clip-path="url(#person)">
<rect x="500" y="150" width="380" height="302" fill="#5f6152"/>
<path d="M606 160 L688 156 L668 386 L602 386 Z" fill="#e4dacb"/>
<rect x="500" y="0" width="380" height="156" fill="#ecd9c6"/>
<rect x="500" y="452" width="380" height="470" fill="#7b8065"/>
<rect x="500" y="922" width="380" height="80" fill="#e9e6df"/>
<rect x="690" y="880" width="80" height="44" fill="#e9e6df"/>
</g>`;
  const arms = [
    [
      [556, 236],
      [548, 320],
      [552, 396],
      [566, 424],
    ],
    [
      [800, 238],
      [812, 300],
      [818, 340],
    ],
    [
      [818, 340],
      [770, 326],
      [716, 312],
    ],
  ]
    .map(
      (line) =>
        `<path d="${smooth(line, false)}" stroke="${INK}" stroke-width="1.8" opacity=".7"/>`,
    )
    .join("");
  const hands = `<ellipse cx="574" cy="430" rx="15" ry="18" fill="#ecd9c6" stroke="${INK}" stroke-width="1.8"/><ellipse cx="706" cy="300" rx="16" ry="14" fill="#ecd9c6" stroke="${INK}" stroke-width="1.8"/>`;

  // Loop: over the left shoulder, across the chest to the right hip.
  const hipRing = [586, 452];
  const crossbody = `M776 186 C742 250 668 362 ${hipRing[0] + 6} ${hipRing[1] - 8}`;
  const shoulder = `M776 186 C770 168 742 160 724 166`;
  const toDog = `M${hipRing[0] - 4} ${hipRing[1] + 6} C520 560 380 610 ${collarRingX + 24} ${collarRingY - 2}`;

  return svg(
    "0 0 880 1000",
    `<ellipse cx="225" cy="986" rx="190" ry="10" fill="#d9d5ca" opacity=".6"/>
<ellipse cx="690" cy="986" rx="110" ry="10" fill="#d9d5ca" opacity=".6"/>
<path d="${backLeg}" fill="#e2dccf" stroke="${INK}" stroke-width="2.2"/>
<path d="${dogPath}" fill="#efe9dd" stroke="${INK}" stroke-width="2.4"/>
<path d="${ear}" fill="#dccfb7" stroke="${INK}" stroke-width="2"/>
<circle cx="${eyeX}" cy="${eyeY}" r="4.5" fill="${INK}"/>
<ellipse cx="${noseX}" cy="${noseY}" rx="8" ry="6.5" fill="${INK}"/>
<path d="${mouth}" stroke="${INK}" stroke-width="1.8"/>
<path d="${collar}" stroke="#4c513e" stroke-width="12"/><path d="${collar}" stroke="#6d7357" stroke-width="9"/>
<path d="${body}" fill="#ebe7de"/>
${clothing}
<path d="${body}" stroke="${INK}" stroke-width="2.4"/>
<path d="${hair}" fill="#5b5047" stroke="${INK}" stroke-width="2"/>
<path d="${hem}" stroke="${INK}" stroke-width="1.6" opacity=".55"/>
<path d="${legGap}" stroke="${INK}" stroke-width="1.6" opacity=".55"/>
${arms}
${cup}
${hands}
${strap(shoulder, { width: 9 })}
${strap(crossbody, { width: 10 })}
${strap(toDog, { width: 9 })}
${ring(hipRing[0], hipRing[1], { r: 9, active: true })}
${ring(collarRingX, collarRingY, { r: 6 })}
${joint(collarRingX + 16, collarRingY - 1, 12)}`,
  );
}

/* ---------- Elegant leash: wooden ring handle, antique brass hook ---------- */
function elegantLeash() {
  const y = 112;
  const brass = "#9c7b44";
  return svg(
    "0 0 640 196",
    `<circle cx="98" cy="${y}" r="52" stroke="#7a5534" stroke-width="16"/><circle cx="98" cy="${y}" r="52" stroke="#a87c4f" stroke-width="11"/><circle cx="98" cy="${y}" r="52" stroke="#c9a06d" stroke-width="2" stroke-dasharray="10 14" opacity=".7"/>
${strap(`M150 ${y} H548`, { colour: "#4a2f22", edge: "#2f1d15", width: 10 })}
${joint(156, y, 0, brass)}
${snapHook(548, y, { metal: brass })}
${dimension(44, 614, 182)}`,
  );
}

await mkdir(out, { recursive: true });
const files = {
  "leash-standard.svg": standardLeash(),
  "leash-full.svg": convertible("full"),
  "leash-shortened.svg": convertible("shortened"),
  "leash-hands-free.svg": handsFree(),
  "leash-elegant.svg": elegantLeash(),
};
for (const [name, content] of Object.entries(files))
  await writeFile(join(out, name), content);
console.log(Object.keys(files).join(", "));
