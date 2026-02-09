import React, { useState, useEffect } from "react";
import { IRiskAssessment } from "../../../db/interfaces";
import RiskLevelBadge from "./RiskLevelBadge";

interface RiskAssessmentFormProps {
  assessment?: IRiskAssessment;
  onSubmit: (data: {
    riskDescription: string;
    probability: number;
    impact: number;
    plan: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const sliderStyles = `
  .risk-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background-color: currentColor;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: grab;
  }

  .risk-slider::-moz-range-thumb {
    background-color: currentColor;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: none;
    cursor: grab;
  }
`;

const getSliderColor = (value: number) => {
  switch (value) {
    case 1:
      return "accent-green-500 text-green-500";
    case 2:
      return "accent-lime-500 text-lime-500";
    case 3:
      return "accent-yellow-500 text-yellow-500";
    case 4:
      return "accent-orange-500 text-orange-500";
    default:
      return "accent-red-500 text-red-500";
  }
};

const RiskAssessmentForm: React.FC<RiskAssessmentFormProps> = ({
  assessment,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [riskDescription, setRiskDescription] = useState("");
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize form when editing
  useEffect(() => {
    if (assessment) {
      setRiskDescription(assessment.riskDescription);
      setProbability(assessment.probability);
      setImpact(assessment.impact);
      setPlan(assessment.plan || "");
    } else {
      setRiskDescription("");
      setProbability(3);
      setImpact(3);
      setPlan("");
    }
  }, [assessment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!riskDescription.trim()) {
      setError("Описанието на риска е задължително.");
      return;
    }

    if (!plan.trim()) {
      setError("Планът за действие е задължителен.");
      return;
    }

    onSubmit({
      riskDescription: riskDescription.trim(),
      probability,
      impact,
      plan: plan.trim(),
    });
  };

  return (
    <>
      <style>{sliderStyles}</style>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Risk Description */}
        <div>
          <label
            htmlFor="risk-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Описание на риска <span className="text-red-500">*</span>
          </label>
          <textarea
            id="risk-description"
            value={riskDescription}
            onChange={(e) => setRiskDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            placeholder="Опишете потенциалния риск..."
          />
        </div>

        {/* Probability Slider */}
        <div>
          <label
            htmlFor="probability"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Вероятност: <span className="font-bold">{probability}</span>
          </label>
          <input
            id="probability"
            type="range"
            min="1"
            max="5"
            step="1"
            value={probability}
            onChange={(e) => setProbability(Number(e.target.value))}
            className={`risk-slider w-full h-2 rounded-lg appearance-none cursor-pointer ${getSliderColor(
              probability,
            )} bg-[linear-gradient(to_right,_#22c55e50_0%,_#facc1550_50%,_#ef444450_100%)]`}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Малко вероятно</span>
            <span>Много вероятно</span>
          </div>
        </div>

        {/* Impact Slider */}
        <div>
          <label
            htmlFor="impact"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Влияние: <span className="font-bold">{impact}</span>
          </label>
          <input
            id="impact"
            type="range"
            min="1"
            max="5"
            step="1"
            value={impact}
            onChange={(e) => setImpact(Number(e.target.value))}
            className={`risk-slider w-full h-2 rounded-lg appearance-none cursor-pointer ${getSliderColor(
              impact,
            )} bg-[linear-gradient(to_right,_#22c55e50_0%,_#facc1550_50%,_#ef444450_100%)]`}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Незначително</span>
            <span>Катастрофално</span>
          </div>
        </div>

        {/* Risk Level Preview */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
          <span className="text-sm text-gray-600">Ниво на риск:</span>
          <RiskLevelBadge probability={probability} impact={impact} size="md" />
        </div>

        {/* Action Plan */}
        <div>
          <label
            htmlFor="plan"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            План за действие <span className="text-red-500">*</span>
          </label>
          <textarea
            id="plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            placeholder="Опишете плана за смекчаване на риска..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            Отмени
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading
              ? "Запазване..."
              : assessment
                ? "Запази промените"
                : "Създай оценка"}
          </button>
        </div>
      </form>
    </>
  );
};

export default RiskAssessmentForm;
