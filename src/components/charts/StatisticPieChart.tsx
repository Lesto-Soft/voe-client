// src/components/charts/StatisticPieChart.tsx
import React, { useState, useRef, useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import PieChart, { PieSegmentData } from "./PieChart";
import { useDebounce } from "../../hooks/useDebounce";

const createIdFromLabel = (label: string) => {
  return `stat-legend-item-${label.replace(/\s+/g, "-")}`;
};

interface StatisticPieChartProps {
  title: string;
  pieData: PieSegmentData[] | undefined;
  onSegmentClick?: (segment: PieSegmentData) => void; // <-- NEW: Add click handler prop
  activeLabel?: string | null;
}

const StatisticPieChart: React.FC<StatisticPieChartProps> = ({
  title,
  pieData,
  onSegmentClick, // <-- NEW: Destructure prop
  activeLabel,
}) => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const debouncedHoveredLabel = useDebounce(hoveredLabel, 200);
  const legendScrollRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (debouncedHoveredLabel && legendScrollRef.current) {
      const legendItem = document.getElementById(
        createIdFromLabel(debouncedHoveredLabel)
      );
      if (legendItem) {
        const container = legendScrollRef.current;
        const itemRect = legendItem.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (
          itemRect.top < containerRect.top ||
          itemRect.bottom > containerRect.bottom
        ) {
          legendItem.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }
  }, [debouncedHoveredLabel]);

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

      <div className="flex justify-center mb-4">
        <PieChart
          data={pieData}
          size={160}
          hoveredLabel={hoveredLabel}
          onHover={setHoveredLabel}
          onSegmentClick={onSegmentClick} // <-- NEW: Pass handler to PieChart
          activeLabel={activeLabel}
        />
      </div>

      <div className="w-full">
        <ul
          ref={legendScrollRef}
          className="text-xs max-h-21 overflow-y-auto custom-scrollbar pr-1"
        >
          {pieData.map((item) => {
            const isHovered = item.label === hoveredLabel;
            const isActive = item.label === activeLabel; // <-- ADD THIS CHECK
            return (
              <li
                key={item.label}
                className={`flex items-center justify-between px-1 py-0.5 rounded-md transition-colors ${
                  onSegmentClick ? "cursor-pointer" : ""
                } ${
                  isHovered
                    ? isActive
                      ? "bg-sky-200 font-semibold" // Hovering an active item
                      : "bg-sky-100" // Standard hover
                    : isActive
                    ? "bg-indigo-100 font-semibold" // Active but not hovered
                    : ""
                } active:bg-indigo-200`} // Style for while mouse is pressed`}
                onMouseEnter={() => setHoveredLabel(item.label)}
                onMouseLeave={() => setHoveredLabel(null)}
                onClick={() => onSegmentClick?.(item)}
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
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default StatisticPieChart;
