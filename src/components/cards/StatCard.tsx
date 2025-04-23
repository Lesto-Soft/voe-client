import React from "react";
import { UserIcon } from "@heroicons/react/24/solid"; // Using solid variant

interface Props {
  amount: number;
  title: string;
  iconColor?: string;
  onClick?: () => void;
}

const StatCard: React.FC<Props> = ({
  amount,
  title,
  iconColor = "text-gray-500",
  onClick,
}) => {
  // Base classes
  const baseClasses =
    "flex min-w-[200px] items-center space-x-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm";

  // Interactive classes (only add if onClick is provided)
  const interactiveClasses = onClick
    ? "cursor-pointer transition-all duration-150 ease-in-out hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:scale-[0.98]" // <-- Added interactive styles
    : "";

  return (
    <div className={`${baseClasses} ${interactiveClasses}`} onClick={onClick}>
      <UserIcon
        className={`h-7 w-7 flex-shrink-0 ${iconColor}`}
        aria-hidden="true"
      />
      <div className="overflow-hidden">
        {" "}
        {/* Added for potential text overflow */}
        <p className="truncate text-xs text-gray-500">{title}</p>{" "}
        {/* Added truncate */}
        <p className="text-2xl font-semibold text-gray-800">{amount}</p>
      </div>
    </div>
  );
};

export default StatCard;
