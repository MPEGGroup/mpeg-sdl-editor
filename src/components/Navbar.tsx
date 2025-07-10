import React, { useRef } from "react";
import type { Theme } from "../hooks/useTheme";

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onCopy: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleInfo: () => void;
  isInfoShown: boolean;
}

export function Navbar({
  theme,
  onToggleTheme,
  onCopy,
  onSave,
  onLoad,
  onToggleInfo,
  isInfoShown,
}: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="navbar bg-base-200 py-0.5 px-2 min-h-10">
      <div className="flex-1 flex items-center">
        <h1 className="text-sm sm:text-base md:text-lg font-semibold truncate">
          SDL Editor
        </h1>
      </div>
      <div className="flex-none">
        <ul
          className={`menu-horizontal px-0 items-center [&_button]:btn [&_button]:btn-ghost [&_button]:px-2 [&_button]:py-2 [&_label]:px-2 [&_label]:py-2 ${
            theme === "dark"
              ? "[&>li>button]:hover:bg-gray-500 [&>li>button]:hover:bg-opacity-20"
              : ""
          }`}
        >
          <li>
            <button
              type="button"
              onClick={onCopy}
              title="Copy"
              className="[&_svg]:w-6 [&_svg]:h-6"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={onSave}
              title="Save"
              className="[&_svg]:w-6 [&_svg]:h-6"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M19 15V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V15M12 5V15M12 15L10 13M12 15L14 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={handleLoadClick}
              title="Load"
              className="[&_svg]:w-6 [&_svg]:h-6"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M19 15V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V15M12 15L12 5M12 5L14 7M12 5L10 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sdl,text/plain"
              style={{ display: "none" }}
              onChange={onLoad}
            />
          </li>
          <li>
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              className="[&_svg]:w-6 [&_svg]:h-6"
            >
              {theme === "dark"
                ? (
                  <svg
                    className="swap-off w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                  </svg>
                )
                : (
                  <svg
                    className="swap-on w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                  </svg>
                )}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={onToggleInfo}
              title={isInfoShown ? "Close info panel" : "Open info panel"}
              className="[&_svg]:w-6 [&_svg]:h-6"
            >
              {isInfoShown
                ? (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="15"
                      y1="3"
                      x2="15"
                      y2="21"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <rect
                      x="15"
                      y="3"
                      width="6"
                      height="18"
                      fill="currentColor"
                      opacity="0.3"
                    />
                  </svg>
                )
                : (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="15"
                      y1="3"
                      x2="15"
                      y2="21"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
