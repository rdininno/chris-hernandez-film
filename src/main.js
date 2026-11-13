import "./styles/base.css";
import "@fontsource/italiana";
import "@fontsource/work-sans/300.css";
import { runLoader } from "./intro/loader.js";
import { playIntro } from "./intro/intro.js";
import { loadGlyphs } from "./intro/glyphs.js";
import "./masthead/masthead.css";
import { films } from "./films/films.js";
import { createFilmRow } from "./films/row.js";
import { createSlider } from "./films/slider.js";
import { createTitles } from "./films/titles.js";
import { createCredits } from "./films/credits.js";
import { createEntrance } from "./entrance.js";

const row = createFilmRow(document.querySelector("[data-films]"), films);
const titles = createTitles(
  document.querySelector("[data-film-titles]"),
  films,
);
const credits = createCredits(
  document.querySelector("[data-film-credits]"),
  films,
);
const slider = createSlider(row, {
  onActive: (index) => {
    titles.show(index);
    credits.show(index);
  },
});
const entrance = createEntrance({ slider });

async function init() {
  const glyphs = loadGlyphs();
  const loaderEl = await runLoader({
    images: films.slice(0, 3).map((film) => film.image),
    fonts: ["400 1em Italiana", '300 1em "Work Sans"', '400 1em "Space Mono"'],
    tasks: [glyphs.catch(() => {})],
  });
  await playIntro(loaderEl, await glyphs);
  await entrance.play();
  slider.start();
}

init().catch((error) => {
  console.error(error);
  document.querySelector("[data-loader]")?.remove();
  entrance.skip();
  slider.start();
});
