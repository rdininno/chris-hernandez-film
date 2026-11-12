import { gsap } from "gsap";
import { createWord } from "../lettering/word.js";
import "./masthead.css";

export function createMasthead() {
  const title = document.querySelector("[data-logo]");
  const { svg, glyphs } = createWord("CHRIS HERNANDEZ");
  title.append(svg);

  gsap.set(glyphs, { y: -420 });

  return {
    drop() {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(glyphs, { y: 0 });
        return;
      }
      gsap.to(glyphs, {
        y: 0,
        duration: 0.9,
        ease: "bounce.out",
        stagger: 0.07,
      });
    },
  };
}
