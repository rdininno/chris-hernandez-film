import { parse } from "opentype.js";
import antonUrl from "@fontsource/anton/files/anton-latin-400-normal.woff?url";

export async function loadGlyphs() {
  const response = await fetch(antonUrl);
  const buffer = await response.arrayBuffer();
  return parse(buffer);
}
