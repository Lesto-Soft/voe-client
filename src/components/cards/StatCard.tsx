// src/components/cards/StatCard.tsx
import React from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import { UserGroupIcon } from "@heroicons/react/24/solid";

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
    ? "bg-white border-sky-200 border-4 ring-2 ring-sky-100 ring-offset-0 shadow-inner scale-102" // Example active style
    : "bg-gray-200 border-gray-200 border-4 hover:bg-gray-50 hover:border-gray-100 active:bg-gray-100"; // Default/inactive style

  const activeTitle = isActive ? "text-gray-500" : "text-gray-400";
  const activeAmount = isActive ? "text-gray-800" : "text-gray-500";
  const finalIconColor = isActive ? iconColor : `${iconColor}`; //TODO add opacity here

  // className defined only for the main statcard currently
  const IconComponent = className ? UserGroupIcon : UserIcon;

  return (
    <div
      // Combine base, interactive, active/inactive, and custom className
      className={`${baseClasses} ${interactiveClasses} ${activeClasses} ${className}`}
      onClick={onClick} // Keep onClick prop
    >
      <IconComponent
        className={`h-7 w-7 flex-shrink-0 ${finalIconColor}`}
        aria-hidden="true"
      />
      <div className="overflow-hidden">
        <p className={`truncate text-xs ${activeTitle}`}>{title}</p>
        <p className={`text-2xl font-semibold ${activeAmount}`}>{amount}</p>
      </div>
    </div>
  );
};

export default StatCard;
