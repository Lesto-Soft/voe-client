// src/pages/Category.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { useParams } from "react-router";
import { /*ICategory,*/ ICase, IUser, IAnswer } from "../db/interfaces";
import ShowDate from "../components/global/ShowDate";

import {
  UserGroupIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  ChartPieIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InboxIcon,
  DocumentTextIcon,
  ArrowDownCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/solid";
import { useGetCategoryByName } from "../graphql/hooks/category";

import UserLink from "../components/global/UserLink";
import CaseLink from "../components/global/CaseLink";
import UserAvatar from "../components/cards/UserAvatar";

const INITIAL_VISIBLE_CASES = 10;
const SESSION_STORAGE_PREFIX = "categoryScrollState_";

const getStorageKey = (categoryName: string | undefined): string | null =>
  categoryName ? `${SESSION_STORAGE_PREFIX}${categoryName}` : null;

const t = (key: string, options?: any) => {
  if (key === "details_for" && options?.caseId) {
    return `Детайли за ${options.caseId}`;
  }
  return key;
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#22C55E",
  CLOSED: "#9CA3AF",
  IN_PROGRESS: "#EAB308",
  AWAITING_FINANCE: "#3B82F6",
  DEFAULT: "#9CA3AF",
};

const TYPE_COLORS: Record<string, string> = {
  PROBLEM: "#F87171",
  SUGGESTION: "#4ADE80",
};

const RESOLUTION_CATEGORY_CONFIG = [
  { label: "До 1 ден", key: "UNDER_1_DAY", color: "#A7F3D0" },
  { label: "До 5 дни", key: "UNDER_5_DAYS", color: "#BAE6FD" },
  { label: "До 10 дни", key: "UNDER_10_DAYS", color: "#FDE68A" },
  { label: "Над 10 дни", key: "OVER_10_DAYS", color: "#FECACA" },
] as const;

type ResolutionCategoryKey = (typeof RESOLUTION_CATEGORY_CONFIG)[number]["key"];

const getStatusStyle = (status: string) => {
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case "OPEN":
      return {
        dotBgColor: "bg-green-500",
        textColor: "text-green-700",
        hexColor: STATUS_COLORS.OPEN,
      };
    case "CLOSED":
      return {
        dotBgColor: "bg-gray-400",
        textColor: "text-gray-600",
        hexColor: STATUS_COLORS.CLOSED,
      };
    case "IN_PROGRESS":
      return {
        dotBgColor: "bg-yellow-500",
        textColor: "text-yellow-700",
        hexColor: STATUS_COLORS.IN_PROGRESS,
      };
    case "AWAITING_FINANCE":
      return {
        dotBgColor: "bg-blue-500",
        textColor: "text-blue-700",
        hexColor: STATUS_COLORS.AWAITING_FINANCE,
      };
    default:
      return {
        dotBgColor: "bg-gray-400",
        textColor: "text-gray-500",
        hexColor: STATUS_COLORS.DEFAULT,
      };
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority.toUpperCase()) {
    case "LOW":
      return "text-green-600";
    case "HIGH":
      return "text-red-600";
    case "MEDIUM":
      return "text-yellow-600";
    default:
      return "text-gray-500";
  }
};

const translateStatus = (status: string | any) => {
  const statusString = String(status).toUpperCase();
  const map: Record<string, string> = {
    OPEN: "Отворен",
    IN_PROGRESS: "В процес",
    AWAITING_FINANCE: "Чака финанси",
    CLOSED: "Затворен",
  };
  return map[statusString] || statusString;
};

const translateCaseType = (type: string) => {
  const map: Record<string, string> = {
    PROBLEM: "Проблеми",
    SUGGESTION: "Предложения",
  };
  return map[type.toUpperCase()] || type;
};

