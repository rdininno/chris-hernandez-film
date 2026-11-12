import "./styles/base.css";
import { runLoader } from "./intro/loader.js";

async function init() {
  const loaderEl = await runLoader({ minDuration: 4, steps: 5 });
  console.log("loader done", loaderEl);
}

init();
