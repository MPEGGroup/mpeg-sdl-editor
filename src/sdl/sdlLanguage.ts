import { createLenientSdlParser } from "@mpeggroup/mpeg-sdl-parser";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { sdlComplete } from "./sdlComplete.ts";

export const sdlLanguage = LRLanguage.define({
  parser: createLenientSdlParser(),
  languageData: {
    commentTokens: { line: "//" },
  },
});

export const sdlCompletion = sdlLanguage.data.of({
  autocomplete: sdlComplete,
});

export function sdl(): LanguageSupport {
  return new LanguageSupport(sdlLanguage, [sdlCompletion]);
}
