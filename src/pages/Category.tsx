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

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();
  const { loading, error, category } = useGetCategoryByName(
    categoryNameFromParams
  );
  const [visibleCasesCount, setVisibleCasesCount] = useState(
    INITIAL_VISIBLE_CASES
  );
  const [activeStatsView, setActiveStatsView] = useState<"status" | "type">(
    "status"
  ); // State for active tab

  const scrollableCasesListRef = useRef<HTMLDivElement>(null); // For potential scroll restoration

  useEffect(() => {
    setVisibleCasesCount(INITIAL_VISIBLE_CASES);
    setActiveStatsView("status"); // Reset to default tab when category changes
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
        openSignals: 0,
        closedSignals: 0,
        resolutionTimeInfo: "N/A", // Corrected: Use consistent naming for initialization
        statusPieChartData: [], // Explicitly named for clarity
        problemCasesCount: 0,
        suggestionCasesCount: 0,
        typePieChartData: [],
      };
    }

    const totalSignals = category.cases.length;
    const openSignals = category.cases.filter((c) =>
      ["OPEN", "IN_PROGRESS", "AWAITING_FINANCE"].includes(
        String(c.status).toUpperCase()
      )
    ).length;
    const closedSignals = category.cases.filter(
      (c) => String(c.status).toUpperCase() === "CLOSED"
    ).length;

    const statusCounts = category.cases.reduce((acc, currCase) => {
      const statusKey = String(currCase.status).toUpperCase();
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusPieChartData = Object.entries(statusCounts).map(
      ([label, value]) => ({
        label,
        value,
        color: getStatusStyle(label).hexColor,
      })
    );

    const resolutionTimeInfo =
      totalSignals > 0 && closedSignals > 0
        ? "Данни за изчисление"
        : "Няма данни";

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
      openSignals,
      closedSignals,
      resolutionTimeInfo,
      statusPieChartData,
      problemCasesCount,
      suggestionCasesCount,
      typePieChartData,
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
    let accumulatedPercentage = 0;
    return signalStats.statusPieChartData.map((segment, index) => {
      const percentage = (segment.value / totalStatusPieValue) * 100;
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
      {/* Header as per user's latest provided code */}
      {category.archived && (
        <header className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {category.name ? category.name.toUpperCase() : "Категория"}
          </h1> */}

          <span className="ml-2 text-xl font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
            Архивирана Категория
          </span>
        </header>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              {" "}
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                {" "}
                <UserGroupIcon className="h-6 w-6 mr-2 text-indigo-600" />{" "}
                Експерти{" "}
              </h3>{" "}
              {category.experts && category.experts.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-600">
                  {" "}
                  {category.experts.map((expert: IUser) => (
                    <li key={expert._id}>
                      {" "}
                      <UserLink user={expert} type="table" />{" "}
                    </li>
                  ))}{" "}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Няма посочени експерти.</p>
              )}{" "}
            </div>
            <div>
              {" "}
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                {" "}
                <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600" />{" "}
                Мениджъри{" "}
              </h3>{" "}
              {category.managers && category.managers.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-600">
                  {" "}
                  {category.managers.map((manager: IUser) => (
                    <li key={manager._id}>
                      {" "}
                      <UserLink user={manager} type="table" />{" "}
                    </li>
                  ))}{" "}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  {" "}
                  Няма посочени мениджъри.{" "}
                </p>
              )}{" "}
            </div>
            <div>
              {" "}
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                {" "}
                <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />{" "}
                Предложение{" "}
              </h3>{" "}
              {category.suggestion ? (
                <div
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: category.suggestion }}
                />
              ) : (
                <p className="text-sm text-gray-500">Няма информация.</p>
              )}{" "}
            </div>
            <div>
              {" "}
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                {" "}
                <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />{" "}
                Проблем{" "}
              </h3>{" "}
              {category.problem ? (
                <div
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: category.problem }}
                />
              ) : (
                <p className="text-sm text-gray-500">Няма информация.</p>
              )}{" "}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
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
                                {" "}
                                <CaseLink
                                  my_case={caseItem}
                                  t={(key) =>
                                    t(key, { caseId: caseItem.case_number })
                                  }
                                />{" "}
                              </div>
                              <span
                                className={`flex items-center font-medium ${priorityStyle} flex-shrink-0 min-w-[100px]`}
                              >
                                {" "}
                                <FlagIcon className="h-4 w-4 mr-1 flex-shrink-0" />{" "}
                                {translatePriority(String(caseItem.priority))}{" "}
                              </span>
                              <span
                                className={`flex items-center font-medium flex-shrink-0 min-w-[130px]`}
                              >
                                {" "}
                                <span
                                  className={`h-2.5 w-2.5 rounded-full mr-1.5 flex-shrink-0 ${statusStyle.dotBgColor}`}
                                />{" "}
                                <span className={statusStyle.textColor}>
                                  {" "}
                                  {translateStatus(
                                    String(caseItem.status)
                                  )}{" "}
                                </span>{" "}
                              </span>
                              <div
                                className={`flex items-center flex-shrink-0 font-medium min-w-[200px]`}
                              >
                                {" "}
                                <span className="mr-1">Подател: </span>{" "}
                                <UserLink
                                  user={caseItem.creator}
                                  type="table"
                                />{" "}
                              </div>
                              <p className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 min-w-[140px]">
                                {" "}
                                {formatDate(caseItem.date)}{" "}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                              {" "}
                              {caseItem.content}{" "}
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
                      {" "}
                      <button
                        onClick={handleLoadMoreCases}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        {" "}
                        <ArrowDownCircleIcon className="h-5 w-5 mr-2" /> Зареди
                        още...{" "}
                      </button>{" "}
                    </div>
                  )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center text-gray-500">
                {" "}
                <InboxIcon className="h-20 w-20 mb-4 text-gray-400" />{" "}
                <p className="text-xl font-medium">Няма подадени сигнали</p>{" "}
                <p className="text-sm">
                  {" "}
                  Все още няма регистрирани сигнали за тази категория.{" "}
                </p>{" "}
              </div>
            )}
          </div>
        </main>

        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
              <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
              Статистика
            </h3>

            {/* General Stats (Always Visible) */}
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

            {/* Mini-menu for Pie Chart Views */}
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
              </div>
            </div>

            {/* Conditional Display Based on Active Tab */}
            {activeStatsView === "status" && (
              <div className="mt-3">
                {/* Status Counts - Moved here */}
                <div className="space-y-3 text-sm text-gray-600 mb-4">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />{" "}
                      Отворени:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.openSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />{" "}
                      Затворени:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.closedSignals}
                    </strong>
                  </p>
                  {/* TODO add in awaiting_finance count, add in in_progress count */}
                  {/* Resolution time can also stay here if it's general, or move under status view */}
                  <p className="flex p-t-10 items-center justify-between">
                    <span className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />{" "}
                      Резолюция:
                    </span>
                    <strong className="text-gray-800 text-xs">
                      {signalStats.resolutionTimeInfo}{" "}
                      {/* Ensure this is 'resolutionTimeInfo' if you fixed the previous naming */}
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
                      {" "}
                      {statusPieChartSegmentPaths}{" "}
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
                    {" "}
                    Няма данни за диаграмата по статус.{" "}
                  </p>
                )}
              </div>
            )}

            {activeStatsView === "type" && (
              <div className="mt-3">
                {/* Type Counts - Moved here */}
                {(signalStats.problemCasesCount > 0 ||
                  signalStats.suggestionCasesCount > 0) && (
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <p className="flex items-center justify-between">
                      <span className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />{" "}
                        {translateCaseType("PROBLEM")}:
                      </span>
                      <strong className="text-gray-800 text-base">
                        {signalStats.problemCasesCount}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="flex items-center">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-green-500" />{" "}
                        {translateCaseType("SUGGESTION")}:
                      </span>
                      <strong className="text-gray-800 text-base">
                        {signalStats.suggestionCasesCount}
                      </strong>
                    </p>
                  </div>
                )}

                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Разпределение по Тип
                </h4>
                {signalStats.typePieChartData.length > 0 &&
                totalTypePieValue > 0 ? (
                  <div className="w-full">
                    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
                      {" "}
                      {typePieChartSegmentPaths}{" "}
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
                    {" "}
                    Няма данни за диаграмата по тип.{" "}
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
