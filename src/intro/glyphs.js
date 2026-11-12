import { parse } from "opentype.js";
import fontUrl from "@fontsource/anton/files/anton-latin-400-normal.woff?url";

export async function loadGlyphs() {
  const response = await fetch(fontUrl);
  const buffer = await response.arrayBuffer();
  return parse(buffer);
}
