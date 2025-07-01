import React from "react";
import { IRatingMetric } from "../../../db/interfaces";
import StatCard from "../../cards/StatCard";
import {
  TrophyIcon,
  StarIcon,
  ExclamationTriangleIcon,
  Bars4Icon,
} from "@heroicons/react/24/solid";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";

export type TierFilter = "all" | "gold" | "silver" | "bronze" | "alert";

interface RatingMetricStatsProps {
  metrics: IRatingMetric[];
  activeTier: TierFilter;
  onTierSelect: (tier: TierFilter) => void;
  isLoading: boolean;
}

const RatingMetricStats: React.FC<RatingMetricStatsProps> = ({
  metrics,
  activeTier,
  onTierSelect,
  isLoading,
}) => {
  const tierCounts = React.useMemo(() => {
    const counts: Record<TierFilter, number> = {
      all: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      alert: 0,
    };

    counts.all = metrics.length;
    metrics.forEach((metric) => {
      const score = metric.averageScore;
      if (score === undefined || score === null) return;

      if (score >= TIERS.GOLD) counts.gold++;
      else if (score >= TIERS.SILVER) counts.silver++;
      else if (score >= TIERS.BRONZE) counts.bronze++;
      else if (score > 0) counts.alert++;
    });

    return counts;
  }, [metrics]);

  const cardData: {
    tier: TierFilter;
    title: string;
    icon: React.ElementType;
    iconColor: string;
  }[] = [
    {
      tier: "gold",
      title: "Отлични оценки",
      icon: TrophyIcon,
      iconColor: "text-amber-500",
    },
    {
      tier: "silver",
      title: "Добри оценки",
      icon: StarIcon,
      iconColor: "text-slate-400",
    },
    {
      tier: "bronze",
      title: "Средни оценки",
      icon: StarIcon,
      iconColor: "text-orange-700",
    },
    {
      tier: "alert",
      title: "Проблемни",
      icon: ExclamationTriangleIcon,
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start">
      <StatCard
        key="all"
        title="Всички Метрики"
        amount={tierCounts.all}
        icon={Bars4Icon}
        iconColor="text-slate-500"
        isActive={activeTier === "all"}
        onClick={() => onTierSelect("all")}
        isLoading={isLoading}
        className="w-full lg:w-52"
      />

      <div
        aria-hidden="true"
        className="hidden lg:block self-stretch w-px mx-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
      ></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:flex lg:flex-row lg:flex-wrap lg:gap-3 lg:flex-1">
        {cardData.map(({ tier, title, icon, iconColor }) => (
          <StatCard
            key={tier}
            title={title}
            amount={tierCounts[tier]}
            icon={icon}
            iconColor={iconColor}
            isActive={activeTier === tier}
            onClick={() => onTierSelect(tier)}
            isLoading={isLoading}
            className="w-full lg:w-45" // <-- UPDATED to match UserStats
          />
        ))}
      </div>
    </div>
  );
};

export default RatingMetricStats;
