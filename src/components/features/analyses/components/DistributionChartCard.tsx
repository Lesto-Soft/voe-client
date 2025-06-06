// components/features/analyses/components/DistributionChartCard.tsx
import React from "react";
import PieChart, { PieSegmentData } from "../../../charts/PieChart";
import PieLegend from "./PieLegend";

interface DistributionChartCardProps {
  title: string;
  pieData: PieSegmentData[];
}

const DistributionChartCard: React.FC<DistributionChartCardProps> = ({
  title,
  pieData,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
      <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
        {title}
      </h2>
      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mx-auto">
          {/* We render the pie chart only if there is data to prevent an empty circle */}
          <PieChart data={pieData.length > 0 ? pieData : []} size={180} />
        </div>
        <PieLegend data={pieData} />
      </div>
    </div>
  );
};

export default DistributionChartCard;
