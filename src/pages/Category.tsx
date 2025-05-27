// src/pages/Category.tsx (or your preferred path)
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router"; // Ensure this is react-router-dom
import { ICategory, ICase, IUser } from "../db/interfaces"; // Actual import path

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
} from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/solid"; // Added FlagIcon
import { useGetCategoryById } from "../graphql/hooks/category"; // Actual import path

// Import custom Link components
import UserLink from "../components/global/UserLink";
import CaseLink from "../components/global/CaseLink";

const INITIAL_VISIBLE_CASES = 10;

// Mock t function for CaseLink, replace with your actual i18n setup if available
const t = (key: string, options?: any) => {
  if (key === "details_for" && options?.caseId) {
    return `Детайли за ${options.caseId}`;
  }
  return key;
};

// Define status colors (hex values corresponding to Tailwind classes)
// These will be used for both pie chart and can be referenced for status dots if needed directly.
const STATUS_COLORS: Record<string, string> = {
  OPEN: "#22C55E", // Tailwind green-500
  CLOSED: "#9CA3AF", // Tailwind gray-400
  IN_PROGRESS: "#EAB308", // Tailwind yellow-500
  AWAITING_FINANCE: "#3B82F6", // Tailwind blue-500
  DEFAULT: "#9CA3AF", // Default/fallback color (gray-400)
};

// Style helper functions (can be moved to a separate file and imported)
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

