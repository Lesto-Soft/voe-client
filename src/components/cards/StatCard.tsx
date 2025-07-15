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
  expectsOutOfTextFormat?: boolean;
}

const MIN_SKELETON_TIME = 250;

const StatCard: React.FC<Props> = ({
  amount,
  title,
  icon: IconComponent,
  iconColor = "text-gray-500",
  onClick,
  className = "w-full lg:w-30",
  isActive = false,
  isLoading = false,
  expectsOutOfTextFormat = false,
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

  // Shrink Change 1: Reduced vertical padding
  const baseClasses =
    "rounded-lg border py-2 px-3 shadow-sm transition-all duration-150 ease-in-out";
  const interactiveClasses = onClick ? "cursor-pointer hover:shadow-md" : "";
  const activeClasses = isActive
    ? "bg-white border-sky-500 border-2 ring-2 ring-sky-200 shadow-lg"
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

  // const isAmountConsideredLarge =
  //   (typeof mainAmount === "string" &&
  //     mainAmount.length > 3 &&
  //     !isFormattedString) ||
  //   (typeof mainAmount === "number" && mainAmount > 999) ||
  //   isFormattedString;

  // Shrink Change 2: Reduced amount font size
  const amountTextClass = "text-xl"; //isAmountConsideredLarge ? "text-lg" : "text-xl";
  // Shrink Change 3: Reduced fixed height for amount area
  const amountDisplayAreaHeightClass = "h-6";
  const mainAmountFinalClasses = `font-bold ${amountColorFinal} ${amountTextClass}`;
  const skeletonWidthClass = "w-12";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={title}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <p className={`truncate text-sm font-semibold ${titleColorFinal}`}>
        {title}
      </p>

      {/* Shrink Change 4: Reduced top margin and horizontal spacing */}
      <div className="mt-0.5 flex items-center space-x-2 sm:space-x-3">
        {/* Shrink Change 5: Downsized the icon */}
        <IconComponent
          className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${finalIconColor}`}
          aria-hidden="true"
        />
        <div className="overflow-hidden">
          <div className="flex items-end space-x-1">
            <div
              className={`flex items-center ${amountDisplayAreaHeightClass}`}
            >
              {displayAsLoading ? (
                expectsOutOfTextFormat ? (
                  <div className="flex items-baseline space-x-1 py-px">
                    {/* Shrink Change 6: Adjusted skeleton sizes */}
                    <div className="animate-pulse bg-gray-300 rounded-md h-4 w-10 sm:h-5 sm:w-12"></div>
                    <div className="animate-pulse bg-gray-300 rounded-md h-2.5 w-8 sm:h-3 sm:w-10"></div>
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

            {!displayAsLoading && outOfText && (
              <p
                // Shrink Change 7: Reduced bottom padding
                className={`text-xs font-normal ${amountColorFinal} opacity-75 pb-0.5`}
              >
                {outOfText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
