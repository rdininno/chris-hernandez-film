import "./styles/base.css";
import "@fontsource/anton";
import { runLoader } from "./intro/loader.js";

async function init() {
  const loaderEl = await runLoader({
    minDuration: 4,
    steps: 5,
    fonts: ["400 1em Anton"],
  });
  console.log("loader done", loaderEl);
}

init();
