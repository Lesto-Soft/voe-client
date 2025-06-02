// src/components/global/PageStatusDisplay.tsx
import React from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface PageStatusDisplayProps {
  loading?: boolean;
  error?: { message: string } | null;
  notFound?: boolean;
  message?: string;
  categoryName?: string; // Optional, for more specific "not found" messages
  height?: string; // e.g., "h-[calc(100vh-6rem)]" or "h-full"
}

const PageStatusDisplay: React.FC<PageStatusDisplayProps> = ({
  loading,
  error,
  notFound,
  message,
  categoryName,
  height = "h-[calc(100vh-6rem)]", // Default height as in original PageStatusWrapper
}) => {
  let IconComponent: React.ElementType | null = null;
  let iconClasses = "";
  let title = "";
  let text = message || "";
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  let borderColor = "border-gray-300";

  if (loading) {
    IconComponent = ArrowPathIcon;
    iconClasses = "text-blue-500 animate-spin";
    title = "Зареждане...";
    text = text || "Моля, изчакайте...";
  } else if (error) {
    IconComponent = ExclamationTriangleIcon;
    iconClasses = "text-red-500";
    title = "Грешка при зареждане";
    text = error.message || text || "Възникна неочаквана грешка.";
    bgColor = "bg-red-50";
    textColor = "text-red-700";
    borderColor = "border-red-300";
  } else if (notFound) {
    IconComponent = InformationCircleIcon;
    iconClasses = "text-yellow-500";
    title = categoryName
      ? `Категория '${categoryName}' не е намерена`
      : "Съдържанието не е намерено";
    text = text || "Моля, провереte адреса или опитайте по-късно.";
    bgColor = "bg-yellow-50";
    textColor = "text-yellow-700";
    borderColor = "border-yellow-300";
  } else if (message) {
    IconComponent = InformationCircleIcon;
    iconClasses = "text-blue-500";
    title = "Информация";
    // text is already set from props.message
  } else {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${height} p-4`}>
      <div
        className={`p-6 sm:p-8 rounded-lg shadow-md ${bgColor} ${borderColor} border max-w-md w-full flex items-center`} // items-center for vertical alignment
      >
        {IconComponent && (
          <div className="flex-shrink-0 mr-4">
            {" "}
            {/* Container for icon with right margin */}
            <IconComponent
              className={`h-10 w-10 sm:h-12 sm:w-12 ${iconClasses}`}
            />
          </div>
        )}
        <div className="flex-grow">
          {" "}
          {/* Text content will take remaining space */}
          {title && (
            <h2
              className={`text-lg sm:text-xl font-semibold ${textColor} mb-1`}
            >
              {" "}
              {/* Adjusted font size and margin */}
              {title}
            </h2>
          )}
          {text && <p className={`text-sm ${textColor}`}>{text}</p>}
          {error && (
            <p className={`text-xs ${textColor} mt-2`}>
              {" "}
              {/* Adjusted margin */}
              Моля, проверете конзолата за повече детайли или опитайте да
              презаредите страницата.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageStatusDisplay;
