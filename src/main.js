import "./styles/base.css";
import "@fontsource/anton";
import "@fontsource/cormorant-garamond/300-italic.css";
import { runLoader } from "./intro/loader.js";
import { playIntro } from "./intro/intro.js";
import { loadGlyphs } from "./intro/glyphs.js";
import "./masthead/masthead.css";

async function init() {
  const glyphs = loadGlyphs();
  const loaderEl = await runLoader({
    fonts: ["400 1em Anton", 'italic 300 1em "Cormorant Garamond"'],
    tasks: [glyphs.catch(() => {})],
  });
  await playIntro(loaderEl, await glyphs);
}

init().catch((error) => {
  console.error(error);
  document.querySelector("[data-loader]")?.remove();
});
