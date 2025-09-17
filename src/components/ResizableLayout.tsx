import React, { useCallback, useRef, useState } from "react";
import { useDragResize } from "../hooks/useDragResize.ts";
import { MobileDrawer } from "./MobileDrawer.tsx";
import { DesktopPanels } from "./DesktopPanels.tsx";
import type { Theme } from "../hooks/useTheme.ts";

interface ResizableLayoutProps {
  children: [React.ReactNode, React.ReactNode];
  theme: Theme;
  isInfoShown: boolean;
  isMobile: boolean;
  onToggleInfo: () => void;
}

export function ResizableLayout({
  children,
  theme,
  isInfoShown,
  isMobile,
  onToggleInfo,
}: ResizableLayoutProps) {
  const minLeftWidth = 400;
  const minRightWidth = 300;
  const [splitPercentage, setSplitPercentage] = useState(70);
  const containerRef = useRef<HTMLDivElement>(null);

  const onSplitPercentageChange = useCallback((percentage: number) => {
    setSplitPercentage(percentage);
  }, []);

  const { isDragging, handleMouseDown } = useDragResize({
    containerRef,
    minLeftWidth,
    minRightWidth,
    isInfoShown,
    onSplitPercentageChange,
  });

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {isMobile
        ? (
          <>
            <div className="flex flex-col w-full">
              {children[0]}
            </div>

            <MobileDrawer
              theme={theme}
              isInfoShown={isInfoShown}
              onToggleInfo={onToggleInfo}
            >
              {children[1]}
            </MobileDrawer>
          </>
        )
        : (
          <DesktopPanels
            leftChild={children[0]}
            _rightChild={children[1]}
            splitPercentage={splitPercentage}
            isInfoShown={isInfoShown}
            _isDragging={isDragging}
            _onMouseDown={handleMouseDown}
          />
        )}
    </div>
  );
}
