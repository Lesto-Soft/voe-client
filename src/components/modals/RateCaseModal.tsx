// src/components/modals/RateCaseModal.tsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  StarIcon as StarOutline,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { IRating, IMetricScore, RATING_METRICS } from "../../db/interfaces";
import RatingDistributionChart from "../charts/RatingDistributionChart";

// Utility function to calculate user rating from their metric scores
const calculateUserRating = (scores: IMetricScore[]): number => {
  if (!scores || scores.length === 0) return 0;

  const validScores = scores.filter((s) => s.score > 0);
  if (validScores.length === 0) return 0;

  const sum = validScores.reduce((acc, s) => acc + s.score, 0);
  return sum / validScores.length;
};

// Utility function to calculate overall case rating
const calculateCaseRating = (ratings: IRating[]): number => {
  if (!ratings || ratings.length === 0) return 0;

  const userRatings = ratings.map((r) => calculateUserRating(r.scores));
  const validRatings = userRatings.filter((rating) => rating > 0);

  if (validRatings.length === 0) return 0;

  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
};

type MetricName = (typeof RATING_METRICS)[number];

const hintData = {
  Adequacy: {
    title: "Съответствие",
    description: "Уместност на сигнала. Качество на описание на сигнала.",
    tiers: {
      "1 точка": "Сигналът не е уместен.",
      "2-3 точки":
        "Сигналът е уместен в определена степен. Подадената информация е неточна и/или непълна.",
      "4-5 точки": "Сигналът е напълно уместен. Описан е ясно и подробно.",
    },
  },
  Impact: {
    title: "Въздействие",
    description:
      "Степен, в която сигналът ще допринесе за ограничаване на отрицателните въздействия.",
    tiers: {
      "1 точка":
        "Сигналът е несъстоятелен и няма да допринесе за ограничаване на риска и/или загубите.",
      "2-3 точки":
        "Сигналът ще има ограничено въздействие за ограничаване на риска и/или загубите.",
      "4-5 точки":
        "Сигналът ще допринесе за ограничаване/елиминиране на риска и/или загубите.",
    },
  },
  Efficiency: {
    title: "Ефективност",
    description: "Резултати спрямо ресурси.",
    tiers: {
      "1 точка": "Резултатите са минимални спрямо вложените ресурси.",
      "2-3 точки": "Резултатите са релевантни на необходимите ресурси.",
      "4-5 точки": "Резултатите надвишават значително необходимите ресурси.",
    },
  },
};