const Category: React.FC = () => {
  const { id: categoryIdFromParams } = useParams<{ id: string }>();
  const { loading, error, category } = useGetCategoryById(categoryIdFromParams);

  const [visibleCasesCount, setVisibleCasesCount] = useState(
    INITIAL_VISIBLE_CASES
  );

  useEffect(() => {
    setVisibleCasesCount(INITIAL_VISIBLE_CASES);
  }, [categoryIdFromParams]);

  useEffect(() => {
    if (!loading && categoryIdFromParams) {
      if (error) {
        console.error("CategoryPage - Error from hook:", error);
      }
    }
  }, [loading, categoryIdFromParams, category, error]);

  const signalStats = useMemo(() => {
    if (!category || !category.cases) {
      return {
        totalSignals: 0,
        openSignals: 0,
        closedSignals: 0,
        averageResolutionTimeInfo: "N/A",
        pieChartData: [],
      };
    }

    const totalSignals = category.cases.length;
    const openSignals = category.cases.filter(
      (c: ICase) =>
        String(c.status).toUpperCase() === "OPEN" ||
        String(c.status).toUpperCase() === "IN_PROGRESS" ||
        String(c.status).toUpperCase() === "AWAITING_FINANCE"
    ).length;
    const closedSignals = category.cases.filter(
      (c: ICase) => String(c.status).toUpperCase() === "CLOSED"
    ).length;

    const statusCounts = category.cases.reduce((acc, currCase) => {
      const statusKey = String(currCase.status).toUpperCase();
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(statusCounts).map(([label, value]) => ({
      // Removed index as it's not needed for color mapping anymore
      label,
      value,
      // Use hexColor from getStatusStyle for consistency
      color: getStatusStyle(label).hexColor,
    }));

    const resolutionTimeInfo =
      totalSignals > 0 && closedSignals > 0
        ? "Данни за изчисление"
        : "Няма данни";

    return {
      totalSignals,
      openSignals,
      closedSignals,
      averageResolutionTimeInfo: resolutionTimeInfo,
      pieChartData,
    };
  }, [category]);

  const totalPieValue = signalStats.pieChartData.reduce(
    (sum, segment) => sum + segment.value,
    0
  );

  const pieChartPaths = useMemo(() => {
    if (!signalStats.pieChartData.length || totalPieValue === 0) {
      return null;
    }
    let accumulatedPercentage = 0;
    return signalStats.pieChartData.map((segment, index) => {
      const percentage = (segment.value / totalPieValue) * 100;
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
        <path key={`pie-segment-${index}`} d={pathData} fill={segment.color} />
      );
    });
  }, [signalStats.pieChartData, totalPieValue]);

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
            Уверете се, че ID ({categoryIdFromParams || "липсва"}) е валидно и
            данните са налични.
          </p>
          <p className="text-xs mt-2">
            Ако заявката е изпълнена, но категорията не е намерена, проверете
            конзолата.
          </p>
        </div>
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

  const handleLoadMoreCases = () => {
    setVisibleCasesCount((prevCount) => prevCount + 10);
  };

  const currentlyVisibleCases = category.cases
    ? category.cases.slice(0, visibleCasesCount)
    : [];

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <header className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {category.name.toUpperCase()}
        </h1>
        {category.archived && (
          <span className="ml-2 text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
            (Архивирана)
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                <p className="text-sm text-gray-500">Няма посочени експерти.</p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />
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
          <div className="overflow-y-auto flex-1">
            {category.cases && category.cases.length > 0 ? (
              <>
                <ul className="divide-y divide-gray-200">
                  {currentlyVisibleCases.map((caseItem) => {
                    const statusStyle = getStatusStyle(String(caseItem.status));
                    const priorityStyle = getPriorityStyle(
                      String(caseItem.priority)
                    );
                    return (
                      <li
                        key={caseItem._id}
                        className="p-4 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold"
                            title={caseItem.creator.name}
                          >
                            {caseItem.creator.avatar ? (
                              <img
                                src={caseItem.creator.avatar}
                                alt={caseItem.creator.name}
                                className="h-full w-full rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              caseItem.creator.name
                                .substring(0, 1)
                                .toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Combined metadata line */}
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
                                className={`flex items-center font-medium ${priorityStyle} flex-shrink-0`}
                              >
                                <FlagIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                {translatePriority(String(caseItem.priority))}
                              </span>
                              <span className="flex items-center font-medium flex-shrink-0">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full mr-1.5 flex-shrink-0 ${statusStyle.dotBgColor}`}
                                />
                                <span className={statusStyle.textColor}>
                                  {translateStatus(String(caseItem.status))}
                                </span>
                              </span>
                              <div className="flex items-center flex-shrink-0">
                                <span className="mr-1">Ангажирал:</span>
                                <UserLink
                                  user={caseItem.creator}
                                  type="table"
                                />
                              </div>
                              <p className="text-xs text-gray-500 whitespace-nowrap ml-auto flex-shrink-0">
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
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                      >
                        <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                        Зареди още...
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
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-0 flex items-center">
              <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
              Статистика
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center justify-between">
                <span className="flex items-center">
                  <ListBulletIcon className="h-5 w-5 mr-2 text-blue-500" /> Общо
                  сигнали:
                </span>{" "}
                <strong className="text-gray-800 text-base">
                  {signalStats.totalSignals}
                </strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />{" "}
                  Отворени:
                </span>{" "}
                <strong className="text-gray-800 text-base">
                  {signalStats.openSignals}
                </strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="flex items-center">
                  <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />{" "}
                  Затворени:
                </span>{" "}
                <strong className="text-gray-800 text-base">
                  {signalStats.closedSignals}
                </strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />{" "}
                  Резолюция:
                </span>{" "}
                <strong className="text-gray-800 text-xs">
                  {signalStats.averageResolutionTimeInfo}
                </strong>
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-700 mt-2 mb-3">
                Разпределение по Статус
              </h4>
              {signalStats.pieChartData.length > 0 && totalPieValue > 0 ? (
                <div className="w-full">
                  <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
                    {pieChartPaths}
                  </svg>
                  <ul className="text-xs mt-4 space-y-1">
                    {signalStats.pieChartData.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between px-2"
                      >
                        <span className="flex items-center">
                          <span
                            className="h-2.5 w-2.5 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          {translateStatus(item.label)}:
                        </span>
                        <span>
                          {" "}
                          {item.value} (
                          {totalPieValue > 0
                            ? ((item.value / totalPieValue) * 100).toFixed(1)
                            : 0}
                          %){" "}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {" "}
                  Няма данни за диаграмата.{" "}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Category;
