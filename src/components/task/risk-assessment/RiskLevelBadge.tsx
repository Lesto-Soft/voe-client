import React from "react";

interface RiskLevelBadgeProps {
  probability: number;
  impact: number;
  size?: "sm" | "md";
}

export const getRiskLevel = (probability: number, impact: number) => {
  const score = probability * impact;
  if (score <= 4) return { text: "НИСЪК", score };
  if (score <= 9) return { text: "СРЕДЕН", score };
  if (score <= 15) return { text: "ВИСОК", score };
  return { text: "КРИТИЧЕН", score };
};

export const getRiskStyle = (score: number) => {
  if (score <= 4) {
    return {
      text: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-500",
    };
  }
  if (score <= 9) {
    return {
      text: "text-yellow-700",
      bg: "bg-yellow-100",
      border: "border-yellow-500",
    };
  }
  if (score <= 15) {
    return {
      text: "text-orange-700",
      bg: "bg-orange-100",
      border: "border-orange-500",
    };
  }
  return {
    text: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-500",
  };
};

const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  probability,
  impact,
  size = "sm",
}) => {
  const { text, score } = getRiskLevel(probability, impact);
  const style = getRiskStyle(score);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${style.bg} ${style.text} ${sizeClasses[size]}`}
    >
      {text} ({score})
    </span>
  );
};

export default RiskLevelBadge;
