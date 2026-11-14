import { gsap } from "gsap";
import "./stage.css";

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "expo.inOut";
const time = (seconds) => (calm ? 0 : seconds);

export function createStage({ slider, films }) {
  const app = document.getElementById("app");
  const lights = app.querySelector("[data-lights]");
  const closeButton = app.querySelector("[data-stage-close]");
  const screen = app.querySelector("[data-screen]");
  const still = screen.querySelector(".screen__still");
  const playerSlot = screen.querySelector(".screen__player");
  let isOpen = false;
  let tl = null;

  function cardShape(rect) {
    return {
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      clipPath: `inset(${rect.crop * 100}% 0% 0% 0%)`,
    };
  }

  function playerShape() {
    const p = slider.layout.player;
    return {
      left: p.x,
      top: p.y,
      width: p.w,
      height: p.h,
      clipPath: "inset(0% 0% 0% 0%)",
    };
  }

  function loadVideo(film) {
    const iframe = document.createElement("iframe");
    const params = new URLSearchParams({
      autoplay: 1,
      controls: 1,
      rel: 0,
      playsinline: 1,
      iv_load_policy: 3,
    });
    iframe.src = `https://www.youtube-nocookie.com/embed/${film.youtubeId}?${params}`;
    iframe.title = film.title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.addEventListener(
      "load",
      () => {
        gsap.to(still, { autoAlpha: 0, duration: time(0.6), delay: time(0.3) });
      },
      { once: true },
    );
    playerSlot.replaceChildren(iframe);
  }

  function open(index) {
    if (isOpen) return;
    isOpen = true;
    const film = films[index];
    const rect = slider.cardRect(index);

    slider.lock(true);
    slider.state.selected = index;
    still.src = film.image;
    gsap.set(still, { autoAlpha: 1, scale: rect.scale });
    gsap.set(screen, { autoAlpha: 1, ...cardShape(rect) });
    app.classList.add("is-staged");
    document.addEventListener("keydown", onKey);

    tl?.kill();
    tl = gsap
      .timeline({ defaults: { duration: time(1.1), ease: EASE } })
      .to(slider.state, { open: 1 }, 0)
      .to(screen, playerShape(), 0)
      .to(still, { scale: 1 }, 0)
      .call(() => loadVideo(film));

    closeButton.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    const rect = slider.cardRect(slider.state.selected);
    app.classList.remove("is-staged");
    document.removeEventListener("keydown", onKey);

    tl?.kill();
    tl = gsap
      .timeline({ defaults: { ease: EASE } })
      .to(still, { autoAlpha: 1, duration: time(0.25), ease: "power1.out" })
      .call(() => playerSlot.replaceChildren())
      .to(slider.state, { open: 0, duration: time(0.9) })
      .to(screen, { ...cardShape(rect), duration: time(0.9) }, "<")
      .to(still, { scale: rect.scale, duration: time(0.9) }, "<")
      .set(screen, { autoAlpha: 0 })
      .call(() => slider.lock(false));
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  closeButton.addEventListener("click", close);
  lights.addEventListener("click", close);
  window.addEventListener("resize", () => {
    if (isOpen) gsap.set(screen, playerShape());
  });

  return { open, close };
}
