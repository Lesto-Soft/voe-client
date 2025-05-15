// src/components/cards/StatCard.tsx
import React, { useState, useEffect, useRef } from "react"; // Added useState, useEffect, useRef

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

const MIN_SKELETON_TIME = 250; // Minimum time in milliseconds to display the skeleton

const StatCard: React.FC<Props> = ({
  amount,
  title,
  icon: IconComponent,
  iconColor = "text-gray-500",
  onClick,
  className = "",
  isActive = false,
  isLoading = false, // This is the prop indicating if data is loading
}) => {
  const [displayAsLoading, setDisplayAsLoading] = useState(isLoading); // Internal state for skeleton visibility
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // If the prop indicates loading, we must show the skeleton.
      setDisplayAsLoading(true);
      // If a timer was previously set to hide the skeleton, clear it.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // The prop indicates data is not loading.
      // If we are currently showing a skeleton (displayAsLoading is true),
      // it means isLoading was true and just became false.
      // We want to keep showing the skeleton for at least MIN_SKELETON_TIME.
      if (displayAsLoading) {
        // Check if skeleton is currently active
        timerRef.current = window.setTimeout(() => {
          setDisplayAsLoading(false); // Hide skeleton after delay
          timerRef.current = null;
        }, MIN_SKELETON_TIME);
      } else {
        // If isLoading is false and displayAsLoading is already false (e.g. initial render with no loading)
        // ensure displayAsLoading remains false.
        setDisplayAsLoading(false);
      }
    }

    // Cleanup timer on unmount or if isLoading prop changes again
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, displayAsLoading]); // Re-run if isLoading prop changes or if displayAsLoading changes (e.g. timer completes)
  // Adding displayAsLoading to deps handles the case where the timer completes and sets it to false.

  // --- Rest of your existing StatCard logic ---
  const baseClasses =
    "flex min-w-[180px] sm:min-w-[200px] items-center space-x-3 sm:space-x-4 rounded-lg border p-3 shadow-sm transition-all duration-150 ease-in-out";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md active:scale-[0.98] "
    : "";
  const activeClasses = isActive
    ? "bg-white border-sky-500 border-2 ring-2 ring-sky-200 shadow-lg scale-[1.02]"
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
    }
  }

  const isAmountLargeOrFormatted =
    isFormattedString ||
    (typeof mainAmount === "string" && mainAmount.length > 6) ||
    (typeof mainAmount === "number" && mainAmount > 9999);

  const mainAmountClasses = `font-bold ${amountColorFinal} ${
    isAmountLargeOrFormatted ? "text-xl" : "text-2xl"
  }`;

  const skeletonAmountClasses = `animate-pulse bg-gray-300 rounded ${
    isAmountLargeOrFormatted ? "h-5 w-6" : "h-6 w-5"
  } my-1`;

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
        <div className="flex items-baseline space-x-1">
          {displayAsLoading ? ( // Use the internal displayAsLoading state here
            <div className={skeletonAmountClasses}></div>
          ) : (
            <>
              <p className={mainAmountClasses}>{mainAmount}</p>
              {outOfText && (
                <p
                  className={`text-xs font-normal ${amountColorFinal} opacity-75`}
                >
                  {outOfText}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
