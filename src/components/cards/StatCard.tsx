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
    "flex min-w-[180px] sm:min-w-[200px] items-center space-x-3 sm:space-x-4 rounded-lg border p-3 shadow-sm transition-all duration-150 ease-in-out";
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
      mainAmount = amount;
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
  const amountDisplayAreaHeightClass = isAmountConsideredLarge ? "h-7" : "h-8"; // For text-xl & text-2xl line height

  const mainAmountFinalClasses = `font-bold ${amountColorFinal} ${amountTextClass}`;
  const skeletonWidthClass = isAmountConsideredLarge ? "w-12" : "w-10";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`}
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
        {/* Changed items-baseline to items-end for bottom alignment */}
        <div className="flex items-end space-x-1">
          {/* This divwrapper ensures the main amount or its skeleton maintains a consistent height */}
          <div className={`flex items-center ${amountDisplayAreaHeightClass}`}>
            {displayAsLoading ? (
              <div
                className={`animate-pulse bg-gray-300 rounded h-full ${skeletonWidthClass}`}
              ></div>
            ) : (
              <p className={mainAmountFinalClasses}>{mainAmount}</p>
            )}
          </div>

          {/* outOfText is always rendered if it exists */}
          {outOfText && (
            <p
              className={`text-xs font-normal ${amountColorFinal} opacity-75 pb-1`}
            >
              {/* Added pb-px or similar for fine-tuning if needed with items-end */}
              {outOfText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
