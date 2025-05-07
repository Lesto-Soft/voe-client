// src/components/cards/StatCard.tsx
import React from "react";
import { UserIcon, UserGroupIcon } from "@heroicons/react/24/solid";

interface Props {
  amount: number | string; // Accepts string for formatted display
  title: string;
  iconColor?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

const StatCard: React.FC<Props> = ({
  amount,
  title,
  iconColor = "text-gray-500",
  onClick,
  className = "",
  isActive = false,
}) => {
  const baseClasses =
    "flex min-w-[200px] items-center space-x-4 rounded-md border p-4 shadow-sm transition-all duration-150 ease-in-out";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md active:scale-[0.98]"
    : "";
  const activeClasses = isActive
    ? "bg-white border-sky-200 border-4 ring-2 ring-sky-100 ring-offset-0 shadow-inner scale-102"
    : "bg-gray-200 border-gray-200 border-4 hover:bg-gray-50 hover:border-gray-100 active:bg-gray-100";

  const activeTitle = isActive ? "text-gray-500" : "text-gray-400";
  const amountColor = isActive ? "text-gray-800" : "text-gray-500";
  const finalIconColor = isActive ? iconColor : `${iconColor}`; // Consider adding opacity-75 if needed for inactive

  const IconComponent =
    title.toLowerCase().includes("общо") ||
    title.toLowerCase().includes("total")
      ? UserGroupIcon
      : UserIcon;

  // Check if amount is a string and contains the "out of" pattern
  const isFormattedString =
    typeof amount === "string" && amount.includes("(от ");
  let mainAmount: number | string = amount;
  let outOfText: string | null = null;

  if (isFormattedString) {
    const parts = amount.split("(от ");
    mainAmount = parts[0]?.trim() || amount; // Take the part before '(', fallback to original
    outOfText = parts[1] ? `(от ${parts[1]}` : null; // Reconstruct the 'out of' part
  }

  // Base classes for the main amount part
  const mainAmountClasses = `font-semibold ${amountColor} ${
    // Adjust size based on whether it's formatted or long
    isFormattedString ||
    (typeof amount === "string" && amount.length > 8) ||
    (typeof amount === "number" && amount > 9999)
      ? "text-xl" // Slightly smaller if formatted or long number
      : "text-2xl"
  }`;

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`}
      onClick={onClick}
    >
      <IconComponent
        className={`h-7 w-7 flex-shrink-0 ${finalIconColor}`}
        aria-hidden="true"
      />
      <div className="overflow-hidden">
        <p className={`truncate text-xs ${activeTitle}`}>{title}</p>
        {/* Render amount, potentially split */}
        <div className="flex items-baseline space-x-1">
          {" "}
          {/* Use flex to align parts */}
          <p className={mainAmountClasses}>{mainAmount}</p>
          {outOfText && (
            // Smaller text size for the "(out of ...)" part
            <p className={`text-xs font-normal ${amountColor} opacity-80`}>
              {outOfText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
