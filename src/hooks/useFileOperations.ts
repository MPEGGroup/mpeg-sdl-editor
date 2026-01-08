import { useCallback } from "react";
import type { ShowToastFunction } from "./useToast.ts";
import type { EditorRef } from "../components/Editor.tsx";

interface UseFileOperationsProps {
  code: string;
  setCode: (code: string) => void;
  showToast: ShowToastFunction;
  editorRef: React.RefObject<EditorRef | null>;
}

export function useFileOperations(
  { code, setCode, showToast, editorRef }: UseFileOperationsProps,
) {
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
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
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
          }
        };
        reader.onerror = () => {
          showToast("Error loading file.", "error");
        };
        reader.readAsText(file);
      }
    },
    [showToast],
  );

  const handleCopy = useCallback(async () => {
    try {
      const clipboardItems: Record<string, Blob> = {
        "text/plain": new Blob([code], { type: "text/plain" }),
      };

      if (editorRef.current?.getStyledCode) {
        const styledCode = editorRef.current.getStyledCode();

        clipboardItems["text/html"] = new Blob([styledCode], {
          type: "text/html",
        });
      }

      const clipboardItem = new ClipboardItem(clipboardItems);

      await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
      console.error("Failed to copy content: ", err);
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
