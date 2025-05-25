// src/components/cards/StatCard.tsx
import React, { useState, useEffect, useRef } from "react";

interface Props {
  amount: number | string;
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  isLoading?: boolean;
  expectsOutOfTextFormat?: boolean; // New prop
}

const MIN_SKELETON_TIME = 250;

const StatCard: React.FC<Props> = ({
  amount,
  title,
  icon: IconComponent,
  iconColor = "text-gray-500",
  onClick,
  className = "",
  isActive = false,
  isLoading = false,
  expectsOutOfTextFormat = false, // Default to false
}) => {
  const [displayAsLoading, setDisplayAsLoading] = useState(isLoading);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setDisplayAsLoading(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      if (displayAsLoading) {
        timerRef.current = window.setTimeout(() => {
          setDisplayAsLoading(false);
          timerRef.current = null;
        }, MIN_SKELETON_TIME);
      } else {
        setDisplayAsLoading(false);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, displayAsLoading]);

  const baseClasses =
    "flex items-center space-x-3 sm:space-x-4 rounded-lg border p-3 shadow-sm transition-all duration-150 ease-in-out"; // Removed min-width
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md" // active:scale-[0.98] "
    : "";
  const activeClasses = isActive
    ? "bg-white border-sky-500 border-2 ring-2 ring-sky-200 shadow-lg" // scale-[1.02]"
    : "bg-gray-50 border-gray-200 border-2 hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200";

  const titleColorFinal = isActive
    ? "text-sky-700 font-semibold"
    : "text-gray-500";
  const amountColorFinal = isActive ? "text-sky-800" : "text-gray-700";
  const finalIconColor = isActive ? iconColor : `${iconColor} opacity-80`;

  const isFormattedString =
    typeof amount === "string" && /\(от\s.*\)/.test(amount);
  let mainAmount: string | number = amount;
  let outOfText: string | null = null;

  if (isFormattedString) {
    const match = amount.match(/(.*)\s*\(от\s+(.*)\)/);
    if (match && match[1] && match[2]) {
      mainAmount = match[1].trim();
      outOfText = `(от ${match[2].trim()})`;
    } else {
      mainAmount = amount; // Fallback if regex matches but capturing fails
      outOfText = null;
    }
  }

  const isAmountConsideredLarge =
    (typeof mainAmount === "string" &&
      mainAmount.length > 3 &&
      !isFormattedString) ||
    (typeof mainAmount === "number" && mainAmount > 999) ||
    isFormattedString;

  const amountTextClass = isAmountConsideredLarge ? "text-xl" : "text-2xl";
  // For text-xl line height (h-7) & text-2xl line height (h-8) - Tailwind's default line heights might lead to these heights
  const amountDisplayAreaHeightClass = isAmountConsideredLarge ? "h-7" : "h-8";

  const mainAmountFinalClasses = `font-bold ${amountColorFinal} ${amountTextClass}`;
  const skeletonWidthClass = isAmountConsideredLarge ? "w-12" : "w-10"; // For single amount skeleton

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`} // className from props controls width
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <IconComponent
        className={`h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 ${finalIconColor}`}
        aria-hidden="true"
      />
      <div className="overflow-hidden flex-grow">
        <p className={`truncate text-xs font-medium ${titleColorFinal}`}>
          {title}
        </p>
        <div className="flex items-end space-x-1">
          {/* This div wrapper ensures the main amount or its skeleton maintains a consistent height */}
          <div className={`flex items-center ${amountDisplayAreaHeightClass}`}>
            {displayAsLoading ? (
              expectsOutOfTextFormat ? (
                <div className="flex items-baseline space-x-1 py-px">
                  {" "}
                  {/* py-px to help baseline alignment if needed */}
                  <div className="animate-pulse bg-gray-300 rounded-md h-5 w-10 sm:h-[22px] sm:w-12"></div>{" "}
                  {/* Skeleton for main number */}
                  <div className="animate-pulse bg-gray-300 rounded-md h-3 w-12 sm:h-[14px] sm:w-14"></div>{" "}
                  {/* Skeleton for (от ...) part */}
                </div>
              ) : (
                <div
                  className={`animate-pulse bg-gray-300 rounded h-full ${skeletonWidthClass}`}
                ></div>
              )
            ) : (
              <p className={mainAmountFinalClasses}>{mainAmount}</p>
            )}
          </div>

          {/* outOfText is only rendered if it exists AND not loading */}
          {!displayAsLoading && outOfText && (
            <p
              className={`text-xs font-normal ${amountColorFinal} opacity-75 pb-1`}
            >
              {outOfText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
