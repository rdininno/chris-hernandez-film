import { gsap } from "gsap";

const EASE = 0.1;
const DRAG = 1.2;
const LOCK = 6;
const LINE = 16;
const MIN_HEIGHT = 0.7;
const SETTLE = 0.08;
const MAX_SPEED = 30;
const REST_ZOOM = 1.12;
const SPREAD = 0.05;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

function heightAt(distance) {
  const t = Math.min(distance, 1);
  const curve = (1 + Math.cos(Math.PI * t)) / 2;
  return MIN_HEIGHT + (1 - MIN_HEIGHT) * curve;
}

export function createSlider({ root, track, cards }) {
  const state = { target: 0, current: 0, speed: 0 };
  const layout = {
    step: 0,
    loop: 0,
    pad: 0,
    half: 0,
    center: 0,
    wrap: (value) => value,
  };
  const frames = cards.map((card) => card.querySelector(".film-card__frame"));
  const images = cards.map((card) => card.querySelector(".film-card__image"));
  let drag = null;

  function measure() {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || 0;
    const pad = parseFloat(style.paddingLeft) || 0;
    const previous = layout.loop;

    layout.step = cards[0].offsetWidth + gap;
    layout.loop = layout.step * cards.length;
    layout.pad = pad;
    layout.half = cards[0].offsetWidth / 2;
    layout.center = root.clientWidth / 2;

    const min = -(layout.step + pad);
    layout.wrap = gsap.utils.wrap(min, min + layout.loop);

    if (previous) {
      const ratio = layout.loop / previous;
      state.current *= ratio;
      state.target *= ratio;
    }
  }
  function onWheel(e) {
    e.preventDefault();
    const unit =
      e.deltaMode === 1 ? LINE : e.deltaMode === 2 ? root.clientWidth : 1;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    state.target += delta * unit;
  }

  function onDown(e) {
    if (e.button !== 0) return;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      start: state.target,
      axis: null,
    };
    root.setPointerCapture(e.pointerId);
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;

    if (!drag.axis) {
      if (Math.hypot(dx, dy) < LOCK) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      root.classList.add("is-dragging");
    }

    const delta = drag.axis === "x" ? dx : dy;
    state.target = drag.start - delta * DRAG;
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    root.classList.remove("is-dragging");
  }

  function render() {
    const amount = calm ? 0 : Math.min(state.speed / MAX_SPEED, 1);
    const spread = 1 + amount * SPREAD;
    const zoom = REST_ZOOM - (REST_ZOOM - 1) * amount;

    cards.forEach((card, i) => {
      const home = i * layout.step;
      const x = layout.wrap(home - state.current);
      const middle =
        layout.center + (layout.pad + x + layout.half - layout.center) * spread;
      card.style.transform = `translateX(${middle - layout.half - layout.pad - home}px)`;

      const distance = Math.abs(middle - layout.center) / layout.center;
      const crop = (1 - heightAt(distance)) * 100;
      frames[i].style.clipPath = `inset(${crop}% 0 0 0)`;
      images[i].style.transform = `scale(${zoom})`;
    });
  }

  function tick() {
    const ratio = gsap.ticker.deltaRatio();
    const previous = state.current;

    state.current +=
      (state.target - state.current) * (1 - Math.pow(1 - EASE, ratio));
    if (Math.abs(state.target - state.current) < 0.05)
      state.current = state.target;

    const velocity = Math.abs(state.current - previous) / ratio;
    state.speed += (velocity - state.speed) * (1 - Math.pow(1 - SETTLE, ratio));

    render();
  }

  measure();
  state.current = state.target = layout.pad + layout.half - layout.center;
  render();

  window.addEventListener("resize", () => {
    measure();
    render();
  });

  return {
    state,
    start() {
      window.addEventListener("wheel", onWheel, { passive: false });
      root.addEventListener("pointerdown", onDown);
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerup", onUp);
      root.addEventListener("pointercancel", onUp);
      root.addEventListener("dragstart", (e) => e.preventDefault());
      gsap.ticker.add(tick);
    },
  };
}
