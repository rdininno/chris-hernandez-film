import { gsap } from "gsap";
import "./titles.css";
import { loopDirection } from "./direction.js";

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createTitles(root, films) {
  const items = films.map((film) => {
    const item = document.createElement("p");
    item.className = "film-title";
    item.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "film-title__text";
    text.textContent = film.title;

    const logline = document.createElement("p");
    logline.className = "film-title__logline";
    logline.textContent = film.logline;

    const inner = document.createElement("div");
    inner.className = "film-title__inner";
    inner.append(text, logline);

    item.append(inner);

    return item;
  });

  root.append(...items);
  gsap.set(items, { yPercent: 100 });

  let current = -1;

  function clip(duration = 0) {
    if (current === -1) return;

    const bottom =
      root.clientHeight - items[current].firstElementChild.offsetHeight;

    gsap.to(root, {
      clipPath: `inset(0px 0px ${bottom}px 0px)`,
      duration,
      ease: "power3.out",
      overwrite: true,
    });
  }

  new ResizeObserver(() => clip()).observe(root);

  function show(index) {
    if (index === current) return;

    const previous = current;
    const incoming = items[index];
    current = index;
    incoming.removeAttribute("aria-hidden");

    if (previous === -1) {
      gsap.set(incoming, { yPercent: 0 });
      clip();
      return;
    }

    const outgoing = items[previous];
    outgoing.setAttribute("aria-hidden", "true");

    const dir = loopDirection(previous, index, items.length);

    const duration = calm ? 0 : 0.7;
    const ease = "power3.out";

    if (Math.abs(gsap.getProperty(incoming, "yPercent")) >= 100) {
      gsap.set(incoming, { yPercent: 100 * dir });
    }

    gsap.to(outgoing, {
      yPercent: -100 * dir,
      duration,
      ease,
      overwrite: true,
    });
    gsap.to(incoming, { yPercent: 0, duration, ease, overwrite: true });

    clip(duration);
  }

  return { show };
}
