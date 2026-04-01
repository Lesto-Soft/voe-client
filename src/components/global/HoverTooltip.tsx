import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
  delayDuration?: number;
  sideOffset?: number;
  contentClassName?: string;
  arrowClassName?: string;
  wrapperClassName?: string;
}

export default function HoverTooltip({
  children,
  content,
  delayDuration = 0,
  sideOffset = 5,
  contentClassName = "z-50 max-w-xs rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg",
  arrowClassName = "fill-gray-800",
  wrapperClassName = "inline-flex",
}: HoverTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - sideOffset,
        left: rect.left + rect.width / 2,
      });
    }
  }, [sideOffset]);

  const handleMouseEnter = useCallback(() => {
    if (delayDuration > 0) {
      delayRef.current = setTimeout(() => {
        setVisible(true);
        updatePosition();
      }, delayDuration);
    } else {
      setVisible(true);
      updatePosition();
    }
  }, [delayDuration, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const update = () => updatePosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [visible, updatePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={wrapperClassName}
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            className={contentClassName}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            {content}
            <svg
              width="10"
              height="5"
              viewBox="0 0 10 5"
              className={arrowClassName}
              style={{
                position: "absolute",
                bottom: "-5px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <polygon points="0,0 5,5 10,0" />
            </svg>
          </div>,
          document.body
        )}
    </>
  );
}
