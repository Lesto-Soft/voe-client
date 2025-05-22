// src/pages/Category.tsx (or your preferred path)
import React, { useEffect, useMemo } from "react";
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
} from "@heroicons/react/24/outline";
import { useGetCategoryById } from "../graphql/hooks/category"; // Actual import path

const Category: React.FC = () => {
  const { id: categoryIdFromParams } = useParams<{ id: string }>();
  const { loading, error, category } = useGetCategoryById(categoryIdFromParams);

  useEffect(() => {
    if (!loading && categoryIdFromParams) {
      if (error) {
        console.error("CategoryPage - Error from hook:", error);
      }
      // Silenced other logs for brevity, uncomment if needed during debugging
      // if (!error && !category) {
      //   console.warn(
      //     `CategoryPage - Category with ID "${categoryIdFromParams}" not found or hook returned no data.`
      //   );
      // }
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
        c.status === "OPEN" ||
        c.status === "IN_PROGRESS" ||
        c.status === "AWAITING_FINANCE"
    ).length;
    const closedSignals = category.cases.filter(
      (c: ICase) => c.status === "CLOSED"
    ).length;

    const statusCounts = category.cases.reduce((acc, currCase) => {
      const statusKey = String(currCase.status);
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(statusCounts).map(
      ([label, value], index) => ({
        label,
        value,
        color: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ][index % 6],
      })
    );

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

  // Common wrapper for loading/error/not-found states to ensure they also respect the calculated height
  const PageStatusWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
      {" "}
      {/* Takes full calculated height */}
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

  const formatPriority = (priority: string) => {
    const map: Record<string, string> = {
      LOW: "Нисък",
      MEDIUM: "Среден",
      HIGH: "Висок",
    };
    return map[priority.toUpperCase()] || priority;
  };

  const formatStatus = (status: string | any) => {
    const statusString = String(status);
    const map: Record<string, string> = {
      OPEN: "Отворен",
      IN_PROGRESS: "В процес",
      AWAITING_FINANCE: "Чака финанси",
      CLOSED: "Затворен",
    };
    return map[statusString.toUpperCase()] || statusString;
  };

  const totalPieValue = signalStats.pieChartData.reduce(
    (sum, segment) => sum + segment.value,
    0
  );

  return (
    // The outermost div of this component now has a calculated height.
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <header className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        {" "}
        {/* This header takes its natural height */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {category.name.toUpperCase()}
        </h1>
        {category.archived && (
          <span className="ml-2 text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
            (Архивирана)
          </span>
        )}
      </header>

      {/* This grid container will take the remaining vertical space due to flex-1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left Panel: Category Details */}
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <UserGroupIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Експерти
              </h3>
              {category.experts && category.experts.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-600">
                  {category.experts.map((expert: IUser) => (
                    <li
                      key={expert._id}
                      className="p-1 hover:bg-indigo-50 rounded"
                    >
                      - {expert.name}
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
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none" // Added prose classes for basic HTML styling
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
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none" // Added prose classes for basic HTML styling
                  dangerouslySetInnerHTML={{ __html: category.problem }}
                />
              ) : (
                <p className="text-sm text-gray-500">Няма информация.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Middle Panel: Signals List */}
        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1">
            {category.cases && category.cases.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {category.cases.map((caseItem) => (
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
                            src={caseItem.creator.avatar} // Ensure this path is correct or handle errors
                            alt={caseItem.creator.name}
                            className="h-full w-full rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none"; /* Or show fallback */
                            }}
                          />
                        ) : (
                          caseItem.creator.name.substring(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className="text-base font-semibold text-indigo-700 hover:text-indigo-800 truncate"
                            title={`Сигнал #${caseItem.case_number}`}
                          >
                            Сигнал #{caseItem.case_number}
                          </p>
                          <p className="text-xs text-gray-500 whitespace-nowrap pl-2">
                            {formatDate(caseItem.date)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                          <span>
                            Приоритет:{" "}
                            <strong className="text-gray-800">
                              {formatPriority(caseItem.priority)}
                            </strong>
                          </span>
                          <span>
                            Статус:{" "}
                            <strong className="text-gray-800">
                              {formatStatus(caseItem.status)}
                            </strong>
                          </span>
                          <span
                            className="sm:col-span-2 truncate"
                            title={`Ангажирал: ${caseItem.creator.name}`}
                          >
                            Ангажирал:{" "}
                            <strong className="text-gray-800">
                              {caseItem.creator.name}
                            </strong>
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                          {caseItem.content}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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

        {/* Right Panel: Statistics */}
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
                  {/* Reverted Pie Chart SVG Logic */}
                  <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
                    {(() => {
                      let accumulatedPercentage = 0;
                      return signalStats.pieChartData.map((segment, index) => {
                        const percentage =
                          totalPieValue > 0
                            ? (segment.value / totalPieValue) * 100
                            : 0;
                        if (percentage === 0) return null;

                        const startAngleDegrees =
                          (accumulatedPercentage / 100) * 360;
                        // Subtract a tiny amount from endAngle if it's exactly 360 to avoid full circle disappearing for single segment
                        let endAngleDegrees =
                          ((accumulatedPercentage + percentage) / 100) * 360;
                        if (percentage === 100) endAngleDegrees -= 0.0001;

                        accumulatedPercentage += percentage;

                        const radius = 45; // Radius of the pie chart
                        const centerX = 50;
                        const centerY = 50;

                        // Convert angles to radians for Math.cos/sin, and adjust for SVG coordinate system (0 degrees is right)
                        const startAngleRad =
                          (startAngleDegrees - 90) * (Math.PI / 180);
                        const endAngleRad =
                          (endAngleDegrees - 90) * (Math.PI / 180);

                        const x1 = centerX + radius * Math.cos(startAngleRad);
                        const y1 = centerY + radius * Math.sin(startAngleRad);
                        const x2 = centerX + radius * Math.cos(endAngleRad);
                        const y2 = centerY + radius * Math.sin(endAngleRad);

                        const largeArcFlag = percentage > 50 ? 1 : 0;

                        const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;

                        return (
                          <path key={index} d={pathData} fill={segment.color} />
                        );
                      });
                    })()}
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
                          {formatStatus(item.label)}:
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
