import "./styles/base.css";
import "@fontsource/anton";
import { runLoader } from "./intro/loader.js";
import { playIntro } from "./intro/intro.js";
import { loadGlyphs } from "./intro/glyphs.js";

async function init() {
  const glyphs = loadGlyphs();
  const loaderEl = await runLoader({
    fonts: ["400 1em Anton"],
    tasks: [glyphs.catch(() => {})],
  });
  await playIntro(loaderEl, await glyphs);
}

init();
