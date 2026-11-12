import { gsap } from "gsap";
import { preloadImages } from "./preload.js";
import "./loader.css";

export function runLoader({ assets = [], minDuration = 2.4 } = {}) {
  const el = document.querySelector("[data-loader]");
  const countEl = el.querySelector("[data-loader-count]");

  const state = { real: 0, shown: 0 };
  const start = performance.now();

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

      countEl.textContent = Math.round(state.shown * 100);

      if (state.shown === 1) {
        gsap.ticker.remove(tick);
        resolve(el);
      }
    };

    gsap.ticker.add(tick);
  });
}
