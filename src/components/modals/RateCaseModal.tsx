import React, { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  QuestionMarkCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { IMetricScore, IRatingMetric, IMe, IUser } from "../../db/interfaces";
import {
  useGetAllRatingMetrics,
  useBulkCreateMetricScores,
  useDeleteMetricScore,
} from "../../graphql/hooks/rating";
import RatingDistributionChart from "../charts/RatingDistributionChart";
import PageStatusDisplay from "../global/PageStatusDisplay";
import { ApolloError } from "@apollo/client";
import ConfirmActionDialog from "./ConfirmActionDialog";

type ScoreState = {
  score: number;
  scoreId?: string;
};

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
          className="focus:outline-none transition-transform duration-150 hover:scale-125 hover:cursor-pointer"
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

const ReadOnlyStars: React.FC<{ score: number }> = ({ score }) => {
  const starFillPercentage = Math.max(0, Math.min(100, (score / 5) * 100));
  return (
    <div className="relative flex">
      <div className="flex text-gray-300">
        {[...Array(5)].map((_, i) => (
          <StarSolid key={`bg-${i}`} className="h-4 w-4" />
        ))}
      </div>
      <div
        className="absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap flex"
        style={{ width: `${starFillPercentage}%` }}
      >
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <StarSolid key={`fg-${i}`} className="h-4 w-4" />
          ))}
        </div>
      </div>
    </div>
  );
};

interface RateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseNumber: number;
  currentUser: IMe;
  onSuccessfulSubmit: () => void;
  caseScores: IMetricScore[];
  isLoadingScores: boolean;
  errorScores?: ApolloError | undefined;
}

