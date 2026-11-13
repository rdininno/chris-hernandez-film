import { gsap } from "gsap";
import { loopOffset } from "./direction.js";

const EASE = 0.1;
const DRAG = 1.2;
const LOCK = 6;
const LINE = 16;
const WHEEL = 0.5;
const MAX_WHEEL = 60;
const MIN_HEIGHT = 0.7;
const SETTLE = 0.08;
const MAX_SPEED = 30;
const REST_ZOOM = 1.12;
const GAP_GROW = 1;
const PLAYER_WIDTH = 0.6;
const PLAYER_CENTER = 0.6;
const SLIVER = 0.012;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

function heightAt(distance) {
  const t = Math.min(distance, 1);
  const curve = (1 + Math.cos(Math.PI * t)) / 2;
  return MIN_HEIGHT + (1 - MIN_HEIGHT) * curve;
}

const riseEase = gsap.parseEase("back.out(1.4)");

export function createSlider(
  { root, track, cards },
  { onActive, onOpen } = {},
) {
  const state = {
    target: 0,
    current: 0,
    speed: 0,
    active: -1,
    reveal: 1,
    open: 0,
    selected: -1,
    locked: false,
  };
  const layout = {
    step: 0,
    loop: 0,
    pad: 0,
    gap: 0,
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
    layout.gap = gap;
    layout.half = cards[0].offsetWidth / 2;
    layout.center = root.clientWidth / 2;

    const min = -(layout.step + pad);
    layout.wrap = gsap.utils.wrap(min, min + layout.loop);

    if (previous) {
      const ratio = layout.loop / previous;
      state.current *= ratio;
      state.target *= ratio;
    }

    const vw = root.clientWidth;
    const vh = window.innerHeight;
    const playerW = Math.min(vw * PLAYER_WIDTH, vh * 0.56 * (16 / 9));
    const playerH = playerW * (9 / 16);

    layout.player = {
      x: (vw - playerW) / 2,
      y: vh * PLAYER_CENTER - playerH / 2,
      w: playerW,
      h: playerH,
    };
    layout.vw = vw;
    layout.sliver = vw * SLIVER;
  }

  function onWheel(e) {
    e.preventDefault();
    if (state.locked) return;

    const unit =
      e.deltaMode === 1 ? LINE : e.deltaMode === 2 ? root.clientWidth : 1;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    state.target +=
      gsap.utils.clamp(-MAX_WHEEL, MAX_WHEEL, delta * unit) * WHEEL;
  }

  function onDown(e) {
    if (state.locked) return;
    if (e.button !== 0) return;

    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      start: state.target,
      axis: null,
      card: e.target.closest(".film-card"),
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
    const tapped = drag.axis ? null : drag.card;
    drag = null;
    root.classList.remove("is-dragging");
    if (tapped) select(cards.indexOf(tapped));
  }

  function select(i) {
    if (i === state.active) {
      onOpen?.(i);
      return;
    }
    const home = i * layout.step;
    const x = layout.wrap(home - state.current);
    state.target =
      state.current + (layout.pad + x + layout.half - layout.center);
  }

  function render() {
    const amount = calm ? 0 : Math.min(state.speed / MAX_SPEED, 1);
    const spread = 1 + amount * GAP_GROW * (layout.gap / layout.step);
    const zoom = REST_ZOOM - (REST_ZOOM - 1) * amount;
    const { open } = state;
    const count = cards.length;

    const middles = cards.map((card, i) => {
      const x = layout.wrap(i * layout.step - state.current);
      return (
        layout.center + (layout.pad + x + layout.half - layout.center) * spread
      );
    });

    let nearest = 0;
    let best = Infinity;

    cards.forEach((card, i) => {
      const home = i * layout.step;
      let middle = middles[i];
      const rowDistance = Math.abs(middle - layout.center) / layout.center;

      if (rowDistance < best) {
        best = rowDistance;
        nearest = i;
      }

      const k = open > 0 ? loopOffset(state.selected, i, count) : null;
      let alpha = 1;

      if (k === 0) alpha = 1 - open;
      if (k === 1 || k === -1) {
        const outer = middles[(state.selected + 2 * k + count) % count];
        middle = gsap.utils.interpolate(
          middle,
          outer + k * layout.sliver,
          open,
        );
      }

      const distance = Math.abs(middle - layout.center) / layout.center;
      const local = gsap.utils.clamp(
        0,
        1,
        (state.reveal - Math.min(distance, 1) * 0.5) / 0.5,
      );
      const crop = 1 - heightAt(distance) * riseEase(local);

      card.style.transform = `translateX(${middle - layout.half - layout.pad - home}px)`;
      card.style.opacity = alpha;
      card.style.zIndex = k === 1 || k === -1 ? "1" : "";
      frames[i].style.clipPath = `inset(${crop * 100}% 0 0 0)`;
      images[i].style.transform = `scale(${zoom + (1 - local) * 0.35})`;
    });

    if (nearest !== state.active) {
      state.active = nearest;
      onActive?.(nearest);
    }
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
    render,
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
    lock(value) {
      state.locked = value;
      if (value) state.target = state.current;
    },
  };
}
