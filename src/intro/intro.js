import { gsap } from "gsap";
import { createCutout } from "./cutout.js";

export function playIntro(loaderEl, font) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return gsap
      .to(loaderEl, {
        autoAlpha: 0,
        duration: 0.4,
        onComplete: () => loaderEl.remove(),
      })
      .then();
  }

  const leader = loaderEl.querySelector(".leader");
  const count = loaderEl.querySelector(".loader__count");

  const box = leader.getBoundingClientRect();
  const birth = { x: box.left + box.width / 2, y: box.top + box.height / 2 };

  const { group, center, destroy } = createCutout(loaderEl, font);

  const START = 0.02;
  const END = 60;
  const zoom = { progress: 0 };

  const render = () => {
    const scale = START * (END / START) ** zoom.progress;
    group.setAttribute(
      "transform",
      `translate(${birth.x} ${birth.y}) scale(${scale}) translate(${-center.x} ${-center.y})`,
    );
  };

  render();

  return new Promise((resolve) => {
    gsap
      .timeline({
        onUpdate: render,
        onComplete: () => {
          destroy();
          loaderEl.remove();
          resolve();
        },
      })
      .to(leader, { scale: 0, duration: 0.5, ease: "power3.in" })
      .to(count, { autoAlpha: 0, duration: 0.3 }, "<")
      .call(() => loaderEl.classList.add("is-cutout"))
      .to(zoom, { progress: 1, duration: 2.4, ease: "none" })
      .to(
        loaderEl,
        { autoAlpha: 0, duration: 0.5, ease: "power1.in" },
        "-=0.5",
      );
  });
}
