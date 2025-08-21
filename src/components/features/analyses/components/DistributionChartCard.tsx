// src/components/features/analyses/components/DistributionChartCard.tsx
import React from "react";
import PieChart, { PieSegmentData } from "../../../charts/PieChart"; // Note: PieSegmentData is imported
import PieLegend from "./PieLegend";

interface DistributionChartCardProps {
  title: string;
  pieData: PieSegmentData[];
  // ADD THE NEW PROP TO THE WRAPPER
  onSegmentMiddleClick?: (
    segment: PieSegmentData,
    event: React.MouseEvent
  ) => void;
}

const DistributionChartCard: React.FC<DistributionChartCardProps> = ({
  title,
  pieData,
  onSegmentMiddleClick, // Destructure the prop
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col min-h-[270px]">
      <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
        {title}
      </h2>
      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4 h-full">
        <div className="flex-shrink-0 mx-auto">
          <PieChart
            data={pieData.length > 0 ? pieData : []}
            size={180}
            onSegmentMiddleClick={onSegmentMiddleClick} // Pass the prop down
          />
        </div>
        <PieLegend data={pieData} />
      </div>
    </div>
  );
};

export default DistributionChartCard;
