import React from "react";

interface Props {
  amount: number;
  title: string;
}

const StatCard: React.FC<Props> = ({ amount, title }) => {
  return (
    <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{amount}</p>
      </div>
    </div>
  );
};

export default StatCard;
