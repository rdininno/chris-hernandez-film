import "./styles/base.css";
import "@fontsource/anton";
import "@fontsource/cormorant-garamond/600.css";
import { runLoader } from "./intro/loader.js";
import { playIntro } from "./intro/intro.js";
import { loadGlyphs } from "./intro/glyphs.js";
import { createMasthead } from "./masthead/masthead.js";

const masthead = createMasthead();

async function init() {
  const glyphs = loadGlyphs();
  const loaderEl = await runLoader({
    fonts: ["400 1em Anton", '600 1em "Cormorant Garamond"'],
    tasks: [glyphs.catch(() => {})],
  });
  await playIntro(loaderEl, await glyphs);
  masthead.drop();
}

init().catch((error) => {
  console.error(error);
  document.querySelector("[data-loader]")?.remove();
  masthead.drop();
});
