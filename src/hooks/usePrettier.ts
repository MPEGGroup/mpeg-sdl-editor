import { useCallback, useRef } from "react";
import prettier from "prettier";
import { prettierPluginSdl } from "@mpeggroup/mpeg-sdl-parser";
import type { ShowToastFunction } from "./useToast.ts";

interface UsePrettierProps {
  code: string;
  setCode: (code: string) => void;
  showToast: ShowToastFunction;
  syntacticErrorCount: number;
  rulerWidth: number;
}

export function usePrettier(
  { code, setCode, showToast, syntacticErrorCount, rulerWidth }: UsePrettierProps,
) {
  const prettifyInProgressRef = useRef(false);

  const handlePrettify = useCallback(async () => {
    const options: prettier.Options = {
      parser: "sdl",
      plugins: [prettierPluginSdl],
      printWidth: rulerWidth,
    };
    try {
      prettifyInProgressRef.current = true;

      const formattedCode = await prettier.format(code, options);

      setCode(formattedCode);

      prettifyInProgressRef.current = false;
    } catch (error) {
      prettifyInProgressRef.current = false;
      console.error("Error prettifying code:", error);
      showToast("Error prettifying SDL. See console.", "error");
    }
  }, [code, setCode, showToast, syntacticErrorCount, rulerWidth]);

  return { handlePrettify };
}
