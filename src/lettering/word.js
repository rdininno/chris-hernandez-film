import { CAP, buildCaps } from "./caps.js";

const NS = "http://www.w3.org/2000/svg";
let count = 0;

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

export function createWord(
  text,
  { weight = 38, inline = 4, tracking = 4, space = 56 } = {},
) {
  const set = buildCaps(weight);
  const prefix = `word-${count++}`;
  const svg = svgEl("svg", { "aria-hidden": "true" });
  const defs = svgEl("defs");
  svg.append(defs);

  const glyphs = [];
  let x = 0;

  [...text].forEach((char, i) => {
    if (char === " ") {
      x += space;
      return;
    }

    const glyph = set[char];
    const clipId = `${prefix}-clip-${i}`;
    const clip = svgEl("clipPath", { id: clipId });
    clip.append(svgEl("rect", { width: glyph.adv, height: CAP }));
    defs.append(clip);

    const slot = svgEl("g", { transform: `translate(${x} 0)` });
    const letter = svgEl("g", {
      class: "glyph",
      "clip-path": `url(#${clipId})`,
    });
    const shared = { d: glyph.d, fill: "none", "stroke-miterlimit": 20 };

    letter.append(
      svgEl("path", {
        ...shared,
        class: "glyph__body",
        "stroke-width": weight,
      }),
      svgEl("path", {
        ...shared,
        class: "glyph__inline",
        "stroke-width": inline,
      }),
    );
    slot.append(letter);
    svg.append(slot);
    glyphs.push(letter);

    x += glyph.adv + tracking;
  });

  const width = x - tracking;
  svg.setAttribute("viewBox", `0 0 ${width} ${CAP}`);

  return { svg, glyphs };
}
