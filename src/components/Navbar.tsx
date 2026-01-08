import React, { useRef } from "react";
import type { Theme } from "../hooks/useTheme.ts";
import { getLogoSvg } from "../logo/getLogoSvg.ts";

const logoSvg = getLogoSvg();

interface NavbarProps {
  theme: Theme;
  onCopy: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleInfo: () => void;
  isInfoShown: boolean;
}

export function Navbar({
  theme,
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
    <div className="navbar bg-base-200 py-2 pl-0 pr-2 min-h-14">
      <div className="flex-1 flex items-center">
        <div
          className="h-6 sm:h-8 md:h-10 w-auto mr-2 -ml-2 [&_svg]:h-6 [&_svg]:sm:h-8 [&_svg]:md:h-10 [&_svg]:w-auto"
          dangerouslySetInnerHTML={{ __html: logoSvg }}
        />
        <h1 className="text-sm sm:text-base md:text-lg font-semibold truncate -ml-3 -mt-1">
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
              title="Copy All"
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
          {
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
          }
        </ul>
      </div>
    </div>
  );
}
