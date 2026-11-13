import { gsap } from "gsap";

const EASE = 0.1;
const DRAG = 1.2;
const LOCK = 6;
const LINE = 16;

export function createSlider({ root, track, cards }) {
  const state = { target: 0, current: 0 };
  const layout = { step: 0, loop: 0, wrap: (value) => value };
  let drag = null;

  function measure() {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || 0;
    const pad = parseFloat(style.paddingLeft) || 0;
    const previous = layout.loop;

    layout.step = cards[0].offsetWidth + gap;
    layout.loop = layout.step * cards.length;

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

  function tick() {
    const ease = 1 - Math.pow(1 - EASE, gsap.ticker.deltaRatio());
    state.current += (state.target - state.current) * ease;
    if (Math.abs(state.target - state.current) < 0.05)
      state.current = state.target;
    cards.forEach((card, i) => {
      const home = i * layout.step;
      const x = layout.wrap(home - state.current);
      card.style.transform = `translateX(${x - home}px)`;
    });
  }

  measure();
  window.addEventListener("resize", measure);

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
