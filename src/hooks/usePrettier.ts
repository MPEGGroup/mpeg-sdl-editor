import { useCallback, useRef } from "react";
import prettier from "prettier";
import { prettierPluginSdl } from "@mpeggroup/mpeg-sdl-parser";
import type { ShowToastFunction } from "./useToast.ts";

interface UsePrettierProps {
  code: string;
  setCode: (code: string) => void;
  showToast: ShowToastFunction;
  syntacticErrorCount: number;
}

export function usePrettier(
  { code, setCode, showToast, syntacticErrorCount }: UsePrettierProps,
) {
  const prettifyInProgressRef = useRef(false);

  const handlePrettify = useCallback(async () => {
    if (syntacticErrorCount > 0) {
      showToast("Cannot prettify if parse errors exist", "warning");
      return;
    }

    const options: prettier.Options = {
      parser: "sdl",
      plugins: [prettierPluginSdl],
    };
    try {
      prettifyInProgressRef.current = true;

      const formattedCode = await prettier.format(code, options);

      setCode(formattedCode);

      showToast("Code prettified!", "success", 2000);
      prettifyInProgressRef.current = false;
    } catch (error) {
      prettifyInProgressRef.current = false;
      console.error("Error prettifying code:", error);
      showToast("Error prettifying SDL. See console.", "error");
    }
  }, [code, setCode, showToast, syntacticErrorCount]);

  return { handlePrettify };
}