const RateCaseModal: React.FC<RateCaseModalProps> = ({
  isOpen,
  onClose,
  caseId,
  caseNumber,
  currentUser,
  onSuccessfulSubmit,
  caseScores,
  isLoadingScores,
  errorScores,
}) => {
  const {
    ratingMetrics,
    loading: loadingMetrics,
    error: errorMetrics,
  } = useGetAllRatingMetrics({ skip: !isOpen });
  const {
    submitScores,
    loading: submittingScores,
    error: errorSubmitting,
  } = useBulkCreateMetricScores();
  const {
    deleteScore,
    loading: deletingScore,
    error: errorDeleting,
  } = useDeleteMetricScore();

  const [userScores, setUserScores] = useState<{
    [metricId: string]: ScoreState;
  }>({});
  const [initialUserScores, setInitialUserScores] = useState<{
    [metricId: string]: ScoreState;
  }>({});
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [activeDistribution, setActiveDistribution] =
    useState<string>("Overall");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [activeRatingsView, setActiveRatingsView] = useState<
    "distribution" | "individual"
  >("distribution");

  useEffect(() => {
    if (isOpen) {
      const currentUserExistingScores = caseScores
        .filter((s) => s.user._id === currentUser._id)
        .reduce((acc, score) => {
          acc[score.metric._id] = { score: score.score, scoreId: score._id };
          return acc;
        }, {} as { [metricId: string]: ScoreState });
      setUserScores(currentUserExistingScores);
      setInitialUserScores(currentUserExistingScores);
      setActiveRatingsView("distribution");
    } else {
      setConfirmingDelete(null);
    }
  }, [isOpen, caseScores, currentUser._id]);

  const scoresByMetric = useMemo(() => {
    return caseScores.reduce((acc, score) => {
      const metricId = score.metric._id;
      if (!acc[metricId]) acc[metricId] = [];
      acc[metricId].push(score);
      return acc;
    }, {} as { [key: string]: IMetricScore[] });
  }, [caseScores]);

  const displayData = useMemo(() => {
    if (!caseScores || caseScores.length === 0) {
      return {
        card: {
          title: "Средна оценка",
          average: 0,
          count: 0,
          countText: "подадени оценки",
        },
        distribution: {},
        breakdown: [],
      };
    }
    const scoresByUser = caseScores.reduce((acc, score) => {
      const userId = score.user._id;
      if (!acc[userId]) acc[userId] = { user: score.user, scores: [] };
      acc[userId].scores.push(score.score);
      return acc;
    }, {} as { [key: string]: { user: IUser; scores: number[] } });

    const userAverages = Object.values(scoresByUser).map((data) => {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      return { user: data.user, averageScore: avg };
    });

    const overallAverage =
      userAverages.reduce((acc, val) => acc + val.averageScore, 0) /
      (userAverages.length || 1);

    const sortBreakdown = (breakdown: any[]) => {
      return breakdown.sort((a, b) => {
        if (a.user._id === currentUser._id) return -1;
        if (b.user._id === currentUser._id) return 1;
        return a.user.name.localeCompare(b.user.name);
      });
    };

    if (activeDistribution === "Overall") {
      const sortedAverages = sortBreakdown([...userAverages]);
      return {
        card: {
          title: "Средна оценка",
          average: overallAverage,
          count: userAverages.length,
          countText: "оценили потребители",
        },
        distribution: userAverages.reduce((acc, item) => {
          const rounded = Math.round(item.averageScore);
          acc[rounded] = (acc[rounded] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number }),
        breakdown: sortedAverages.map((item) => ({
          user: item.user,
          score: item.averageScore,
        })),
      };
    } else {
      const relevantScores = scoresByMetric[activeDistribution] || [];
      const sortedScores = sortBreakdown([...relevantScores]);
      const metricInfo = ratingMetrics.find(
        (m: IRatingMetric) => m._id === activeDistribution
      );
      const metricAverage =
        relevantScores.reduce((acc, s) => acc + s.score, 0) /
        (relevantScores.length || 1);

      return {
        card: {
          title: `Средна оценка за ${metricInfo?.name || ""}`,
          average: metricAverage,
          count: relevantScores.length,
          countText: "подадени оценки",
        },
        distribution: relevantScores.reduce((acc, item) => {
          acc[item.score] = (acc[item.score] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number }),
        breakdown: sortedScores.map((item) => ({
          user: item.user,
          score: item.score,
        })),
      };
    }
  }, [
    caseScores,
    activeDistribution,
    ratingMetrics,
    scoresByMetric,
    currentUser._id,
  ]);

  const hasAtLeastOneMetric = useMemo(
    () => Object.values(userScores).some((s) => s.score > 0),
    [userScores]
  );

  const scoresHaveChanged = useMemo(() => {
    const initialKeys = Object.keys(initialUserScores);
    const currentKeys = Object.keys(userScores);
    if (initialKeys.length !== currentKeys.length) return true;
    for (const key of currentKeys) {
      if (initialUserScores[key]?.score !== userScores[key]?.score) return true;
    }
    return false;
  }, [userScores, initialUserScores]);

  const handleClearScore = (metricId: string) => {
    setConfirmingDelete(metricId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmingDelete) return;
    const metricIdToDelete = confirmingDelete;
    setConfirmingDelete(null);
    const scoreState = initialUserScores[metricIdToDelete];
    if (scoreState && scoreState.scoreId) {
      try {
        await deleteScore(scoreState.scoreId);
        onSuccessfulSubmit();
      } catch (e) {
        alert(`Грешка при изтриване на оценка: ${errorDeleting?.message}`);
      }
    } else {
      setUserScores((p) => ({ ...p, [metricIdToDelete]: { score: 0 } }));
    }
  };

  const handleSubmit = async () => {
    if (!scoresHaveChanged || submittingScores || deletingScore) return;
    const scoresToSubmit = Object.entries(userScores)
      .filter(([, s]) => s.score > 0)
      .map(([metricId, s]) => ({ metric: metricId, score: s.score }));
    if (scoresToSubmit.length === 0) {
      setInitialUserScores(userScores);
      return;
    }
    try {
      await submitScores({
        user: currentUser._id,
        case: caseId,
        scores: scoresToSubmit,
      });
      setInitialUserScores(userScores);
      onSuccessfulSubmit();
    } catch (e) {
      console.error("Submission failed", e);
      alert(`Грешка при изпращане на оценката: ${errorSubmitting?.message}`);
    }
  };

  const handleAttemptClose = () => {
    if (scoresHaveChanged) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };
  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleAttemptClose();
        }}
      >
        <Tooltip.Provider>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow" />
            <Dialog.Content
              className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none overflow-y-auto max-h-[90vh] custom-scrollbar-xs"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onEscapeKeyDown={handleAttemptClose}
            >
              <div className="flex justify-between items-start mb-4">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Оценка за Сигнал #{caseNumber}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    onClick={handleAttemptClose}
                    className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors hover:cursor-pointer"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Close>
              </div>

              {/* TODO show skeleton here instead */}
              {/* {(loadingMetrics || isLoadingScores) && (
                <PageStatusDisplay loading message="Зареждане..." />
              )} */}
              {(errorMetrics || errorScores) && (
                <PageStatusDisplay error={errorMetrics || errorScores} />
              )}

              {!loadingMetrics &&
                !isLoadingScores &&
                !errorMetrics &&
                !errorScores && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* LEFT PANEL: USER RATING INPUT */}
                    <div className="flex flex-col p-4 rounded-lg bg-gray-50 border-gray-500 order-2 md:order-1">
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
                        {ratingMetrics.map((metric: IRatingMetric) => {
                          const currentScore = userScores[metric._id] || {
                            score: 0,
                          };
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
                                <div>
                                  <StarRatingInput
                                    value={currentScore.score}
                                    onChange={(val) =>
                                      setUserScores((p) => ({
                                        ...p,
                                        [metric._id]: {
                                          ...p[metric._id],
                                          score: val,
                                        },
                                      }))
                                    }
                                    size="h-6 w-6"
                                  />
                                </div>
                                {currentScore.score > 0 && (
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleClearScore(metric._id)
                                      }
                                      disabled={
                                        deletingScore ||
                                        submittingScores ||
                                        confirmingDelete === metric._id
                                      }
                                      className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center hover:cursor-pointer"
                                      title="Изчисти оценката"
                                    >
                                      <XCircleIcon className="h-5 w-5" />
                                    </button>
                                    {confirmingDelete === metric._id && (
                                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-10 flex flex-col items-center gap-2 whitespace-nowrap bg-white border border-gray-200 rounded-md p-3 shadow-lg animate-fadeIn">
                                        <p className="text-sm font-semibold text-gray-800">
                                          Премахни оценката?
                                        </p>
                                        <div className="flex justify-center gap-3 w-full">
                                          <button
                                            onClick={handleConfirmDelete}
                                            className="cursor-pointer w-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md transition-colors"
                                          >
                                            Да
                                          </button>
                                          <button
                                            onClick={() =>
                                              setConfirmingDelete(null)
                                            }
                                            className="cursor-pointer w-full text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-1.5 rounded-md transition-colors"
                                          >
                                            Не
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-auto pt-4">
                        <button
                          onClick={handleSubmit}
                          disabled={
                            !scoresHaveChanged ||
                            !hasAtLeastOneMetric ||
                            submittingScores ||
                            deletingScore
                          }
                          className={`cursor-pointer w-full rounded px-4 py-2 text-sm text-white transition-colors ${
                            !scoresHaveChanged || !hasAtLeastOneMetric
                              ? "bg-gray-400 font-medium"
                              : "bg-amber-600 hover:bg-amber-700 font-bold"
                          } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                          {submittingScores || deletingScore
                            ? "Обработване..."
                            : "Оцени"}
                        </button>
                      </div>
                    </div>

                    {/* RIGHT PANEL: COMMUNITY RATINGS */}
                    <div className="flex flex-col gap-4 order-1 md:order-2">
                      <div className="text-center p-3 rounded-lg bg-gray-100">
                        <p className="text-sm font-semibold text-gray-600">
                          {displayData.card.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-800">
                          {displayData.card.average.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          от {displayData.card.count}{" "}
                          {displayData.card.countText}
                        </p>
                      </div>

                      {caseScores.length > 0 ? (
                        <>
                          {/* --- SECTION 1: METRIC BREAKDOWN (MOVED HERE) --- */}
                          <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">
                              Разбивка по критерии
                            </h4>
                            <div className="space-y-1">
                              <button
                                onClick={() => setActiveDistribution("Overall")}
                                className={`w-full text-left text-sm p-2 rounded-md transition-colors hover:cursor-pointer ${
                                  activeDistribution === "Overall"
                                    ? "bg-blue-100 text-blue-800 font-bold"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                Общо
                              </button>
                              <hr className="my-1 border-gray-200" />
                              {ratingMetrics.map((metric: IRatingMetric) => {
                                const metricScores =
                                  scoresByMetric[metric._id] || [];
                                const metricAverage =
                                  metricScores.reduce(
                                    (acc, s) => acc + s.score,
                                    0
                                  ) / (metricScores.length || 1);
                                return (
                                  <button
                                    key={metric._id}
                                    onClick={() =>
                                      setActiveDistribution(metric._id)
                                    }
                                    className={`w-full flex justify-between items-center text-sm p-2 rounded-md transition-colors hover:cursor-pointer ${
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
                                        {metricAverage.toFixed(1)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({metricScores.length})
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* --- SECTION 2: COMMUNITY RATINGS --- */}
                          <div>
                            <div>
                              {/* Tab Navigation with CSS Grid */}
                              <div className="grid grid-cols-2 border-b border-gray-200">
                                <button
                                  onClick={() =>
                                    setActiveRatingsView("distribution")
                                  }
                                  className={`py-2 text-center text-sm font-medium transition-colors -mb-px hover:cursor-pointer ${
                                    activeRatingsView === "distribution"
                                      ? "border-b-2 border-blue-600 text-blue-600"
                                      : "text-gray-500 hover:text-blue-600 border-b-2 border-transparent"
                                  }`}
                                >
                                  Разпределение
                                </button>
                                <button
                                  onClick={() =>
                                    setActiveRatingsView("individual")
                                  }
                                  className={`py-2 text-center text-sm font-medium transition-colors -mb-px hover:cursor-pointer ${
                                    activeRatingsView === "individual"
                                      ? "border-b-2 border-blue-600 text-blue-600"
                                      : "text-gray-500 hover:text-blue-600 border-b-2 border-transparent"
                                  }`}
                                >
                                  Индивидуални
                                </button>
                              </div>

                              {/* Tab Content with Fixed Height */}
                              <div className="mt-3 h-40">
                                {activeRatingsView === "distribution" && (
                                  <RatingDistributionChart
                                    distribution={displayData.distribution}
                                    totalRatings={displayData.breakdown.length}
                                  />
                                )}
                                {activeRatingsView === "individual" && (
                                  <div className="h-full overflow-y-auto scrollbar-thin rounded-md bg-gray-50 p-2">
                                    {displayData.breakdown.length > 0 ? (
                                      <ul className="space-y-1">
                                        {displayData.breakdown.map(
                                          (item, index) => (
                                            <li
                                              key={index}
                                              className={`flex justify-between items-center text-xs px-2 py-1.5 rounded ${
                                                item.user._id ===
                                                currentUser._id
                                                  ? "bg-blue-100 text-blue-800 font-semibold"
                                                  : "text-gray-700"
                                              }`}
                                            >
                                              <span className="truncate pr-2">
                                                {item.user.name}
                                                {item.user._id ===
                                                  currentUser._id && " (Вие)"}
                                              </span>
                                              <ReadOnlyStars
                                                score={item.score}
                                              />
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    ) : (
                                      <p className="text-xs text-gray-500 text-center p-2">
                                        Няма индивидуални оценки.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
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
            </Dialog.Content>
          </Dialog.Portal>
        </Tooltip.Provider>
      </Dialog.Root>

      <ConfirmActionDialog
        isOpen={showConfirmClose}
        onOpenChange={setShowConfirmClose}
        onConfirm={handleConfirmClose}
        title="Незапазени промени"
        description="Имате незапазени промени по вашата оценка. Сигурни ли сте, че искате да затворите прозореца?"
        confirmButtonText="Да, затвори"
        cancelButtonText="Не, не затваряй"
        isDestructiveAction={true}
      />
    </>
  );
};

export default RateCaseModal;
