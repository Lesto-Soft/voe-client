// src/pages/Category.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router";
import { ICategory, ICase, IUser } from "../db/interfaces";

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
  // Consider adding an icon for the Resolution tab button if desired, e.g., CalendarDaysIcon or ScaleIcon
} from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/solid";
import { useGetCategoryByName } from "../graphql/hooks/category";

import UserLink from "../components/global/UserLink";
import CaseLink from "../components/global/CaseLink";
import UserAvatar from "../components/cards/UserAvatar";

const INITIAL_VISIBLE_CASES = 10;

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
  PROBLEM: "#F87171", // Tailwind's red-400
  SUGGESTION: "#4ADE80", // Tailwind's green-400
};

// Define colors for resolution categories - you can adjust these
const RESOLUTION_CATEGORY_COLORS: Record<string, string> = {
  UNDER_1_DAY: "#A7F3D0", // e.g., Tailwind green-200
  UNDER_5_DAYS: "#BAE6FD", // e.g., Tailwind sky-200
  UNDER_10_DAYS: "#FDE68A", // e.g., Tailwind amber-200
  OVER_10_DAYS: "#FECACA", // e.g., Tailwind red-200
};

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

// Helper for translating resolution categories for the legend (if needed, or use labels directly)
const translateResolutionCategory = (categoryLabel: string) => {
  // For now, labels are simple, so direct usage is fine.
  // If more complex translation is needed, implement here.
  return categoryLabel;
};

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();
  const { loading, error, category } = useGetCategoryByName(
    categoryNameFromParams
  );
  const [visibleCasesCount, setVisibleCasesCount] = useState(
    INITIAL_VISIBLE_CASES
  );
  // MODIFIED: Added "resolution" to activeStatsView state
  const [activeStatsView, setActiveStatsView] = useState<
    "status" | "type" | "resolution"
  >("status");

  const scrollableCasesListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCasesCount(INITIAL_VISIBLE_CASES);
    setActiveStatsView("status"); // Default to status tab
  }, [categoryNameFromParams]);

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
        resolutionTimeInfo: "Няма данни", // Default for resolution text
        statusPieChartData: [],
        problemCasesCount: 0,
        suggestionCasesCount: 0,
        typePieChartData: [],
        resolutionPieChartData: [], // ADDED: For resolution pie chart
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
    const awaitingFinanceSignals = statusCounts["AWAITING_FINANCE"] || 0;
    const closedSignalsCount = statusCounts["CLOSED"] || 0;

    const statusPieChartData = Object.entries(statusCounts).map(
      ([label, value]) => ({
        label,
        value,
        color: getStatusStyle(label).hexColor,
      })
    );

    // MOVED: resolutionTimeInfo is now general, not tied only to closed signals for this context
    const resolutionTimeInfo =
      totalSignals > 0 ? "Данни за изчисление" : "Няма данни";

    // ADDED: Placeholder for resolution pie chart data calculation
    // This section will need to be replaced with actual logic based on case resolution times
    const resolutionCategories = [
      {
        label: "До 1 ден",
        key: "UNDER_1_DAY",
        color: RESOLUTION_CATEGORY_COLORS.UNDER_1_DAY,
      },
      {
        label: "До 5 дни",
        key: "UNDER_5_DAYS",
        color: RESOLUTION_CATEGORY_COLORS.UNDER_5_DAYS,
      },
      {
        label: "До 10 дни",
        key: "UNDER_10_DAYS",
        color: RESOLUTION_CATEGORY_COLORS.UNDER_10_DAYS,
      },
      {
        label: "Над 10 дни",
        key: "OVER_10_DAYS",
        color: RESOLUTION_CATEGORY_COLORS.OVER_10_DAYS,
      },
    ];

    // Placeholder counts - replace with actual calculations
    const calculatedResolutionCounts: Record<string, number> = {
      UNDER_1_DAY:
        category.cases.filter((c) => c.status === "CLOSED").length > 2 ? 2 : 0, // Example: 2 cases
      UNDER_5_DAYS:
        category.cases.filter((c) => c.status === "CLOSED").length > 5 ? 3 : 0, // Example: 3 cases
      UNDER_10_DAYS:
        category.cases.filter((c) => c.status === "CLOSED").length > 8 ? 1 : 0, // Example: 1 case
      OVER_10_DAYS:
        category.cases.filter((c) => c.status === "CLOSED").length > 10 ? 4 : 0, // Example: 4 cases
    };

    const resolutionPieChartData = resolutionCategories
      .map((cat) => ({
        label: cat.label,
        value: calculatedResolutionCounts[cat.key] || 0,
        color: cat.color,
      }))
      .filter((segment) => segment.value > 0); // Keep segments even if value is 0 for consistent legend, or filter if preferred

    let problemCasesCount = 0;
    let suggestionCasesCount = 0;
    category.cases.forEach((c) => {
      if (c.type === "PROBLEM") problemCasesCount++;
      else if (c.type === "SUGGESTION") suggestionCasesCount++;
    });

    const typePieChartData = [];
    if (problemCasesCount > 0) {
      typePieChartData.push({
        label: "PROBLEM",
        value: problemCasesCount,
        color: TYPE_COLORS.PROBLEM,
      });
    }
    if (suggestionCasesCount > 0) {
      typePieChartData.push({
        label: "SUGGESTION",
        value: suggestionCasesCount,
        color: TYPE_COLORS.SUGGESTION,
      });
    }

    return {
      totalSignals,
      strictlyOpenSignals,
      inProgressSignals,
      awaitingFinanceSignals,
      closedSignals: closedSignalsCount,
      resolutionTimeInfo,
      statusPieChartData,
      problemCasesCount,
      suggestionCasesCount,
      typePieChartData,
      resolutionPieChartData, // ADDED
    };
  }, [category]);

  const totalStatusPieValue = useMemo(() => {
    return signalStats.statusPieChartData.reduce(
      (sum, segment) => sum + segment.value,
      0
    );
  }, [signalStats.statusPieChartData]);

  const statusPieChartSegmentPaths = useMemo(() => {
    if (!signalStats.statusPieChartData.length || totalStatusPieValue === 0)
      return null;
    // ... (pie chart logic - no changes here)
    let accumulatedPercentage = 0;
    return signalStats.statusPieChartData.map((segment, index) => {
      const percentage = (segment.value / totalStatusPieValue) * 100;
      if (percentage === 0) return null; // Do not render 0% segments
      const startAngleDegrees = (accumulatedPercentage / 100) * 360;
      let endAngleDegrees = ((accumulatedPercentage + percentage) / 100) * 360;
      if (percentage === 100 && startAngleDegrees === 0)
        endAngleDegrees = 359.999; // Full circle fix
      accumulatedPercentage += percentage;
      const radius = 45;
      const centerX = 50;
      const centerY = 50;
      const startAngleRad = (startAngleDegrees - 90) * (Math.PI / 180);
      const endAngleRad = (endAngleDegrees - 90) * (Math.PI / 180);
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
      return (
        <path
          key={`status-pie-segment-${index}`}
          d={pathData}
          fill={segment.color}
        />
      );
    });
  }, [signalStats.statusPieChartData, totalStatusPieValue]);

  const totalTypePieValue = useMemo(() => {
    return signalStats.typePieChartData.reduce(
      (sum, segment) => sum + segment.value,
      0
    );
  }, [signalStats.typePieChartData]);

  const typePieChartSegmentPaths = useMemo(() => {
    if (!signalStats.typePieChartData.length || totalTypePieValue === 0)
      return null;
    // ... (pie chart logic - no changes here)
    let accumulatedPercentage = 0;
    return signalStats.typePieChartData.map((segment, index) => {
      const percentage = (segment.value / totalTypePieValue) * 100;
      if (percentage === 0) return null;
      const startAngleDegrees = (accumulatedPercentage / 100) * 360;
      let endAngleDegrees = ((accumulatedPercentage + percentage) / 100) * 360;
      if (percentage === 100 && startAngleDegrees === 0)
        endAngleDegrees = 359.999;
      accumulatedPercentage += percentage;
      const radius = 45;
      const centerX = 50;
      const centerY = 50;
      const startAngleRad = (startAngleDegrees - 90) * (Math.PI / 180);
      const endAngleRad = (endAngleDegrees - 90) * (Math.PI / 180);
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
      return (
        <path
          key={`type-pie-segment-${index}`}
          d={pathData}
          fill={segment.color}
        />
      );
    });
  }, [signalStats.typePieChartData, totalTypePieValue]);

  // ADDED: useMemo hooks for Resolution Pie Chart
  const totalResolutionPieValue = useMemo(() => {
    return signalStats.resolutionPieChartData.reduce(
      (sum, segment) => sum + segment.value,
      0
    );
  }, [signalStats.resolutionPieChartData]);

  const resolutionPieChartSegmentPaths = useMemo(() => {
    if (
      !signalStats.resolutionPieChartData.length ||
      totalResolutionPieValue === 0
    )
      return null;
    let accumulatedPercentage = 0;
    return signalStats.resolutionPieChartData.map((segment, index) => {
      const percentage = (segment.value / totalResolutionPieValue) * 100;
      if (percentage === 0 && totalResolutionPieValue > 0) return null; // Don't draw 0% if other segments exist
      const startAngleDegrees = (accumulatedPercentage / 100) * 360;
      let endAngleDegrees = ((accumulatedPercentage + percentage) / 100) * 360;
      if (percentage === 100 && startAngleDegrees === 0)
        endAngleDegrees = 359.999;
      accumulatedPercentage += percentage;
      const radius = 45;
      const centerX = 50;
      const centerY = 50;
      const startAngleRad = (startAngleDegrees - 90) * (Math.PI / 180);
      const endAngleRad = (endAngleDegrees - 90) * (Math.PI / 180);
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
      return (
        <path
          key={`resolution-pie-segment-${index}`}
          d={pathData}
          fill={segment.color}
        />
      );
    });
  }, [signalStats.resolutionPieChartData, totalResolutionPieValue]);

  // ... PageStatusWrapper, loading/error/no-category checks, formatDate, translatePriority, handleLoadMoreCases, currentlyVisibleCases remain the same ...
  const PageStatusWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
      {" "}
      {children}{" "}
    </div>
  );
  if (loading) {
    return (
      <PageStatusWrapper>
        {" "}
        <div className="p-6 text-center text-gray-700">
          {" "}
          Зареждане на данните за категорията...{" "}
        </div>{" "}
      </PageStatusWrapper>
    );
  }
  if (error) {
    return (
      <PageStatusWrapper>
        {" "}
        <div className="p-6 text-red-600 bg-red-100 border border-red-300 rounded-lg shadow-md text-center">
          {" "}
          <p className="font-semibold">Грешка при зареждане:</p>{" "}
          <p className="text-sm">{error.message}</p>{" "}
          <p className="text-xs mt-2">
            {" "}
            Моля, проверете конзолата за повече детайли.{" "}
          </p>{" "}
        </div>{" "}
      </PageStatusWrapper>
    );
  }
  if (!category) {
    return (
      <PageStatusWrapper>
        {" "}
        <div className="p-6 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg shadow-md text-center">
          {" "}
          <p className="font-semibold">Категорията не е намерена.</p>{" "}
          <p className="text-sm">
            {" "}
            Уверете се, че името ({categoryNameFromParams || "липсва"}) е
            валидно и данните са налични.{" "}
          </p>{" "}
          <p className="text-xs mt-2">
            {" "}
            Ако заявката е изпълнена, но категорията не е намерена, проверете
            конзолата.{" "}
          </p>{" "}
        </div>{" "}
      </PageStatusWrapper>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Intl.DateTimeFormat("bg-BG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };
  const translatePriority = (priority: string) => {
    const map: Record<string, string> = {
      LOW: "Нисък",
      MEDIUM: "Среден",
      HIGH: "Висок",
    };
    return map[priority.toUpperCase()] || priority;
  };
  const handleLoadMoreCases = () => {
    setVisibleCasesCount((prevCount) => prevCount + 10);
  };
  const currentlyVisibleCases = category.cases
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
        {/* CORRECTED: lg:col-span-3 for the left aside */}
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-y-0 sm:gap-x-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                  <UserGroupIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Експерти
                </h3>
                {category.experts && category.experts.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {category.experts.map((expert: IUser) => (
                      <li key={expert._id}>
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
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                  <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Мениджъри
                </h3>
                {category.managers && category.managers.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {category.managers.map((manager: IUser) => (
                      <li key={manager._id}>
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
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                {/* User's latest version of icon color for Предложение */}
                <LightBulbIcon className="h-6 w-6 mr-2 text-green-500" />
                Предложение
              </h3>
              {category.suggestion ? (
                <div
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: category.suggestion }}
                />
              ) : (
                <p className="text-sm text-gray-500">Няма информация.</p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
                Проблем
              </h3>
              {category.problem ? (
                <div
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: category.problem }}
                />
              ) : (
                <p className="text-sm text-gray-500">Няма информация.</p>
              )}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          {/* ... main content structure ... */}
          <div ref={scrollableCasesListRef} className="overflow-y-auto flex-1">
            {category.cases && category.cases.length > 0 ? (
              <>
                <ul className="divide-y-2 divide-gray-200">
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
                        <div className="flex items-start space-x-3">
                          <UserAvatar
                            name={caseItem.creator.name || "Unknown User"}
                            imageUrl={creatorImageUrl}
                            size={40}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                              <div className="min-w-[80px] flex-shrink-0">
                                <CaseLink
                                  my_case={caseItem}
                                  t={(key) =>
                                    t(key, { caseId: caseItem.case_number })
                                  }
                                />
                              </div>
                              <span
                                className={`flex items-center font-medium ${priorityStyle} flex-shrink-0 min-w-[100px]`}
                              >
                                <FlagIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                {translatePriority(String(caseItem.priority))}
                              </span>
                              <span
                                className={`flex items-center font-medium flex-shrink-0 min-w-[130px]`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-full mr-1.5 flex-shrink-0 ${statusStyle.dotBgColor}`}
                                />
                                <span className={statusStyle.textColor}>
                                  {translateStatus(String(caseItem.status))}
                                </span>
                              </span>
                              <div
                                className={`flex items-center flex-shrink-0 font-medium min-w-[200px]`}
                              >
                                <span className="mr-1">Подател: </span>
                                <UserLink
                                  user={caseItem.creator}
                                  type="table"
                                />
                              </div>
                              <p className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 min-w-[140px]">
                                {formatDate(caseItem.date)}
                              </p>
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

        {/* CORRECTED: lg:col-span-3 for the statistics aside */}
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
              <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
              Статистика
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

            {/* MODIFIED: Added "Resolution" tab button */}
            <div className="mt-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveStatsView("status")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150
                    ${
                      activeStatsView === "status"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                    }`}
                >
                  По Статус
                </button>
                <button
                  onClick={() => setActiveStatsView("type")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150
                    ${
                      activeStatsView === "type"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                    }`}
                >
                  По Тип
                </button>
                <button
                  onClick={() => setActiveStatsView("resolution")}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150
                    ${
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
                {/* MODIFIED: Removed Resolution line from here, min-h-40 remains */}
                <div className="space-y-3 text-sm text-gray-600 mb-4 min-h-40">
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
                    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
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
                  className={`space-y-3 text-sm text-gray-600 mb-4 min-h-40 ${
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
                          <LightBulbIcon className="h-5 w-5 mr-2 text-green-500" />{" "}
                          {/* Consistent with left panel */}
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
                    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
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

            {/* ADDED: Resolution Tab Content */}
            {activeStatsView === "resolution" && (
              <div className="mt-3">
                <div className="space-y-3 text-sm text-gray-600 mb-4 min-h-40">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
                      Средно време за затваряне:
                    </span>
                    <strong className="text-gray-800 text-xs">
                      {signalStats.resolutionTimeInfo}
                    </strong>
                  </p>
                  {/* You can add more specific resolution time text stats here if needed */}
                </div>

                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  (Примерно) Разпределение по Време
                </h4>
                {signalStats.resolutionPieChartData.length > 0 &&
                totalResolutionPieValue > 0 ? (
                  <div className="w-full">
                    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
                      {resolutionPieChartSegmentPaths}
                    </svg>
                    <ul className="text-xs mt-4 space-y-1">
                      {signalStats.resolutionPieChartData.map((item) => (
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
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Няма данни за диаграмата по резолюция.
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
