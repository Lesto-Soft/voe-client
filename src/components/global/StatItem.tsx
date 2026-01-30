// src/components/global/StatItem.tsx
import React from "react";

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined | null;
  iconColorClass?: string;
  valueClasses?: string;
}

const StatItem: React.FC<StatItemProps> = ({
  icon: Icon,
  label,
  value,
  iconColorClass = "text-gray-500",
  valueClasses = "text-gray-800 text-base font-semibold",
}) => (
  <div className="flex items-center justify-between p-1 ">
    <div className="flex items-center">
      <Icon className={`h-5 w-5 mr-2 ${iconColorClass}`} />
      <span className="text-sm text-gray-700">{label}:</span>
    </div>
    <strong className={valueClasses}>{value != null ? value : "-"}</strong>
  </div>
);

export default StatItem;
