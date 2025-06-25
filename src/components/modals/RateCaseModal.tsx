// src/components/modals/RateCaseModal.tsx (Refactored)

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
import { IMetricScore, IRatingMetric, IMe } from "../../db/interfaces";
import {
  useGetAllRatingMetrics,
  useBulkCreateMetricScores,
  useGetCaseMetricScores,
} from "../../graphql/hooks/rating";
import RatingDistributionChart from "../charts/RatingDistributionChart";
import PageStatusDisplay from "../global/PageStatusDisplay"; // For loading/error states

// --- REMOVED --- Old utility functions (calculateUserRating, calculateCaseRating) are no longer needed.
// --- REMOVED --- The hardcoded 'hintData' object is no longer needed.

// --- Helper Components (Unchanged) ---

const RatingHintContent: React.FC<{ metric: IRatingMetric }> = ({ metric }) => {
  return (
    <div className="text-left max-w-xs">
      <h4 className="font-bold mb-1 text-base">{metric.name}</h4>
      <p className="italic text-sm text-gray-300 mb-3 whitespace-pre-wrap">
        {metric.description}
      </p>
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
      s <= Math.round(score) ? (
        <StarSolid key={s} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarOutline key={s} className="h-4 w-4 text-gray-300" />
      )
    )}
  </div>
);

// --- UPDATED --- Props are simplified
interface RateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseNumber: number;
  currentUser: IMe;
  onSuccessfulSubmit: () => void; // To trigger a refetch on the parent page
}

