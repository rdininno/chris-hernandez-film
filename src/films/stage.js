import { gsap } from "gsap";
import "./stage.css";

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createStage({ slider }) {
  const app = document.getElementById("app");
  const lights = app.querySelector("[data-lights]");
  const closeButton = app.querySelector("[data-stage-close]");
  let isOpen = false;

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  function open(index) {
    if (isOpen) return;
    isOpen = true;
    slider.lock(true);
    slider.state.selected = index;
    app.classList.add("is-staged");
    document.addEventListener("keydown", onKey);
    gsap.to(slider.state, {
      open: 1,
      duration: calm ? 0 : 1.1,
      ease: "expo.inOut",
      overwrite: true,
    });
    closeButton.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    app.classList.remove("is-staged");
    document.removeEventListener("keydown", onKey);
    gsap.to(slider.state, {
      open: 0,
      duration: calm ? 0 : 0.9,
      ease: "expo.inOut",
      overwrite: true,
      onComplete: () => slider.lock(false),
    });
  }

  closeButton.addEventListener("click", close);
  lights.addEventListener("click", close);

  return { open, close };
}
