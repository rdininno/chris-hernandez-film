import { gsap } from "gsap";
import { createWord } from "../lettering/word.js";
import "./masthead.css";

export function createMasthead() {
  const title = document.querySelector("[data-logo]");
  const { svg, glyphs } = createWord("CHRIS HERNANDEZ");
  title.append(svg);

  gsap.set(glyphs, { y: -420 });
  const roles = title.closest(".masthead").querySelectorAll(".roles li");
  gsap.set(roles, { y: (i, el) => -el.getBoundingClientRect().bottom - 20 });

  return {
    drop() {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...glyphs, ...roles], { y: 0 });
        return;
      }
      gsap
        .timeline()
        .to(glyphs, { y: 0, duration: 0.9, ease: "bounce.out", stagger: 0.07 })
        .to(
          roles,
          { y: 0, duration: 0.7, ease: "power4.out", stagger: 0.06 },
          "-=0.3",
        );
    },
  };
}
