import { gsap } from "gsap";
import { preloadImages } from "./preload.js";
import "./loader.css";

export function runLoader({ assets = [], minDuration = 2.4, steps = 8 } = {}) {
  const el = document.querySelector("[data-loader]");
  const countEl = el.querySelector("[data-loader-count]");
  const sweepEl = el.querySelector("[data-leader-sweep]");
  const numberEl = el.querySelector("[data-leader-number]");

  const state = { real: 0, shown: 0 };
  const start = performance.now();

  let lastNumber = null;

  const render = (progress) => {
    const p = progress * steps;
    const index = Math.min(Math.floor(p), steps - 1);
    const sweep = progress === 1 ? 1 : p - Math.floor(p);
    const number = steps - index;

    sweepEl.style.setProperty("--sweep", sweep);

    if (number !== lastNumber) {
      numberEl.textContent = number;
      lastNumber = number;
    }

    countEl.textContent = Math.round(progress * 100);
  };

  return new Promise((resolve) => {
    preloadImages(assets, (p) => {
      state.real = p;
    });

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const timeCap = Math.min(elapsed / minDuration, 1);
      const target = Math.min(state.real, timeCap);

      const ease = 1 - Math.pow(0.9, gsap.ticker.deltaRatio());
      state.shown += (target - state.shown) * ease;

      if (target === 1 && state.shown > 0.995) state.shown = 1;

      render(state.shown);

      if (state.shown === 1) {
        gsap.ticker.remove(tick);
        resolve(el);
      }
    };

    gsap.ticker.add(tick);
  });
}