const RateCaseModal: React.FC<RateCaseModalProps> = ({
  isOpen,
  onClose,
  caseId,
  caseNumber,
  currentUser,
  onSuccessfulSubmit,
}) => {
  // --- NEW: Data Fetching using our Hooks ---
  const {
    ratingMetrics,
    loading: loadingMetrics,
    error: errorMetrics,
  } = useGetAllRatingMetrics({ skip: !isOpen });

  const {
    metricScores: caseScores,
    loading: loadingScores,
    error: errorScores,
  } = useGetCaseMetricScores(caseId);

  const {
    submitScores,
    loading: submittingScores,
    error: errorSubmitting,
  } = useBulkCreateMetricScores();

  // --- UPDATED --- State is now keyed by metric ID
  const [userScores, setUserScores] = useState<{ [metricId: string]: number }>(
    {}
  );
  const [activeDistribution, setActiveDistribution] =
    useState<string>("Overall");
  const [isUserBreakdownVisible, setUserBreakdownVisible] = useState(false);

  const firstStarRef = useRef<HTMLDivElement>(null);

  // --- UPDATED --- This effect initializes the form with the user's existing scores
  useEffect(() => {
    if (isOpen && caseScores.length > 0) {
      const currentUserScores = caseScores.filter(
        (s) => s.user._id === currentUser._id
      );

      if (currentUserScores.length > 0) {
        const initialScores = currentUserScores.reduce((acc, score) => {
          acc[score.metric._id] = score.score;
          return acc;
        }, {} as { [metricId: string]: number });
        setUserScores(initialScores);
      } else {
        setUserScores({}); // Reset if user has no scores for this case
      }
    } else if (!isOpen) {
      setUserScores({}); // Reset on close
    }
  }, [isOpen, caseScores, currentUser._id]);

  // --- UPDATED --- The entire statistics calculation is re-wired for the new data structure
  const { distributions, allMetricsData, calculatedAverage } = useMemo(() => {
    if (!caseScores || caseScores.length === 0) {
      return {
        distributions: {},
        allMetricsData: {},
        calculatedAverage: 0,
      };
    }

    // Calculate overall average from all scores
    const totalSum = caseScores.reduce((acc, s) => acc + s.score, 0);
    const overallAverage = totalSum / caseScores.length;

    // Group scores by metric ID
    const scoresByMetric = caseScores.reduce((acc, score) => {
      const metricId = score.metric._id;
      if (!acc[metricId]) {
        acc[metricId] = [];
      }
      acc[metricId].push(score);
      return acc;
    }, {} as { [metricId: string]: IMetricScore[] });

    const metricsData: { [key: string]: { average: number; count: number } } =
      {};
    const metricDistributions: { [key: string]: { [key: number]: number } } =
      {};

    for (const metricId in scoresByMetric) {
      const scores = scoresByMetric[metricId];
      const sum = scores.reduce((acc, s) => acc + s.score, 0);
      metricsData[metricId] = {
        average: sum / scores.length,
        count: scores.length,
      };
      metricDistributions[metricId] = scores.reduce((dist, s) => {
        dist[s.score] = (dist[s.score] || 0) + 1;
        return dist;
      }, {} as { [key: number]: number });
    }

    // Add an "Overall" category for the distribution chart
    const overallDistribution = caseScores.reduce((dist, s) => {
      dist[s.score] = (dist[s.score] || 0) + 1;
      return dist;
    }, {} as { [key: number]: number });

    return {
      distributions: { ...metricDistributions, Overall: overallDistribution },
      allMetricsData: metricsData,
      calculatedAverage: overallAverage,
    };
  }, [caseScores]);

  const hasAtLeastOneMetric = Object.values(userScores).some(
    (score) => score > 0
  );

  // --- UPDATED --- Submission logic uses the new hook
  const handleSubmit = async () => {
    if (!hasAtLeastOneMetric || submittingScores) return;

    const scoresToSubmit = Object.entries(userScores)
      .filter(([, score]) => score > 0)
      .map(([metricId, score]) => ({
        metric: metricId,
        score: score,
      }));

    try {
      await submitScores({
        user: currentUser._id,
        case: caseId,
        scores: scoresToSubmit,
      });
      onSuccessfulSubmit(); // Trigger refetch on parent page
      onClose();
    } catch (e) {
      console.error("Submission failed", e);
      // Optionally show an error message to the user
      alert(`Грешка при изпращане на оценката: ${errorSubmitting?.message}`);
    }
  };

  const getMetricName = (metricId: string) => {
    if (metricId === "Overall") return "Общо разпределение";
    return ratingMetrics.find((m) => m._id === metricId)?.name || "Metric";
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Tooltip.Provider>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-overlayShow" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none overflow-y-auto max-h-[90vh] custom-scrollbar"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
              Оценка за Сигнал #{caseNumber}
            </Dialog.Title>

            {(loadingMetrics || loadingScores) && (
              <PageStatusDisplay
                loading
                message="Зареждане на данни за оценка..."
              />
            )}
            {(errorMetrics || errorScores) && (
              <PageStatusDisplay error={errorMetrics || errorScores} />
            )}

            {!loadingMetrics &&
              !loadingScores &&
              !errorMetrics &&
              !errorScores && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Side: User Input Form */}
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 order-2 md:order-1">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Вашата оценка<span className="text-red-500">*</span>
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          (поне една метрика)
                        </span>
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Оценете по един или повече от критериите по-долу.
                      </p>
                      {ratingMetrics.map((metric, index) => {
                        const currentScore = userScores[metric._id] || 0;
                        return (
                          <div key={metric._id} className="mt-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <label className="text-sm font-medium text-gray-700">
                                {metric.name}
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
                                    <RatingHintContent metric={metric} />
                                    <Tooltip.Arrow className="fill-gray-900" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            </div>
                            <div className="flex items-center gap-2">
                              <div ref={index === 0 ? firstStarRef : undefined}>
                                <StarRatingInput
                                  value={currentScore}
                                  onChange={(val) =>
                                    setUserScores((p) => ({
                                      ...p,
                                      [metric._id]: val,
                                    }))
                                  }
                                  size="h-6 w-6"
                                />
                              </div>
                              {currentScore > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUserScores((p) => ({
                                      ...p,
                                      [metric._id]: 0,
                                    }))
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
                      Оценки от общността
                    </h3>
                    {caseScores.length > 0 ? (
                      <>
                        <div className="text-center p-3 rounded-lg bg-gray-100">
                          <p className="text-sm font-semibold text-gray-600">
                            Средна оценка
                          </p>
                          <p className="text-3xl font-bold text-gray-800">
                            {calculatedAverage.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            от {caseScores.length} подадени оценки
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Разпределение за:{" "}
                            {getMetricName(activeDistribution)}
                          </h4>
                          <RatingDistributionChart
                            distribution={
                              distributions[activeDistribution] || {}
                            }
                            totalRatings={Object.values(
                              distributions[activeDistribution] || {}
                            ).reduce((a, b) => a + b, 0)}
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
                              {caseScores.length > 0 ? (
                                <ul className="space-y-2">
                                  {caseScores.map((s) => (
                                    <li
                                      key={s._id}
                                      className={`flex justify-between items-center text-xs px-2 py-1 rounded ${
                                        s.user._id === currentUser._id
                                          ? "bg-blue-100 text-blue-800 font-semibold"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      <span className="truncate pr-2">
                                        {s.user.name}
                                        {s.user._id === currentUser._id &&
                                          " (Вие)"}
                                      </span>
                                      <ReadOnlyStars score={s.score} />
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 text-center p-2">
                                  Няма оценки.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mt-4 mb-2">
                            Разбивка по критерии
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => setActiveDistribution("Overall")}
                              className={`w-full flex justify-between items-center text-sm p-2 rounded-md transition-colors ${
                                activeDistribution === "Overall"
                                  ? "bg-blue-100 text-blue-800"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-semibold">Общо</span>
                            </button>
                            <hr className="my-1 border-gray-200" />
                            {ratingMetrics.map((metric) => (
                              <button
                                key={metric._id}
                                onClick={() =>
                                  setActiveDistribution(metric._id)
                                }
                                className={`w-full flex justify-between items-center text-sm p-2 rounded-md transition-colors ${
                                  activeDistribution === metric._id
                                    ? "bg-blue-100 text-blue-800"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <span className="font-semibold">
                                  {metric.name}
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-bold">
                                    {(
                                      allMetricsData[metric._id]?.average || 0
                                    ).toFixed(1)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({allMetricsData[metric._id]?.count || 0})
                                  </span>
                                </div>
                              </button>
                            ))}
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
              )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Отказ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasAtLeastOneMetric || submittingScores}
                className={`rounded px-4 py-2 text-sm font-medium text-white transition-colors ${
                  !hasAtLeastOneMetric
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-70 disabled:cursor-wait`}
              >
                {submittingScores ? "Изпращане..." : "Изпрати"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Tooltip.Provider>
    </Dialog.Root>
  );
};

export default RateCaseModal;
