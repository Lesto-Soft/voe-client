// components/features/analyses/components/PieLegend.tsx
import React from "react";
import { PieSegmentData } from "../../../charts/PieChart";

interface PieLegendProps {
  data: PieSegmentData[];
}

const PieLegend: React.FC<PieLegendProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 && data.length === 0) {
    return (
      <div className="mt-2 text-sm text-gray-500 w-full text-center">
        Няма данни за избрания период.
      </div>
    );
  }

  return (
    <div className="w-full space-y-1 p-1 flex-grow h-30 overflow-y-auto">
      {total > 0 &&
        data.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-xs sm:text-sm mb-1"
          >
            <div className="flex items-center truncate">
              <span
                className="w-3 h-3 mr-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </div>
            <span className="font-medium text-gray-700 whitespace-nowrap ml-2">
              {item.value}
              <span className="text-gray-500">
                &nbsp;({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
    </div>
  );
};

export default PieLegend;
