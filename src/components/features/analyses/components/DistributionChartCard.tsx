// src/components/features/analyses/components/DistributionChartCard.tsx
import React from "react";
import PieChart, { PieSegmentData } from "../../../charts/PieChart"; // Note: PieSegmentData is imported
import PieLegend from "./PieLegend";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface DistributionChartCardProps {
  title: string;
  pieData: PieSegmentData[];
  onSegmentMiddleClick?: (
    segment: PieSegmentData,
    event: React.MouseEvent
  ) => void;
}

const DistributionChartCard: React.FC<DistributionChartCardProps> = ({
  title,
  pieData,
  onSegmentMiddleClick,
}) => {
  return (
    // Add 'relative' to allow for absolute positioning of the icon
    <div className="relative bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col min-h-[270px]">
      {/* Conditionally render the help icon if onSegmentMiddleClick exists */}
      {onSegmentMiddleClick && (
        <div className="group absolute top-2 right-2 z-20">
          <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 cursor-help group-hover:text-sky-600 transition-colors" />
          <div className="absolute bottom-full right-0 mb-2 w-max p-2 rounded-md shadow-lg bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ul className="space-y-1 text-left">
              <li>
                <strong className="font-semibold">Среден клик:</strong> Преглед
                на конкретните сигнали
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
          />
        </div>
        <PieLegend data={pieData} />
      </div>
    </div>
  );
};

export default DistributionChartCard;
