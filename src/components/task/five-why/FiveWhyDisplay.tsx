import React from "react";
import { IFiveWhy, IWhyStep } from "../../../db/interfaces";
import UserLink from "../../global/links/UserLink";
import { LightBulbIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

interface FiveWhyDisplayProps {
  fiveWhy: IFiveWhy;
}

const FiveWhyDisplay: React.FC<FiveWhyDisplayProps> = ({ fiveWhy }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with creator and date */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Създаден от:</span>
          <UserLink user={fiveWhy.creator} />
        </div>
        <span>{formatDate(fiveWhy.createdAt)}</span>
      </div>

      {/* Why Steps */}
      <ul className="space-y-3">
        {fiveWhy.whys.map((step: IWhyStep, index: number) => (
          <li key={index} className="text-sm">
            <p className="font-semibold text-gray-700">
              {index + 1}. {step.question}
            </p>
            <p className="text-gray-600 pl-4 border-l-2 border-gray-300 ml-2 mt-1 italic">
              {step.answer}
            </p>
          </li>
        ))}
      </ul>

      {/* Root Cause */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
        <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-1">
          <LightBulbIcon className="h-4 w-4" />
          Първопричина
        </div>
        <p className="text-sm text-amber-900">{fiveWhy.rootCause}</p>
      </div>

      {/* Counter Measures */}
      <div className="bg-green-50 border border-green-200 rounded-md p-3">
        <div className="flex items-center gap-2 text-green-800 font-medium text-sm mb-1">
          <WrenchScrewdriverIcon className="h-4 w-4" />
          Контрамерки
        </div>
        <p className="text-sm text-green-900">{fiveWhy.counterMeasures}</p>
      </div>
    </div>
  );
};

export default FiveWhyDisplay;
