// src/components/cards/StatCard.tsx
import React from "react";
import { UserIcon } from "@heroicons/react/24/solid";

interface Props {
  amount: number;
  title: string;
  iconColor?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean; // New prop
}

const StatCard: React.FC<Props> = ({
  amount,
  title,
  iconColor = "text-gray-500",
  onClick,
  className = "",
  isActive = false, // Default to false
}) => {
  // Base classes
  const baseClasses =
    "flex min-w-[200px] items-center space-x-4 rounded-md border p-4 shadow-sm transition-all duration-150 ease-in-out";

  // Interactive classes (only add if onClick is provided)
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md active:scale-[0.98]"
    : "";

  // Active state classes (apply when isActive is true)
  // Example: Brighter background, maybe a ring/border highlight
  const activeClasses = isActive
    ? "bg-sky-100 border-sky-300 ring-2 ring-sky-400 ring-offset-1 shadow-inner" // Example active style
    : "bg-white border-gray-200 hover:bg-gray-50 active:bg-gray-100"; // Default/inactive style

  return (
    <div
      // Combine base, interactive, active/inactive, and custom className
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`}
      onClick={onClick} // Keep onClick prop
    >
      <UserIcon
        className={`h-7 w-7 flex-shrink-0 ${iconColor}`}
        aria-hidden="true"
      />
      <div className="overflow-hidden">
        <p className="truncate text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{amount}</p>
      </div>
    </div>
  );
};

export default StatCard;
