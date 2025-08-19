// src/components/charts/StatisticPieChart.tsx
import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import PieChart, { PieSegmentData } from "./PieChart";

interface StatisticPieChartProps {
  title: string;
  pieData: PieSegmentData[] | undefined;
}

const StatisticPieChart: React.FC<StatisticPieChartProps> = ({
  title,
  pieData,
}) => {
  // Check for empty state
  if (
    !pieData ||
    pieData.length === 0 ||
    pieData.reduce((sum, item) => sum + item.value, 0) === 0
  ) {
    return (
      <div className="text-center py-10">
        <InformationCircleIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Няма данни за диаграмата.</p>
      </div>
    );
  }

  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full">
      <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>

      {/* Chart Container */}
      <div className="flex justify-center mb-4">
        <PieChart data={pieData} size={160} />
      </div>

      {/* Legend Container */}
      <div className="w-full">
        <ul className="text-xs max-h-21 overflow-y-auto custom-scrollbar pr-1">
          {pieData.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between px-1"
            >
              <span className="flex items-center" title={item.label}>
                <span
                  className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-[200px]">{item.label}:</span>
              </span>
              <span className="font-medium whitespace-nowrap">
                {item.value} ({((item.value / totalValue) * 100).toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatisticPieChart;
