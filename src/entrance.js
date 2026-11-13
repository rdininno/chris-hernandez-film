import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const BLUR = "blur(12px)";

export function createEntrance({ slider }) {
  if (calm) {
    return { play: () => Promise.resolve(), skip: () => {} };
  }

  const name = document.querySelector(".masthead__title");
  const bio = document.querySelector(".masthead__bio");
  const horizon = document.querySelector(".masthead__horizon");
  const title = document.querySelector(".film-title:not([aria-hidden])");
  const heading = title.querySelector(".film-title__text");
  const logline = title.querySelector(".film-title__logline");
  const credits = document.querySelector("[data-film-credits]");
  const rows = [...credits.children];
  const labels = rows.map((row) => row.querySelector("dt"));
  const values = rows.map((row) => row.querySelector("dd"));

  labels.forEach((label) => {
    label.dataset.text = label.textContent;
    label.textContent = "";
  });

  gsap.set(horizon, { scaleX: 0 });
  gsap.set(name, { clipPath: "inset(100% -2% 0% -2%)" });
  gsap.set([bio, logline], { autoAlpha: 0, filter: BLUR });
  gsap.set(heading, { autoAlpha: 0, yPercent: 40, filter: BLUR });
  gsap.set(rows, { "--rule": 0 });
  gsap.set(values, { autoAlpha: 0, y: 8 });

  slider.state.reveal = 0;
  slider.render();

  const tl = gsap.timeline({ paused: true }).timeScale(0.8);

  tl.to(horizon, { scaleX: 1, duration: 0.7, ease: "expo.inOut" })
    .to(
      name,
      {
        clipPath: "inset(-100% -2% 0% -2%)",
        duration: 1.1,
        ease: "expo.out",
        clearProps: "clipPath",
      },
      "-=0.15",
    )
    .set(horizon, { autoAlpha: 0 }, "<")
    .to(
      slider.state,
      {
        reveal: 1,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: slider.render,
      },
      "-=0.55",
    )
    .to(
      bio,
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power2.out",
        clearProps: "filter",
      },
      "-=1",
    )
    .to(
      heading,
      {
        autoAlpha: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        clearProps: "filter",
      },
      "<0.1",
    )
    .to(
      logline,
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power2.out",
        clearProps: "filter",
      },
      "<0.15",
    )
    .addLabel("readout", "<")
    .to(
      rows,
      { "--rule": 1, duration: 0.7, stagger: 0.08, ease: "expo.inOut" },
      "readout",
    );

  labels.forEach((label, i) => {
    tl.to(
      label,
      {
        duration: 0.9,
        scrambleText: {
          text: label.dataset.text,
          chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/",
        },
      },
      `readout+=${0.1 + i * 0.08}`,
    );
  });

  tl.to(
    values,
    { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" },
    "readout+=0.25",
  );

  return {
    play: () => tl.play().then(),
    skip: () => tl.progress(1),
  };
}
