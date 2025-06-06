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
    // Add flex, flex-col, and the same minimum height
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col items-center min-h-[270px]">
      <h2 className="text-base sm:text-lg font-semibold text-center mb-2 text-gray-800">
        {title}
      </h2>

      {/* This 'div' will allow the footer to be pushed down correctly */}
      <div className="flex-grow flex flex-col justify-center items-center">
        {children}
      </div>

      {footerText && (
        <p className="text-xs text-gray-400 mt-auto pt-1">{footerText}</p>
      )}
    </div>
  );
};

export default SummaryCard;
