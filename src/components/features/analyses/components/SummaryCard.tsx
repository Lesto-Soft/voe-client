// components/features/analyses/components/SummaryCard.tsx
import React from "react";

interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
  footerText?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  children,
  footerText,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col justify-center items-center min-h-[150px]">
      <h2 className="text-base sm:text-lg font-semibold text-center mb-2 text-gray-800">
        {title}
      </h2>

      {/* The unique content for each card will be rendered here */}
      {children}

      {footerText && (
        <p className="text-xs text-gray-400 mt-auto pt-1">{footerText}</p>
      )}
    </div>
  );
};

export default SummaryCard;