const translateResolutionCategory = (categoryLabel: string) => categoryLabel;

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();
  const { loading, error, category } = useGetCategoryByName(
    categoryNameFromParams
  );

  const [visibleCasesCount, setVisibleCasesCount] = useState(() => {
    const key = getStorageKey(categoryNameFromParams);
    if (key) {
      try {
        const storedStateJSON = sessionStorage.getItem(key);
        if (storedStateJSON) {
          const storedState = JSON.parse(storedStateJSON);
          if (typeof storedState.count === "number" && storedState.count > 0) {
            return storedState.count;
          }
        }
      } catch (e) {
        console.error(
          "[Initial State] Error reading count from sessionStorage:",
          e
        );
      }
    }
    return INITIAL_VISIBLE_CASES;
  });

  const visibleCasesCountRef = useRef(visibleCasesCount);
  const scrollableCasesListRef = useRef<HTMLDivElement>(null);
  const scrollRestoredForCurrentCategoryInstanceRef = useRef<boolean>(false);

  const [activeStatsView, setActiveStatsView] = useState<
    "status" | "type" | "resolution"
  >("status");
  const [activePersonnelTab, setActivePersonnelTab] = useState<
    "experts" | "managers"
  >("experts");
  const [activeInfoTab, setActiveInfoTab] = useState<"suggestion" | "problem">(
    "suggestion"
  );

  // Keep visibleCasesCountRef updated with the latest state value
  useEffect(() => {
    visibleCasesCountRef.current = visibleCasesCount;
  }, [visibleCasesCount]);

  // Centralized save function
  const saveDataToSessionStorage = (source: string) => {
    if (scrollableCasesListRef.current && categoryNameFromParams) {
      const key = getStorageKey(categoryNameFromParams);
      if (key) {
        const stateToSave = {
          scrollTop: scrollableCasesListRef.current.scrollTop,
          count: visibleCasesCountRef.current, // Always use the ref for the most current count
        };
        try {
          sessionStorage.setItem(key, JSON.stringify(stateToSave));
        } catch (e) {
          console.error(
            `[SaveData - ${source}] Error saving state for ${categoryNameFromParams}:`,
            e
          );
        }
      }
    }
  };

  // Effect for initializing/resetting state when categoryNameFromParams changes
  useEffect(() => {
    const key = getStorageKey(categoryNameFromParams);
    let initialCount = INITIAL_VISIBLE_CASES;
    if (key) {
      try {
        const storedStateJSON = sessionStorage.getItem(key);
        if (storedStateJSON) {
          const storedState = JSON.parse(storedStateJSON);
          if (typeof storedState.count === "number" && storedState.count > 0) {
            initialCount = storedState.count;
          }
        }
      } catch (e) {
        console.error(
          `[Category Change Effect] Error reading count for ${categoryNameFromParams}:`,
          e
        );
      }
    }
    setVisibleCasesCount(initialCount); // This will trigger a re-render

    // Reset other view-specific states
    setActiveStatsView("status");
    setActivePersonnelTab("experts");
    setActiveInfoTab("suggestion");

    // Reset scroll position to top for the new category
    if (scrollableCasesListRef.current) {
      scrollableCasesListRef.current.scrollTop = 0;
    }
    // Mark that scroll has not yet been restored for this new category instance
    scrollRestoredForCurrentCategoryInstanceRef.current = false;
  }, [categoryNameFromParams]);

  // Final Save: Effect to SAVE scroll state on UNMOUNT or when CATEGORY changes
  useEffect(() => {
    return () => {
      // This cleanup runs when categoryNameFromParams changes (for the old category) or on unmount
      saveDataToSessionStorage("FinalSaveCleanup");
    };
  }, [categoryNameFromParams]); // Only depends on categoryNameFromParams

  // Scroll Restoration Logic
  useLayoutEffect(() => {
    if (
      category && // Ensure category data is loaded
      !loading && // Ensure not in a loading state
      scrollableCasesListRef.current &&
      !scrollRestoredForCurrentCategoryInstanceRef.current &&
      visibleCasesCount > 0 // Make sure there's content based on the count
    ) {
      const key = getStorageKey(categoryNameFromParams);
      if (key) {
        try {
          const storedStateJSON = sessionStorage.getItem(key);
          if (storedStateJSON) {
            const storedState = JSON.parse(storedStateJSON);
            if (typeof storedState.scrollTop === "number") {
              scrollableCasesListRef.current.scrollTop = storedState.scrollTop;
              scrollRestoredForCurrentCategoryInstanceRef.current = true;
            }
          }
        } catch (e) {
          console.error(
            "[Restore Scroll LayoutEffect] Error restoring scroll position:",
            e
          );
        }
      }
    }
  }, [category, loading, categoryNameFromParams, visibleCasesCount]);

  // PoC: Save on Wheel (Debounced)
  useEffect(() => {
    const scrollDiv = scrollableCasesListRef.current;
    let debounceTimer: number | undefined;

    const handleDebouncedWheelSave = () => {
      clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        saveDataToSessionStorage("WheelPoC");
      }, 500);
    };

    if (scrollDiv) {
      scrollDiv.addEventListener("wheel", handleDebouncedWheelSave, {
        passive: true,
      });
    }

    return () => {
      if (scrollDiv) {
        scrollDiv.removeEventListener("wheel", handleDebouncedWheelSave);
      }
      clearTimeout(debounceTimer);
    };
  }, [categoryNameFromParams, saveDataToSessionStorage]);

  useEffect(() => {
    if (!loading && categoryNameFromParams && error) {
      console.error("CategoryPage - Error from hook:", error);
    }
  }, [loading, categoryNameFromParams, category, error]);

  const signalStats = useMemo(() => {
    if (!category || !category.cases) {
      return {
        totalSignals: 0,
        strictlyOpenSignals: 0,
        inProgressSignals: 0,
        awaitingFinanceSignals: 0,
        closedSignals: 0,
        statusPieChartData: [],
        problemCasesCount: 0,
        suggestionCasesCount: 0,
        typePieChartData: [],
        effectivelyResolvedCasesCount: 0,
        unresolvedCasesCount: 0,
        resolutionPieChartData: [],
        averageResolutionTime: 0,
      };
    }

    const totalSignals = category.cases.length;

    const statusCounts = category.cases.reduce((acc, currCase) => {
      const statusKey = String(currCase.status).toUpperCase();
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const strictlyOpenSignals = statusCounts["OPEN"] || 0;
    const inProgressSignals = statusCounts["IN_PROGRESS"] || 0;
    const awaitingFinanceSignalsCount = statusCounts["AWAITING_FINANCE"] || 0;
    const closedSignalsCount = statusCounts["CLOSED"] || 0;

    const statusPieChartData = Object.entries(statusCounts).map(
      ([label, value]) => ({
        label,
        value,
        color: getStatusStyle(label).hexColor,
      })
    );

    let problemCasesCount = 0;
    let suggestionCasesCount = 0;
    category.cases.forEach((c) => {
      if (c.type === "PROBLEM") problemCasesCount++;
      else if (c.type === "SUGGESTION") suggestionCasesCount++;
    });
    const typePieChartData = [];
    if (problemCasesCount > 0)
      typePieChartData.push({
        label: "PROBLEM",
        value: problemCasesCount,
        color: TYPE_COLORS.PROBLEM,
      });
    if (suggestionCasesCount > 0)
      typePieChartData.push({
        label: "SUGGESTION",
        value: suggestionCasesCount,
        color: TYPE_COLORS.SUGGESTION,
      });

    const resolutionTimeCounts: Record<ResolutionCategoryKey, number> = {
      UNDER_1_DAY: 0,
      UNDER_5_DAYS: 0,
      UNDER_10_DAYS: 0,
      OVER_10_DAYS: 0,
    };
    let effectivelyResolvedCasesCount = 0;
    let totalResolutionTimeInDays = 0;

    category.cases.forEach((caseItem: ICase) => {
      if (
        caseItem.status === "CLOSED" ||
        caseItem.status === "AWAITING_FINANCE"
      ) {
        effectivelyResolvedCasesCount++;
        let resolvingAnswer: IAnswer | null = null;
        let latestApprovedDateTime: number | null = null;

        if (caseItem.answers && caseItem.answers.length > 0) {
          caseItem.answers.forEach((answer: IAnswer) => {
            if (answer.approved) {
              try {
                const currentApprovedDate = new Date(answer.date);
                if (!isNaN(currentApprovedDate.getTime())) {
                  if (
                    latestApprovedDateTime === null ||
                    currentApprovedDate.getTime() > latestApprovedDateTime
                  ) {
                    latestApprovedDateTime = currentApprovedDate.getTime();
                    resolvingAnswer = answer;
                  }
                }
              } catch (e) {
                /* date parsing error */
              }
            }
          });
        }

        if (resolvingAnswer) {
          const anAnswer = resolvingAnswer as IAnswer;
          const answerDate = anAnswer.date;
          if (answerDate && caseItem.date) {
            try {
              const caseStartDate = new Date(caseItem.date);
              const resolutionActualEndDate = new Date(answerDate);
              if (
                !isNaN(caseStartDate.getTime()) &&
                !isNaN(resolutionActualEndDate.getTime())
              ) {
                const diffTimeMs =
                  resolutionActualEndDate.getTime() - caseStartDate.getTime();
                if (diffTimeMs >= 0) {
                  const diffDays = diffTimeMs / (1000 * 60 * 60 * 24);
                  totalResolutionTimeInDays += diffDays;
                  if (diffDays <= 1) resolutionTimeCounts.UNDER_1_DAY++;
                  else if (diffDays <= 5) resolutionTimeCounts.UNDER_5_DAYS++;
                  else if (diffDays <= 10) resolutionTimeCounts.UNDER_10_DAYS++;
                  else resolutionTimeCounts.OVER_10_DAYS++;
                }
              }
            } catch (e) {
              /* date calculation error */
            }
          }
        }
      }
    });

    const resolutionPieChartData = RESOLUTION_CATEGORY_CONFIG.map(
      (catConfig) => ({
        label: catConfig.label,
        value: resolutionTimeCounts[catConfig.key],
        color: catConfig.color,
      })
    );
    const unresolvedCasesCount = totalSignals - effectivelyResolvedCasesCount;

    const averageResolutionTime =
      effectivelyResolvedCasesCount > 0
        ? totalResolutionTimeInDays / effectivelyResolvedCasesCount
        : 0;

    return {
      totalSignals,
      strictlyOpenSignals,
      inProgressSignals,
      awaitingFinanceSignals: awaitingFinanceSignalsCount,
      closedSignals: closedSignalsCount,
      statusPieChartData,
      problemCasesCount,
      suggestionCasesCount,
      typePieChartData,
      effectivelyResolvedCasesCount,
      unresolvedCasesCount,
      resolutionPieChartData,
      averageResolutionTime,
    };
  }, [category]);

  const totalStatusPieValue = useMemo(
    () =>
      signalStats.statusPieChartData.reduce(
        (sum, segment) => sum + segment.value,
        0
      ),
    [signalStats.statusPieChartData]
  );
  const statusPieChartSegmentPaths = useMemo(() => {
    if (!signalStats.statusPieChartData.length || totalStatusPieValue === 0)
      return null;
    let acc = 0;
    return signalStats.statusPieChartData.map((seg, i) => {
      const perc = (seg.value / totalStatusPieValue) * 100;
      if (perc === 0) return null;
      const saDeg = (acc / 100) * 360;
      let eaDeg = ((acc + perc) / 100) * 360;
      if (perc === 100 && saDeg === 0) eaDeg = 359.999;
      acc += perc;
      const r = 45,
        cx = 50,
        cy = 50;
      const saRad = (saDeg - 90) * (Math.PI / 180);
      const eaRad = (eaDeg - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(saRad);
      const y1 = cy + r * Math.sin(saRad);
      const x2 = cx + r * Math.cos(eaRad);
      const y2 = cy + r * Math.sin(eaRad);
      const laf = perc > 50 ? 1 : 0;
      const pd = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${laf},1 ${x2},${y2} Z`;
      return <path key={`st-pie-${i}`} d={pd} fill={seg.color} />;
    });
  }, [signalStats.statusPieChartData, totalStatusPieValue]);

  const totalTypePieValue = useMemo(
    () =>
      signalStats.typePieChartData.reduce(
        (sum, segment) => sum + segment.value,
        0
      ),
    [signalStats.typePieChartData]
  );
  const typePieChartSegmentPaths = useMemo(() => {
    if (!signalStats.typePieChartData.length || totalTypePieValue === 0)
      return null;
    let acc = 0;
    return signalStats.typePieChartData.map((seg, i) => {
      const perc = (seg.value / totalTypePieValue) * 100;
      if (perc === 0) return null;
      const saDeg = (acc / 100) * 360;
      let eaDeg = ((acc + perc) / 100) * 360;
      if (perc === 100 && saDeg === 0) eaDeg = 359.999;
      acc += perc;
      const r = 45,
        cx = 50,
        cy = 50;
      const saRad = (saDeg - 90) * (Math.PI / 180);
      const eaRad = (eaDeg - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(saRad);
      const y1 = cy + r * Math.sin(saRad);
      const x2 = cx + r * Math.cos(eaRad);
      const y2 = cy + r * Math.sin(eaRad);
      const laf = perc > 50 ? 1 : 0;
      const pd = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${laf},1 ${x2},${y2} Z`;
      return <path key={`ty-pie-${i}`} d={pd} fill={seg.color} />;
    });
  }, [signalStats.typePieChartData, totalTypePieValue]);

  const totalResolutionPieValue = useMemo(
    () =>
      signalStats.resolutionPieChartData.reduce(
        (sum, segment) => sum + segment.value,
        0
      ),
    [signalStats.resolutionPieChartData]
  );
  const resolutionPieChartSegmentPaths = useMemo(() => {
    if (
      !signalStats.resolutionPieChartData.length ||
      totalResolutionPieValue === 0
    )
      return null;
    let acc = 0;
    return signalStats.resolutionPieChartData.map((seg, i) => {
      const perc = (seg.value / totalResolutionPieValue) * 100;
      if (
        perc === 0 &&
        totalResolutionPieValue > 0 &&
        signalStats.resolutionPieChartData.filter((s) => s.value > 0).length > 0
      )
        return null;

      const saDeg = (acc / 100) * 360;
      let eaDeg = ((acc + perc) / 100) * 360;
      if (
        perc === 100 &&
        saDeg === 0 &&
        signalStats.resolutionPieChartData.length === 1
      )
        eaDeg = 359.999;
      else if (eaDeg === saDeg && perc > 0) eaDeg = saDeg + 359.999;

      acc += perc;
      const r = 45,
        cx = 50,
        cy = 50;
      const saRad = (saDeg - 90) * (Math.PI / 180);
      const eaRad = (eaDeg - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(saRad);
      const y1 = cy + r * Math.sin(saRad);
      const x2 = cx + r * Math.cos(eaRad);
      const y2 = cy + r * Math.sin(eaRad);
      const laf = perc > 50 ? 1 : 0;
      const pd = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${laf},1 ${x2},${y2} Z`;
      return <path key={`res-pie-${i}`} d={pd} fill={seg.color} />;
    });
  }, [signalStats.resolutionPieChartData, totalResolutionPieValue]);

  const PageStatusWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
      {children}
    </div>
  );

  if (loading) {
    return (
      <PageStatusWrapper>
        <div className="p-6 text-center text-gray-700">
          Зареждане на данните за категорията...
        </div>
      </PageStatusWrapper>
    );
  }
  if (error) {
    return (
      <PageStatusWrapper>
        <div className="p-6 text-red-600 bg-red-100 border border-red-300 rounded-lg shadow-md text-center">
          <p className="font-semibold">Грешка при зареждане:</p>
          <p className="text-sm">{error.message}</p>
          <p className="text-xs mt-2">
            Моля, проверете конзолата за повече детайли.
          </p>
        </div>
      </PageStatusWrapper>
    );
  }
  if (!category) {
    return (
      <PageStatusWrapper>
        <div className="p-6 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg shadow-md text-center">
          <p className="font-semibold">Категорията не е намерена.</p>
          <p className="text-sm">
            Уверете се, че името ({categoryNameFromParams || "липсва"}) е
            валидно и данните са налични.
          </p>
          <p className="text-xs mt-2">
            Ако заявката е изпълнена, но категорията не е намерена, проверете
            конзолата.
          </p>
        </div>
      </PageStatusWrapper>
    );
  }

  const translatePriority = (priority: string) => {
    const map: Record<string, string> = {
      LOW: "Нисък",
      MEDIUM: "Среден",
      HIGH: "Висок",
    };
    return map[priority.toUpperCase()] || priority;
  };
  const handleLoadMoreCases = () => {
    const currentScrollTop = scrollableCasesListRef.current
      ? scrollableCasesListRef.current.scrollTop
      : 0;

    setVisibleCasesCount((prevCount: number) => {
      const newCount = prevCount + 10;
      if (categoryNameFromParams) {
        const key = getStorageKey(categoryNameFromParams);
        if (key) {
          try {
            const stateToSave = {
              scrollTop: currentScrollTop,
              count: newCount,
            };
            sessionStorage.setItem(key, JSON.stringify(stateToSave));
          } catch (e) {
            console.error(
              `[Load More] Error aggressively saving state for ${categoryNameFromParams}:`,
              e
            );
          }
        }
      }
      return newCount;
    });
  };
  const currentlyVisibleCases = category?.cases
    ? category.cases.slice(0, visibleCasesCount)
    : [];

  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      {category.archived && (
        <header className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
          <span className="ml-2 text-xl font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
            Архивирана Категория
          </span>
        </header>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Personnel Tabs (Experts/Managers) */}
            <div>
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActivePersonnelTab("experts")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                    activePersonnelTab === "experts"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  <UserGroupIcon className="h-5 w-5 mr-1.5 text-indigo-600" />
                  Експерти
                </button>
                <button
                  onClick={() => setActivePersonnelTab("managers")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                    activePersonnelTab === "managers"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  <UserGroupIcon className="h-5 w-5 mr-1.5 text-blue-600" />
                  Мениджъри
                </button>
              </div>
              <div className="mt-4 bg-gray-50 rounded-sm border border-gray-300 min-h-20 lg:h-37 flex flex-col justify-center items-center text-center">
                {activePersonnelTab === "experts" && (
                  <div className="w-full h-full flex flex-col justify-center">
                    {category.experts && category.experts.length > 0 ? (
                      <ul
                        className={`w-full flex flex-wrap gap-2 text-sm text-gray-600 overflow-y-auto max-h-32 lg:max-h-[calc(theme(space.37)-theme(space.2))] px-1 py-1 justify-center items-center`}
                      >
                        {category.experts.map((expert: IUser) => (
                          <li key={expert._id} className="flex">
                            <UserLink user={expert} type="table" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Няма посочени експерти.
                      </p>
                    )}
                  </div>
                )}
                {activePersonnelTab === "managers" && (
                  <div className="w-full h-full flex flex-col justify-center">
                    {category.managers && category.managers.length > 0 ? (
                      <ul
                        className={`w-full flex flex-wrap gap-2 text-sm text-gray-600 overflow-y-auto max-h-32 lg:max-h-[calc(theme(space.37)-theme(space.2))] px-1 py-1 justify-center items-center`}
                      >
                        {category.managers.map((manager: IUser) => (
                          <li key={manager._id} className="flex">
                            <UserLink user={manager} type="table" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Няма посочени мениджъри.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Tabs (Suggestion/Problem) */}
            <div>
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveInfoTab("suggestion")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                    activeInfoTab === "suggestion"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  <LightBulbIcon className="h-5 w-5 mr-1.5 text-green-500" />
                  Предложение
                </button>
                <button
                  onClick={() => setActiveInfoTab("problem")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                    activeInfoTab === "problem"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  <ExclamationTriangleIcon className="h-5 w-5 mr-1.5 text-red-600" />
                  Проблем
                </button>
              </div>
              <div className="mt-4">
                {activeInfoTab === "suggestion" && (
                  <div>
                    {category.suggestion ? (
                      <div
                        className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: category.suggestion,
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Няма информация.</p>
                    )}
                  </div>
                )}
                {activeInfoTab === "problem" && (
                  <div>
                    {category.problem ? (
                      <div
                        className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: category.problem }}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Няма информация.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div ref={scrollableCasesListRef} className="overflow-y-auto flex-1">
            {category.cases && category.cases.length > 0 ? (
              <>
                <ul className="divide-y-3 divide-gray-200">
                  {currentlyVisibleCases.map((caseItem) => {
                    const statusStyle = getStatusStyle(String(caseItem.status));
                    const priorityStyle = getPriorityStyle(
                      String(caseItem.priority)
                    );
                    const serverBaseUrl = import.meta.env.VITE_API_URL || "";
                    const creatorImageUrl = `${serverBaseUrl}/static/avatars/${caseItem.creator._id}/${caseItem.creator.avatar}`;
                    let stripStyleClasses = "";
                    if (caseItem.type === "PROBLEM")
                      stripStyleClasses = "border-l-8 border-l-red-400";
                    else if (caseItem.type === "SUGGESTION")
                      stripStyleClasses = "border-l-8 border-l-green-400";
                    return (
                      <li
                        key={caseItem._id}
                        className={`p-4 hover:bg-gray-100 transition-colors duration-150 ${stripStyleClasses}`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <UserAvatar
                            name={caseItem.creator.name || "Unknown User"}
                            imageUrl={creatorImageUrl}
                            size={40}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 lg:gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                              <div className="lg:min-w-[80px] lg:flex-shrink-0">
                                <CaseLink
                                  my_case={caseItem}
                                  t={(key) =>
                                    t(key, { caseId: caseItem.case_number })
                                  }
                                />
                              </div>
                              <span
                                className={`flex items-center font-medium ${priorityStyle} lg:flex-shrink-0 lg:min-w-[80px]`}
                              >
                                <FlagIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                {translatePriority(String(caseItem.priority))}
                              </span>
                              <span
                                className={`flex items-center font-medium lg:flex-shrink-0 lg:min-w-[120px]`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-full mr-1.5 flex-shrink-0 ${statusStyle.dotBgColor}`}
                                />
                                <span className={statusStyle.textColor}>
                                  {translateStatus(String(caseItem.status))}
                                </span>
                              </span>
                              <div
                                className={`flex items-center font-medium lg:flex-shrink-0 lg:min-w-[200px]`}
                              >
                                <span className="mr-1">Подател: </span>
                                <UserLink
                                  user={caseItem.creator}
                                  type="table"
                                />
                              </div>
                              <div className="text-xs text-gray-500 lg:whitespace-nowrap lg:flex-shrink-0 lg:min-w-[160px]">
                                <ShowDate date={caseItem.date} />
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                              {caseItem.content}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {category.cases &&
                  visibleCasesCount < category.cases.length && (
                    <div className="p-4 flex justify-center">
                      <button
                        onClick={handleLoadMoreCases}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        <ArrowDownCircleIcon className="h-5 w-5 mr-2" /> Зареди
                        още...
                      </button>
                    </div>
                  )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center text-gray-500">
                <InboxIcon className="h-20 w-20 mb-4 text-gray-400" />
                <p className="text-xl font-medium">Няма подадени сигнали</p>
                <p className="text-sm">
                  Все още няма регистрирани сигнали за тази категория.
                </p>
              </div>
            )}
          </div>
        </main>

        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-3 overflow-y-auto flex-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
              <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" /> Статистика
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center justify-between">
                <span className="flex items-center">
                  <ListBulletIcon className="h-5 w-5 mr-2 text-blue-500" /> Общо
                  сигнали:
                </span>
                <strong className="text-gray-800 text-base">
                  {signalStats.totalSignals}
                </strong>
              </p>
            </div>
            <div className="mt-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveStatsView("status")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 ${
                    activeStatsView === "status"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  По Статус
                </button>
                <button
                  onClick={() => setActiveStatsView("type")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 ${
                    activeStatsView === "type"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  По Тип
                </button>
                <button
                  onClick={() => setActiveStatsView("resolution")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 ${
                    activeStatsView === "resolution"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  По Време
                </button>
              </div>
            </div>
            {activeStatsView === "status" && (
              <div className="mt-3">
                <div className="space-y-3 text-sm text-gray-600 mb-2 min-h-35">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                      {translateStatus("OPEN")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.strictlyOpenSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowPathIcon className="h-5 w-5 mr-2 text-yellow-500" />
                      {translateStatus("IN_PROGRESS")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.inProgressSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <BanknotesIcon className="h-5 w-5 mr-2 text-blue-500" />
                      {translateStatus("AWAITING_FINANCE")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.awaitingFinanceSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <XCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                      {translateStatus("CLOSED")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.closedSignals}
                    </strong>
                  </p>
                </div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Разпределение по Статус
                </h4>
                {signalStats.statusPieChartData.length > 0 &&
                totalStatusPieValue > 0 ? (
                  <div className="w-full">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto"
                    >
                      {statusPieChartSegmentPaths}
                    </svg>
                    <ul className="text-xs mt-4 space-y-1">
                      {signalStats.statusPieChartData.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center justify-between px-2"
                        >
                          <span className="flex items-center">
                            <span
                              className="h-2.5 w-2.5 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            {translateStatus(item.label)}:
                          </span>
                          <span>
                            {item.value} (
                            {totalStatusPieValue > 0
                              ? (
                                  (item.value / totalStatusPieValue) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Няма данни за диаграмата по статус.
                  </p>
                )}
              </div>
            )}
            {activeStatsView === "type" && (
              <div className="mt-3">
                <div
                  className={`space-y-3 text-sm text-gray-600 mb-2 min-h-35 ${
                    signalStats.problemCasesCount === 0 &&
                    signalStats.suggestionCasesCount === 0
                      ? "flex items-center justify-center"
                      : ""
                  }`}
                >
                  {signalStats.problemCasesCount > 0 ||
                  signalStats.suggestionCasesCount > 0 ? (
                    <>
                      <p className="flex items-center justify-between">
                        <span className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                          {translateCaseType("PROBLEM")}:
                        </span>
                        <strong className="text-gray-800 text-base">
                          {signalStats.problemCasesCount}
                        </strong>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="flex items-center">
                          <LightBulbIcon className="h-5 w-5 mr-2 text-green-500" />
                          {translateCaseType("SUGGESTION")}:
                        </span>
                        <strong className="text-gray-800 text-base">
                          {signalStats.suggestionCasesCount}
                        </strong>
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      Няма данни за типовете сигнали.
                    </p>
                  )}
                </div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Разпределение по Тип
                </h4>
                {signalStats.typePieChartData.length > 0 &&
                totalTypePieValue > 0 ? (
                  <div className="w-full">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto"
                    >
                      {typePieChartSegmentPaths}
                    </svg>
                    <ul className="text-xs mt-4 space-y-1">
                      {signalStats.typePieChartData.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center justify-between px-2"
                        >
                          <span className="flex items-center">
                            <span
                              className="h-2.5 w-2.5 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            {translateCaseType(item.label)}:
                          </span>
                          <span>
                            {item.value} (
                            {totalTypePieValue > 0
                              ? (
                                  (item.value / totalTypePieValue) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Няма данни за диаграмата по тип.
                  </p>
                )}
              </div>
            )}
            {activeStatsView === "resolution" && (
              <div className="mt-3">
                <div className="space-y-3 text-sm text-gray-600 mb-2 min-h-35">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                      Приключени (за графиката):
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.effectivelyResolvedCasesCount}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />В
                      изчакване/други:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.unresolvedCasesCount}
                    </strong>
                  </p>
                  {signalStats.effectivelyResolvedCasesCount > 0 && (
                    <p className="flex items-center justify-between mt-1">
                      <span className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                        Средно време за резолюция:
                      </span>
                      <strong className="text-gray-800 text-base">
                        {signalStats.averageResolutionTime.toFixed(2)} дни
                      </strong>
                    </p>
                  )}
                </div>

                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Разпределение по Време на Резолюция
                </h4>
                {signalStats.effectivelyResolvedCasesCount > 0 &&
                signalStats.resolutionPieChartData.length > 0 &&
                totalResolutionPieValue > 0 ? (
                  <div className="w-full">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto"
                    >
                      {resolutionPieChartSegmentPaths}
                    </svg>
                    <ul className="text-xs mt-4 space-y-1">
                      {signalStats.resolutionPieChartData.map(
                        (item) =>
                          item.value > 0 && (
                            <li
                              key={item.label}
                              className="flex items-center justify-between px-2"
                            >
                              <span className="flex items-center">
                                <span
                                  className="h-2.5 w-2.5 rounded-full mr-2"
                                  style={{ backgroundColor: item.color }}
                                />
                                {translateResolutionCategory(item.label)}:
                              </span>
                              <span>
                                {item.value} (
                                {totalResolutionPieValue > 0
                                  ? (
                                      (item.value / totalResolutionPieValue) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %)
                              </span>
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Няма данни за диаграмата по време на резолюция.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Category;
