const BASE = 100;

function measure(font, text) {
  const path = font.getPath(text, 0, 0, BASE);
  const box = path.getBoundingBox();
  return {
    d: path.toPathData(2),
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