const RatingHintContent: React.FC<{ metricKey: keyof typeof hintData }> = ({
  metricKey,
}) => {
  const data = hintData[metricKey];
  return (
    <div className="text-left">
      <h4 className="font-bold mb-1 text-base">{data.title}</h4>
      <p className="italic text-xs text-gray-300 mb-3">{data.description}</p>
      <ul className="space-y-2 text-sm">
        {Object.entries(data.tiers).map(([tier, text]) => (
          <li key={tier}>
            <strong className="font-semibold">{tier}:</strong> {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

const StarRatingInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  size?: string;
}> = ({ value, onChange, size = "h-7 w-7" }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform duration-150 hover:scale-125"
        >
          <StarSolid
            className={` ${size} ${
              (hovered || value) >= star ? "text-yellow-400" : "text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

const ReadOnlyStars: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((s) =>
      s <= Math.round(score) ? ( // Use Math.round for better visual representation of averages
        <StarSolid key={s} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarOutline key={s} className="h-4 w-4 text-gray-300" />
      )
    )}
  </div>
);

interface RateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ratingData: {
    overallScore: number;
    scores: IMetricScore[];
  }) => void;
  caseNumber: number;
  caseRatings: IRating[];
  currentUserRating?: IRating;
}

const RateCaseModal: React.FC<RateCaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  caseNumber,
  caseRatings,
  currentUserRating,
}) => {
  const [metricScores, setMetricScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [activeDistribution, setActiveDistribution] = useState<
    MetricName | "Overall"
  >("Overall"); // Default to overall view
  const [isUserBreakdownVisible, setUserBreakdownVisible] = useState(false);

  const firstStarRef = useRef<HTMLDivElement>(null);

  const translationMap: { [key in MetricName]: string } = {
    Adequacy: "Съответствие",
    Impact: "Въздействие",
    Efficiency: "Ефективност",
  };

  useEffect(() => {
    if (currentUserRating) {
      const initialMetricScores = currentUserRating.scores.reduce(
        (acc, score) => {
          acc[score.metricName] = score.score;
          return acc;
        },
        {} as { [key: string]: number }
      );
      setMetricScores(initialMetricScores);
    } else {
      setMetricScores({});
    }
  }, [currentUserRating, isOpen]);

  useEffect(() => {
    if (isOpen && firstStarRef.current) {
      setTimeout(() => {
        const firstStarButton = firstStarRef.current?.querySelector("button");
        if (firstStarButton) {
          firstStarButton.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const {
    distributions,
    totalRatings,
    allMetricsData,
    ratingsByUser,
    calculatedAverage,
  } = useMemo(() => {
    const defaultMetricsData = RATING_METRICS.reduce((acc, metric) => {
      acc[metric] = { average: 0, count: 0 };
      return acc;
    }, {} as Record<(typeof RATING_METRICS)[number], { average: number; count: number }>);
    const defaultDistributions = RATING_METRICS.reduce((acc, metric) => {
      acc[metric] = {};
      return acc;
    }, {} as Record<(typeof RATING_METRICS)[number], { [key: number]: number }>);
    const defaultRatingsByUser = RATING_METRICS.reduce((acc, metric) => {
      acc[metric] = [];
      return acc;
    }, {} as Record<string, { user: string; score: number }[]>);
    if (!caseRatings || caseRatings.length === 0) {
      return {
        totalRatings: 0,
        allMetricsData: defaultMetricsData,
        distributions: defaultDistributions,
        ratingsByUser: defaultRatingsByUser,
        calculatedAverage: 0,
      };
    }
    const overallAverage = calculateCaseRating(caseRatings);
    const userOverallRatings = caseRatings
      .map((r) => ({ user: r.user.name, score: calculateUserRating(r.scores) }))
      .filter((r) => r.score > 0);
    const overallDistribution = userOverallRatings.reduce((acc, r) => {
      const roundedScore = Math.round(r.score);
      acc[roundedScore] = (acc[roundedScore] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    const metricCalcs = RATING_METRICS.reduce(
      (acc, metric) => {
        const metricRatings = caseRatings
          .map((r) => ({
            user: r.user.name,
            score: r.scores.find((s) => s.metricName === metric)?.score,
          }))
          .filter((r) => r.score !== undefined) as {
          user: string;
          score: number;
        }[];
        if (metricRatings.length > 0) {
          const scores = metricRatings.map((r) => r.score);
          acc.distributions[metric] = scores.reduce((dist, score) => {
            dist[score] = (dist[score] || 0) + 1;
            return dist;
          }, {} as { [key: number]: number });
          acc.data[metric] = {
            average: scores.reduce((s, c) => s + c, 0) / scores.length,
            count: scores.length,
          };
          acc.byUser[metric] = metricRatings;
        } else {
          acc.distributions[metric] = {};
          acc.data[metric] = { average: 0, count: 0 };
          acc.byUser[metric] = [];
        }
        return acc;
      },
      {
        distributions: {} as Record<string, { [key: number]: number }>,
        data: {} as Record<string, { average: number; count: number }>,
        byUser: {} as Record<string, { user: string; score: number }[]>,
      }
    );
    return {
      distributions: {
        Overall: overallDistribution,
        ...metricCalcs.distributions,
      },
      allMetricsData: {
        Overall: { average: overallAverage, count: userOverallRatings.length },
        ...metricCalcs.data,
      },
      totalRatings: caseRatings.length,
      ratingsByUser: { Overall: userOverallRatings, ...metricCalcs.byUser },
      calculatedAverage: overallAverage,
    };
  }, [caseRatings]);

  const hasAtLeastOneMetric = Object.values(metricScores).some(
    (score) => score > 0
  );
  const handleSubmit = () => {
    if (!hasAtLeastOneMetric) return;
    const finalMetricScores: IMetricScore[] = RATING_METRICS.filter(
      (metric) => metricScores[metric] > 0
    ).map((metric) => ({ metricName: metric, score: metricScores[metric] }));
    const calculatedOverall = calculateUserRating(finalMetricScores);
    onSubmit({ overallScore: calculatedOverall, scores: finalMetricScores });
    onClose();
  };
  type DisplayMetricName = "Overall" | MetricName;
  const displayTranslationMap: { [key in DisplayMetricName]: string } = {
    Overall: "Изчислена обща",
    ...translationMap,
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Tooltip.Provider>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-overlayShow" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none overflow-y-scroll max-h-[90vh]"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
              Оценка за Сигнал #{caseNumber}
            </Dialog.Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Side: User Input Form */}
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 order-2 md:order-1">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Детайлни оценки<span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (поне една метрика)
                    </span>
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Вашата обща оценка ще бъде изчислена автоматично въз основа
                    на оценените метрики.
                  </p>
                  {RATING_METRICS.map((metric, index) => {
                    const existingScore =
                      currentUserRating?.scores.find(
                        (s) => s.metricName === metric
                      )?.score || 0;
                    const hasExistingRating = existingScore > 0;
                    const currentScore = metricScores[metric] || 0;
                    return (
                      <div key={metric} className="mt-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          {/* MODIFICATION 1: Swapped element order */}
                          <label
                            className={`text-sm font-medium text-gray-700`}
                          >
                            {translationMap[metric as MetricName]}
                          </label>
                          <Tooltip.Root delayDuration={100}>
                            <Tooltip.Trigger asChild>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                              >
                                <QuestionMarkCircleIcon className="h-5 w-5" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="z-[99] max-w-sm rounded-lg bg-gray-900 text-white p-4 shadow-xl"
                                sideOffset={5}
                                align="start"
                              >
                                <RatingHintContent
                                  metricKey={metric as keyof typeof hintData}
                                />
                                <Tooltip.Arrow className="fill-gray-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                          {hasExistingRating && (
                            <span className="text-xs text-gray-400 italic">
                              (предишна оценка: {existingScore})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            ref={index === 0 ? firstStarRef : undefined}
                            className={
                              hasExistingRating && currentScore === 0
                                ? "opacity-60"
                                : ""
                            }
                          >
                            <StarRatingInput
                              value={currentScore}
                              onChange={(val) =>
                                setMetricScores((p) => ({
                                  ...p,
                                  [metric]: val,
                                }))
                              }
                              size="h-6 w-6"
                            />
                          </div>
                          {currentScore > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setMetricScores((p) => ({ ...p, [metric]: 0 }))
                              }
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Изчисти оценката"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Right Side: Community Statistics */}
              <div className="flex flex-col gap-4 order-1 md:order-2">
                <h3 className="font-semibold text-gray-800">
                  Разпределение Оценки
                </h3>
                {totalRatings > 0 ? (
                  <>
                    <div className="text-center p-3 rounded-lg bg-gray-100">
                      <p className="text-sm font-semibold text-gray-600">
                        {activeDistribution === "Overall"
                          ? "Средна оценка (изчислена)"
                          : `Средна оценка за ${
                              displayTranslationMap[
                                activeDistribution as DisplayMetricName
                              ]
                            }`}
                      </p>
                      <p className="text-3xl font-bold text-gray-800">
                        {activeDistribution === "Overall"
                          ? calculatedAverage.toFixed(1)
                          : allMetricsData[activeDistribution]?.average.toFixed(
                              1
                            ) || "0.0"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeDistribution === "Overall"
                          ? "Базирана на средните оценки по метрики"
                          : `от ${
                              allMetricsData[activeDistribution]?.count || 0
                            } оценки`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        {
                          displayTranslationMap[
                            activeDistribution as DisplayMetricName
                          ]
                        }{" "}
                        разпределение
                      </h4>
                      <RatingDistributionChart
                        distribution={distributions[activeDistribution] || {}}
                        totalRatings={
                          activeDistribution === "Overall"
                            ? allMetricsData.Overall.count
                            : allMetricsData[activeDistribution]?.count || 0
                        }
                      />
                      <div className="mt-3 text-center">
                        <button
                          onClick={() => setUserBreakdownVisible((p) => !p)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <span>
                            {isUserBreakdownVisible ? "Скрий" : "Покажи"}{" "}
                            индивидуални оценки
                          </span>
                          {isUserBreakdownVisible ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {isUserBreakdownVisible && (
                        <div className="bg-gray-50 p-3 mt-2 rounded-md max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                          {ratingsByUser[activeDistribution] &&
                          ratingsByUser[activeDistribution].length > 0 ? (
                            <ul className="space-y-2">
                              {ratingsByUser[activeDistribution].map(
                                (r, index) => {
                                  const isCurrentUser =
                                    currentUserRating &&
                                    r.user === currentUserRating.user.name;
                                  return (
                                    <li
                                      key={index}
                                      className={`flex justify-between items-center text-xs px-2 py-1 rounded ${
                                        isCurrentUser
                                          ? "bg-blue-100 text-blue-800 font-semibold"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      <span className="truncate pr-2">
                                        {r.user}
                                        {isCurrentUser && " (Вие)"}
                                      </span>
                                      <ReadOnlyStars score={r.score} />
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500 text-center p-2">
                              Няма детайлни оценки за този показател.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mt-4 mb-2">
                        Разбивка по средни оценки
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(allMetricsData).map(
                          ([metric, data]) => (
                            <React.Fragment key={metric}>
                              <button
                                onClick={() =>
                                  setActiveDistribution(
                                    metric as DisplayMetricName
                                  )
                                }
                                className={`w-full flex justify-between items-center text-sm p-2 rounded-md transition-colors ${
                                  activeDistribution === metric
                                    ? "bg-blue-100 text-blue-800"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <span className="font-semibold">
                                  {
                                    displayTranslationMap[
                                      metric as DisplayMetricName
                                    ]
                                  }
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-bold">
                                    {data.average.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({data.count})
                                  </span>
                                </div>
                              </button>
                              {/* MODIFICATION 2: Add visual separator */}
                              {metric === "Overall" && (
                                <hr className="my-1 border-gray-200" />
                              )}
                            </React.Fragment>
                          )
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Все още няма оценки от общността.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Отказ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasAtLeastOneMetric}
                className={`rounded px-4 py-2 text-sm font-medium text-white transition-colors ${
                  !hasAtLeastOneMetric
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={
                  !hasAtLeastOneMetric ? "Моля, оценете поне една метрика" : ""
                }
              >
                Изпрати
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Tooltip.Provider>
    </Dialog.Root>
  );
};

export default RateCaseModal;
