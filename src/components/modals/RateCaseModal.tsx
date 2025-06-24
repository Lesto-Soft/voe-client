// src/components/modals/RateCaseModal.tsx (Updated Layout)

import React, { useState, useMemo, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { XMarkIcon, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  StarIcon as StarOutline,
} from "@heroicons/react/24/outline";
import { IRating, IMetricScore, RATING_METRICS } from "../../db/interfaces";
import RatingDistributionChart from "../charts/RatingDistributionChart";

// NOTE: No changes needed in the helper components (RatingHintContent, StarRatingInput)

type MetricName = "Overall" | (typeof RATING_METRICS)[number];

const hintData = {
  Overall: {
    title: "Цялостна Оценка",
    description:
      "Каква е цялостната Ви оценка за този сигнал, вземайки предвид всички фактори?",
    tiers: { "1-2 точки": "Слаб", "3 точки": "Среден", "4-5 точки": "Силен" },
  },
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
      s <= score ? (
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
  const [overallScore, setOverallScore] = useState(0);
  const [metricScores, setMetricScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [activeDistribution, setActiveDistribution] =
    useState<MetricName>("Overall");
  // NEW: State to control visibility of the user breakdown list
  const [isUserBreakdownVisible, setUserBreakdownVisible] = useState(false);

  const firstStarRef = useRef<HTMLDivElement>(null);

  const translationMap: { [key in MetricName]: string } = {
    Overall: "Цялостно",
    Adequacy: "Съответствие",
    Impact: "Въздействие",
    Efficiency: "Ефективност",
  };

  useEffect(() => {
    if (currentUserRating) {
      setOverallScore(currentUserRating.overallScore);
      const initialMetricScores = currentUserRating.scores.reduce(
        (acc, score) => {
          acc[score.metricName] = score.score;
          return acc;
        },
        {} as { [key: string]: number }
      );
      setMetricScores(initialMetricScores);
    } else {
      setOverallScore(0);
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

  // The useMemo hook remains the same, as it already calculates the necessary data.
  const { distributions, totalRatings, allMetricsData, ratingsByUser } =
    useMemo(() => {
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
          allMetricsData: {
            Overall: { average: 0, count: 0 },
            ...defaultMetricsData,
          },
          distributions: { Overall: {}, ...defaultDistributions },
          ratingsByUser: { Overall: [], ...defaultRatingsByUser },
        };
      }
      const overallScores = caseRatings.map((r) => r.overallScore);
      const overallDistribution = overallScores.reduce((acc, score) => {
        acc[Math.round(score)] = (acc[Math.round(score)] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });
      const overallAverage =
        overallScores.reduce((s, c) => s + c, 0) / overallScores.length;
      const overallRatingsByUser = caseRatings.map((r) => ({
        user: r.user.name,
        score: r.overallScore,
      }));
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
          Overall: { average: overallAverage, count: overallScores.length },
          ...metricCalcs.data,
        },
        totalRatings: caseRatings.length,
        ratingsByUser: { Overall: overallRatingsByUser, ...metricCalcs.byUser },
      };
    }, [caseRatings]);

  const handleSubmit = () => {
    if (overallScore === 0) return;
    const finalMetricScores: IMetricScore[] = RATING_METRICS.map((metric) => ({
      metricName: metric,
      score: metricScores[metric] || 0,
    }));
    onSubmit({ overallScore, scores: finalMetricScores });
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Tooltip.Provider>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-overlayShow" />
          <Dialog.Content
            // MODIFIED: Changed overflow-y-auto to overflow-y-scroll
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none overflow-y-scroll max-h-[90vh]"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
              Оценка за Сигнал #{caseNumber}
            </Dialog.Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Side: User Input Form (No changes here) */}
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 order-2 md:order-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-semibold text-gray-800">
                      Вашата цялостна оценка
                      <span className="text-red-500">*</span>
                    </h3>
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
                          <RatingHintContent metricKey="Overall" />
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>
                  <div ref={firstStarRef}>
                    <StarRatingInput
                      value={overallScore}
                      onChange={setOverallScore}
                    />
                  </div>
                </div>
                <hr className="border-t-2 border-gray-200 my-2" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Детайлни оценки (опционално)
                  </h3>
                  {RATING_METRICS.map((metric) => (
                    <div key={metric} className="mt-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-sm font-medium text-gray-700">
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
                      </div>
                      <StarRatingInput
                        value={metricScores[metric] || 0}
                        onChange={(val) =>
                          setMetricScores((p) => ({ ...p, [metric]: val }))
                        }
                        size="h-6 w-6"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Community Statistics (MODIFIED) */}
              <div className="flex flex-col gap-4 order-1 md:order-2">
                <h3 className="font-semibold text-gray-800">
                  Разпределение Оценки
                </h3>
                {totalRatings > 0 ? (
                  <>
                    <div className="text-center p-2 rounded-lg bg-gray-100">
                      <p className="text-sm font-semibold text-gray-600">
                        Средна оценка
                      </p>
                      <p className="text-3xl font-bold text-gray-800">
                        {allMetricsData.Overall.average.toFixed(1)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        {translationMap[activeDistribution]} разпределение
                      </h4>
                      <RatingDistributionChart
                        distribution={distributions[activeDistribution] || {}}
                        totalRatings={totalRatings}
                      />

                      {/* NEW: Toggle button for user breakdown */}
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

                      {/* NEW: Conditionally rendered user breakdown section */}
                      {isUserBreakdownVisible && (
                        <div className="bg-gray-50 p-2 mt-2 rounded-md border max-h-32 overflow-y-auto custom-scrollbar">
                          {ratingsByUser[activeDistribution] &&
                          ratingsByUser[activeDistribution].length > 0 ? (
                            <ul className="space-y-1.5">
                              {ratingsByUser[activeDistribution].map(
                                (r, index) => (
                                  <li
                                    key={index}
                                    className="flex justify-between items-center text-xs text-gray-700"
                                  >
                                    <span className="truncate pr-2">
                                      {r.user}
                                    </span>
                                    <ReadOnlyStars score={r.score} />
                                  </li>
                                )
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
                        {/* MODIFIED: This section is now just for selecting the active metric */}
                        {Object.entries(allMetricsData).map(
                          ([metric, data]) => (
                            <button
                              key={metric}
                              onClick={() =>
                                setActiveDistribution(metric as MetricName)
                              }
                              className={`w-full flex justify-between items-center text-sm p-2 rounded-md transition-colors ${
                                activeDistribution === metric
                                  ? "bg-blue-100 text-blue-800"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-semibold">
                                {translationMap[metric as MetricName]}
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
                disabled={overallScore === 0}
                className={`rounded px-4 py-2 text-sm font-medium text-white transition-colors ${
                  overallScore === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={overallScore === 0 ? "Моля, дайте цялостна оценка" : ""}
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
