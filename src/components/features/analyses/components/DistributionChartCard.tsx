// src/components/features/analyses/components/DistributionChartCard.tsx
import React, { useState, useRef, useEffect } from "react"; // Add useRef and useEffect
import PieChart, { PieSegmentData } from "../../../charts/PieChart";
import PieLegend from "./PieLegend";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useDebounce } from "../../../../hooks/useDebounce"; // Import the debounce hook

interface DistributionChartCardProps {
  title: string;
  pieData: PieSegmentData[];
  onSegmentMiddleClick?: (
    segment: PieSegmentData,
    event: React.MouseEvent
  ) => void;
  middleClickLabel?: string;
}

// Helper to create a safe ID, must match the one in PieLegend
const createIdFromLabel = (label: string) => {
  return `legend-item-${label.replace(/\s+/g, "-")}`;
};

const DistributionChartCard: React.FC<DistributionChartCardProps> = ({
  title,
  pieData,
  onSegmentMiddleClick,
  middleClickLabel = "сигнали",
}) => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const debouncedHoveredLabel = useDebounce(hoveredLabel, 200); // Debounce the hover state
  const legendScrollRef = useRef<HTMLDivElement>(null); // Ref for the legend's scroll container

  useEffect(() => {
    if (debouncedHoveredLabel && legendScrollRef.current) {
      const legendItem = document.getElementById(
        createIdFromLabel(debouncedHoveredLabel)
      );
      if (legendItem) {
        // Check if the item is out of view
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
  }, [debouncedHoveredLabel]); // Effect runs when the debounced label changes

  return (
    <div className="relative bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col min-h-[270px]">
      {onSegmentMiddleClick && (
        <div className="group absolute top-2 right-2 z-20">
          <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 cursor-help group-hover:text-sky-600 transition-colors" />
          <div className="absolute bottom-full right-0 mb-2 w-max p-2 rounded-md shadow-lg bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ul className="space-y-1 text-left">
              <li>
                <strong className="font-semibold">Среден клик:</strong> Преглед
                на конкретните {middleClickLabel}
              </li>
            </ul>
            <div className="absolute top-full right-2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
          </div>
        </div>
      )}
      <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
        {title}
      </h2>
      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4 h-full">
        <div className="flex-shrink-0 mx-auto">
          <PieChart
            data={pieData.length > 0 ? pieData : []}
            size={180}
            onSegmentMiddleClick={onSegmentMiddleClick}
            hoveredLabel={hoveredLabel}
            onHover={setHoveredLabel}
          />
        </div>
        <PieLegend
          ref={legendScrollRef} // Pass the ref to the legend
          data={pieData}
          hoveredLabel={hoveredLabel}
          onHover={setHoveredLabel}
          onMiddleClick={(segment) =>
            onSegmentMiddleClick?.(segment, {} as React.MouseEvent)
          }
        />
      </div>
    </div>
  );
};

export default DistributionChartCard;
