import { useCallback, useState } from "react";
import type { ShowToastFunction } from "./useToast.ts";

interface UseFileOperationsProps {
  initialCode: string;
  showToast: ShowToastFunction;
}

export function useFileOperations(
  { initialCode, showToast }: UseFileOperationsProps,
) {
  const [code, setCode] = useState<string>(initialCode);

  const handleSave = useCallback(async () => {
    try {
      if (globalThis.window.showSaveFilePicker) {
        const fileHandle = await globalThis.window.showSaveFilePicker({
          suggestedName: "specification.sdl",
          types: [
            {
              description: "SDL Files",
              accept: {
                "text/plain": [".sdl"],
              },
            },
          ],
        });
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(code);
        await writableStream.close();
        showToast("File saved successfully!");
      } else {
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "specification.sdl";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("File downloaded successfully!");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        showToast("File save cancelled.");
      } else {
        console.error("Error saving file:", err);
        showToast("Error saving file. See console.", "error");
      }
    }
  }, [code, showToast]);

  const handleLoad = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            setCode(text);
            showToast("File loaded successfully!");
          }
        };
        reader.onerror = () => {
          showToast("Error loading file.");
        };
        reader.readAsText(file);
      }
    },
    [showToast],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showToast("Failed to copy content. See console.", "error");
    }
  }, [code, showToast]);

  return {
    code,
    setCode,
    handleSave,
    handleLoad,
    handleCopy,
  };
}
