// src/components/cards/StatCard.tsx
import React from "react";

interface Props {
  amount: number | string; // Accepts string for formatted display like "X (от Y)"
  title: string;
  icon: React.ElementType; // Prop to explicitly pass the icon component
  iconColor?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

const StatCard: React.FC<Props> = ({
  amount,
  title,
  icon: IconComponent, // Use the destructured and aliased prop
  iconColor = "text-gray-500",
  onClick,
  className = "",
  isActive = false,
}) => {
  // Base classes for the card
  const baseClasses =
    "flex min-w-[180px] sm:min-w-[200px] items-center space-x-3 sm:space-x-4 rounded-lg border p-3 shadow-sm transition-all duration-150 ease-in-out";

  // Classes for interactive cards (if onClick is provided)
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md active:scale-[0.98] "
    : "";

  // Classes for active vs. inactive state
  const activeClasses = isActive
    ? "bg-white border-sky-500 border-2 ring-2 ring-sky-200 shadow-lg scale-[1.02]" // More prominent active state
    : "bg-gray-50 border-gray-200 border-2 hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200";

  // Text and icon color adjustments based on active state
  const titleColorFinal = isActive
    ? "text-sky-700 font-semibold"
    : "text-gray-500";
  const amountColorFinal = isActive ? "text-sky-800" : "text-gray-700";
  const finalIconColor = isActive ? iconColor : `${iconColor} opacity-80`; // Apply more opacity for inactive icons

  // Logic to parse "X (от Y)" format for amount
  const isFormattedString =
    typeof amount === "string" && /\(от\s.*\)/.test(amount);
  let mainAmount: string | number = amount;
  let outOfText: string | null = null;

  if (isFormattedString) {
    const match = amount.match(/(.*)\s*\(от\s+(.*)\)/);
    if (match && match[1] && match[2]) {
      mainAmount = match[1].trim();
      outOfText = `(от ${match[2].trim()})`; // Ensure the closing parenthesis is part of the match or added
    }
  }

  // Dynamic text size for the main amount
  const mainAmountClasses = `font-bold ${amountColorFinal} ${
    isFormattedString ||
    (typeof mainAmount === "string" && mainAmount.length > 6) || // Adjusted length threshold
    (typeof mainAmount === "number" && mainAmount > 9999)
      ? "text-xl" // Slightly smaller for formatted or long numbers
      : "text-2xl"
  }`;

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined} // Accessibility: role button if clickable
      tabIndex={onClick ? 0 : undefined} // Accessibility: make it focusable if clickable
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      } // Accessibility: allow click with Enter/Space
    >
      <IconComponent
        className={`h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 ${finalIconColor}`}
        aria-hidden="true"
      />
      <div className="overflow-hidden flex-grow">
        {" "}
        {/* flex-grow to take available space */}
        <p className={`truncate text-xs font-medium ${titleColorFinal}`}>
          {title}
        </p>
        <div className="flex items-baseline space-x-1">
          <p className={mainAmountClasses}>{mainAmount}</p>
          {outOfText && (
            <p className={`text-xs font-normal ${amountColorFinal} opacity-75`}>
              {outOfText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
