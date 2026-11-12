import "./styles/base.css";
import { runLoader } from "./intro/loader.js";

async function init() {
  const loaderEl = await runLoader();
  console.log("loader done", loaderEl);
}

init();
