const BASE = 100;
const ctx = document.createElement("canvas").getContext("2d");

function measure(text, font) {
  ctx.font = font;
  const m = ctx.measureText(text);
  return {
    left: m.actualBoundingBoxLeft,
    width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    cap: m.actualBoundingBoxAscent,
  };
}

export function createCutout(root) {
  const svg = root.querySelector("[data-cutout]");
  const group = svg.querySelector("[data-cutout-name]");
  const lines = [...group.querySelectorAll("text")];

  const style = getComputedStyle(lines[0]);
  const font = `${style.fontWeight} ${BASE}px ${style.fontFamily}`;
  const metrics = lines.map((el) => measure(el.textContent, font));

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
      el.setAttribute("font-size", BASE * s);
      el.setAttribute("x", left + metrics[i].left * s);
      el.setAttribute("y", baselines[i]);
    });
  }

  layout();
  window.addEventListener("resize", layout);

  return { svg, group, layout };
}
