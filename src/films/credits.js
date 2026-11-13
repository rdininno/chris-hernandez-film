import { gsap } from "gsap";
import { loopDirection } from "./direction.js";
import "./credits.css";

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

const NBSP = "\u00a0";

function keepTogether(name) {
  return name
    .split(" (")
    .map((part) => part.replaceAll(" ", NBSP))
    .join(" (");
}

function rowsFor(film) {
  const cut = film.byline.lastIndexOf(" by ");
  return [
    ["Year / Runtime", `${film.year} · ${film.runtime}`],
    [film.byline.slice(0, cut + 3), keepTogether(film.byline.slice(cut + 4))],
    ["Cast", film.cast.map((person) => keepTogether(person.name)).join(", ")],
    [
      "Crew",
      film.crew
        .map((member) => `${keepTogether(member.name)} (${member.job})`)
        .join(", "),
    ],
  ];
}

function build(film) {
  return rowsFor(film).map(([label, value]) => {
    const row = document.createElement("div");
    row.className = "credits__row";

    const term = document.createElement("dt");
    term.textContent = label;

    const detail = document.createElement("dd");
    detail.textContent = value;

    row.append(term, detail);
    return row;
  });
}

export function createCredits(root, films) {
  let current = -1;
  let timeline = null;

  function show(index) {
    if (index === current) return;
    const previous = current;
    current = index;
    const rows = build(films[index]);

    if (previous === -1 || calm) {
      root.replaceChildren(...rows);
      return;
    }

    const dir = loopDirection(previous, index, films.length);
    timeline?.kill();

    timeline = gsap
      .timeline()
      .to([...root.children], {
        autoAlpha: 0,
        y: -8 * dir,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in",
      })
      .call(() => root.replaceChildren(...rows))
      .from(rows, {
        autoAlpha: 0,
        y: 8 * dir,
        duration: 0.45,
        stagger: 0.04,
        ease: "power3.out",
      });
  }

  return { show };
}
