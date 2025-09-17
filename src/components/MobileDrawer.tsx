import React from "react";
import type { Theme } from "../hooks/useTheme.ts";

interface MobileDrawerProps {
  theme: Theme;
  isInfoShown: boolean;
  onToggleInfo: () => void;
  children: React.ReactNode;
}

export function MobileDrawer(
  { theme, isInfoShown, onToggleInfo, children }: MobileDrawerProps,
) {
  return (
    <>
      {isInfoShown && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onToggleInfo}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-base-100 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isInfoShown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onToggleInfo}
          className={`absolute top-2 right-2 btn btn-ghost px-2 py-2 z-10 ${
            theme === "dark" ? "hover:bg-gray-500 hover:bg-opacity-20" : ""
          }`}
          title="Close info panel"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="h-full p-4 pt-8 overflow-hidden">
          <div className="overflow-y-auto h-full">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
