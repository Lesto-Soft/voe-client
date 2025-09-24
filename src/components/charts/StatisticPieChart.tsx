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
  onSegmentClick?: (segment: PieSegmentData) => void;
  activeLabel?: string | null;
  layout?: "vertical" | "horizontal";
}

const StatisticPieChart: React.FC<StatisticPieChartProps> = ({
  title,
  pieData,
  onSegmentClick,
  activeLabel,
  layout = "vertical",
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

  useEffect(() => {
    if (activeLabel && legendScrollRef.current) {
      const legendItem = document.getElementById(
        createIdFromLabel(activeLabel)
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
  }, [activeLabel]);

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
      <div
        className={
          layout === "horizontal"
            ? "flex flex-row items-center justify-around gap-x-4"
            : ""
        }
      >
        <div
          className={
            layout === "horizontal"
              ? "flex-shrink-0"
              : "flex justify-center mb-4"
          }
        >
          <PieChart
            data={pieData}
            size={layout === "horizontal" ? 240 : 160}
            hoveredLabel={hoveredLabel}
            onHover={setHoveredLabel}
            onSegmentClick={onSegmentClick}
            activeLabel={activeLabel}
          />
        </div>

        <div
          className={
            layout === "horizontal" ? "flex-1 min-w-0 max-w-1/2" : "w-full"
          }
        >
          <ul
            ref={legendScrollRef}
            className="text-xs max-h-48 overflow-y-auto custom-scrollbar-xs pr-1"
          >
            {pieData.map((item) => {
              const isHovered = item.label === hoveredLabel;
              const isActive = item.label === activeLabel;
              return (
                <li
                  key={item.label}
                  id={createIdFromLabel(item.label)}
                  // --- MODIFIED: Added gap for spacing ---
                  className={`flex items-center justify-between gap-x-2 px-1 py-0.5 rounded-md transition-colors ${
                    onSegmentClick ? "cursor-pointer" : ""
                  } ${
                    isHovered
                      ? isActive
                        ? "bg-sky-200 font-semibold"
                        : "bg-sky-100"
                      : isActive
                      ? "bg-indigo-100 font-semibold"
                      : ""
                  } active:bg-indigo-200`}
                  onMouseEnter={() => setHoveredLabel(item.label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                  onClick={() => onSegmentClick?.(item)}
                  title={`${item.label}: ${item.value} (${(
                    (item.value / totalValue) *
                    100
                  ).toFixed(1)}%)`}
                >
                  {/* --- MODIFIED: Added min-w-0 to allow this container to shrink --- */}
                  <span className="flex items-center min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {/* --- MODIFIED: Removed fixed max-width to make it fully dynamic --- */}
                    <span className="truncate">{item.label}:</span>
                  </span>
                  {/* --- MODIFIED: Added flex-shrink-0 to prevent this part from shrinking --- */}
                  <span className="font-medium whitespace-nowrap flex-shrink-0">
                    {item.value} ({((item.value / totalValue) * 100).toFixed(1)}
                    %)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticPieChart;
