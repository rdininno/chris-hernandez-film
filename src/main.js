import "./styles/base.css";
import "@fontsource/anton";
import { runLoader } from "./intro/loader.js";
import { createCutout } from "./intro/cutout.js";

async function init() {
  const loaderEl = await runLoader({
    minDuration: 4,
    steps: 5,
    fonts: ["400 1em Anton"],
  });

  createCutout(loaderEl);
  loaderEl.classList.add("is-cutout");
}

init();
