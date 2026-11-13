const BASE = 100;

function measure(font, text) {
  const unit = BASE / font.unitsPerEm;
  const glyphs = [...text].map((char) => font.charToGlyph(char));
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };

  let x = 0;
  let d = "";

  glyphs.forEach((glyph, i) => {
    const path = glyph.getPath(Math.round(x * 100) / 100, 0, BASE);
    const b = path.getBoundingBox();

    d += path.toPathData(2);
    box.x1 = Math.min(box.x1, b.x1);
    box.y1 = Math.min(box.y1, b.y1);
    box.x2 = Math.max(box.x2, b.x2);
    box.y2 = Math.max(box.y2, b.y2);

    const next = glyphs[i + 1];
    x += glyph.advanceWidth * unit;
    if (next) x += font.getKerningValue(glyph, next) * unit;
  });

  return {
    d,
    left: box.x1,
    width: box.x2 - box.x1,
    cap: -box.y1,
  };
}

export function createCutout(root, font) {
  const svg = root.querySelector("[data-cutout]");
  const group = svg.querySelector("[data-cutout-name]");
  const lines = [...group.querySelectorAll("path")];

  const metrics = lines.map((el) => {
    const m = measure(font, el.dataset.line);
    el.setAttribute("d", m.d);
    return m;
  });

  const center = { x: 0, y: 0 };

  function layout() {
    const { width: vw, height: vh } = svg.getBoundingClientRect();

    const target = vw * 0.86;
    const scales = metrics.map((m) => target / m.width);
    const caps = metrics.map((m, i) => m.cap * scales[i]);
    const gap = caps[1] * 0.14;
    const height = caps[0] + gap + caps[1];

    const fit = Math.min(1, (vh * 0.8) / height);

    const left = (vw - target * fit) / 2;
    const top = (vh - height * fit) / 2;
    const baselines = [top + caps[0] * fit, top + height * fit];

    lines.forEach((el, i) => {
      const s = scales[i] * fit;
      const x = left - metrics[i].left * s;
      el.setAttribute(
        "transform",
        `translate(${x} ${baselines[i]}) scale(${s})`,
      );
    });

    center.x = vw / 2;
    center.y = vh / 2;
  }

  layout();
  window.addEventListener("resize", layout);
  const destroy = () => window.removeEventListener("resize", layout);

  return { svg, group, center, layout, destroy };
}
