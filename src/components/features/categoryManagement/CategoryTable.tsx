// src/components/features/categoryManagement/CategoryTable.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ICategory,
  IUser,
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../../../db/interfaces";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import Pagination from "../../tables/Pagination";
import CategoryTableSkeleton from "../../skeletons/CategoryTableSkeleton";
import TruncatedListWithDialog from "./TruncatedListWithDialog";
import { isNullOrEmptyArray } from "../../../utils/arrayUtils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import HoverTooltip from "../../global/HoverTooltip";
import CategoryLink from "../../global/links/CategoryLink";
import { Link } from "react-router";
import DataTable, { DataTableColumn } from "../../tables/DataTable";

const BASE_STATUS_BUTTON_STYLE =
  "px-1.5 py-0.5 text-xs font-semibold rounded border transition-colors duration-150";

const CASE_STATUS_STYLES_CLICKABLE: Record<CaseStatus, string> = {
  [CaseStatus.Open]: `${BASE_STATUS_BUTTON_STYLE} bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400`,
  [CaseStatus.InProgress]: `${BASE_STATUS_BUTTON_STYLE} bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400`,
  [CaseStatus.AwaitingFinance]: `${BASE_STATUS_BUTTON_STYLE} bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-400`,
  [CaseStatus.Closed]: `${BASE_STATUS_BUTTON_STYLE} bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 hover:border-gray-400`,
};

const CASE_STATUS_STYLES_ZERO: Record<CaseStatus, string> = {
  [CaseStatus.Open]: `${BASE_STATUS_BUTTON_STYLE} bg-green-50 text-green-500 border-green-200 opacity-70 cursor-default`,
  [CaseStatus.InProgress]: `${BASE_STATUS_BUTTON_STYLE} bg-yellow-50 text-yellow-500 border-yellow-200 opacity-70 cursor-default`,
  [CaseStatus.AwaitingFinance]: `${BASE_STATUS_BUTTON_STYLE} bg-blue-50 text-blue-500 border-blue-200 opacity-70 cursor-default`,
  [CaseStatus.Closed]: `${BASE_STATUS_BUTTON_STYLE} bg-gray-100 text-gray-400 border-gray-200 opacity-70 cursor-default`,
};

const TOTAL_CASES_BUTTON_STYLE_CLICKABLE =
  "w-full block text-center px-2 py-1 text-sm font-semibold rounded border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:border-slate-400 transition-colors duration-150";
const TOTAL_CASES_BUTTON_STYLE_ZERO =
  "w-full block text-center px-2 py-1 text-sm font-semibold rounded border border-gray-200 bg-gray-50 text-gray-400 opacity-70 cursor-default";

const getStatusLabel = (status: CaseStatus): string => {
  switch (status) {
    case CaseStatus.Open:
      return "Open";
    case CaseStatus.InProgress:
      return "In Progress";
    case CaseStatus.AwaitingFinance:
      return "Awaiting Finance";
    case CaseStatus.Closed:
      return "Closed";
    default:
      const exhaustiveCheck: never = status;
      return String(exhaustiveCheck);
  }
};

const getCategoryStates = (category: ICategory) => {
  const isInactive = !!category.archived;
  const isMisconfigured =
    !isInactive &&
    (!category.experts ||
      category.experts.length === 0 ||
      !category.managers ||
      category.managers.length === 0);
  return { isInactive, isMisconfigured };
};

interface CategoryTableProps {
  categories: ICategory[];
  isLoadingCategories: boolean;
  categoriesError?: any;
  totalCategoryCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onEditCategory: (category: ICategory) => void;
  onDeleteCategory: (category: ICategory) => void;
  currentQueryInput: any;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading?: boolean;
}

const MIN_SKELETON_TIME = 250;

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoadingCategories,
  categoriesError,
  totalCategoryCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onEditCategory,
  onDeleteCategory,
  currentQueryInput,
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoadingCategories) {
      setShowSkeleton(true);
      if (skeletonTimerRef.current !== null)
        clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = null;
    } else {
      skeletonTimerRef.current = window.setTimeout(() => {
        setShowSkeleton(false);
        skeletonTimerRef.current = null;
      }, MIN_SKELETON_TIME);
    }
    return () => {
      if (skeletonTimerRef.current !== null)
        clearTimeout(skeletonTimerRef.current);
    };
  }, [isLoadingCategories]);

  const columns: DataTableColumn<ICategory>[] = [
    {
      key: "name",
      header: "Категория",
      width: "w-1/5",
      cellClassName: (category) => {
        const { isMisconfigured, isInactive } = getCategoryStates(category);
        let classes = "whitespace-nowrap";
        if (isMisconfigured) classes += " shadow-[inset_4px_0_0_#EAB308]";
        else if (isInactive) classes += " shadow-[inset_4px_0_0_transparent]";
        else classes += " shadow-[inset_4px_0_0_transparent]";
        return classes;
      },
      render: (category) => {
        const { isMisconfigured } = getCategoryStates(category);
        return (
          <div className="flex items-center gap-x-1">
            <span
              className="h-5.5 w-4 rounded flex-shrink-0 border border-gray-300 mb-1.5"
              style={{
                backgroundColor: category.color || "#A9A9A9",
              }}
              title={category.color}
            ></span>
            <div className="flex-grow min-w-0">
              <CategoryLink {...category} />
            </div>
            {isMisconfigured && (
              <HoverTooltip
                content="Категория без експерти или мениджъри"
                delayDuration={100}
              >
                <span className="ml-2 flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                </span>
              </HoverTooltip>
            )}
          </div>
        );
      },
    },
    {
      key: "experts",
      header: "Експерти",
      width: "w-1/4",
      cellClassName: "text-sm",
      render: (category) => {
        const { isInactive } = getCategoryStates(category);
        return (
          <TruncatedListWithDialog
            items={(category.experts as IUser[]) || []}
            itemTypeLabel="Експерт"
            parentContextName={category.name}
            baseLinkPath="/user/"
            isContextInactive={isInactive}
          />
        );
      },
    },
    {
      key: "managers",
      header: "Мениджъри",
      width: "w-1/4",
      cellClassName: "text-sm",
      render: (category) => {
        const { isInactive } = getCategoryStates(category);
        return (
          <TruncatedListWithDialog
            items={(category.managers as IUser[]) || []}
            itemTypeLabel="Мениджър"
            parentContextName={category.name}
            baseLinkPath="/user/"
            isContextInactive={isInactive}
          />
        );
      },
    },
    {
      key: "signalAmount",
      header: "Брой Сигнали",
      cellClassName: "!py-2 text-center",
      render: (category) => {
        const cases = category.cases || [];
        const totalCases = cases.length;
        const countsByStatus: Record<CaseStatus, number> = {
          [CaseStatus.Open]: 0,
          [CaseStatus.InProgress]: 0,
          [CaseStatus.AwaitingFinance]: 0,
          [CaseStatus.Closed]: 0,
        };
        cases.forEach((c) => {
          if (
            c.status &&
            countsByStatus.hasOwnProperty(c.status as CaseStatus)
          ) {
            countsByStatus[c.status as CaseStatus]++;
          }
        });

        const totalCasesElement =
          totalCases > 0 ? (
            <Link
              to={`/dashboard?perPage=10&page=1&categoryIds=${category._id}`}
              className={TOTAL_CASES_BUTTON_STYLE_CLICKABLE}
              title={`Вижте всички ${totalCases} сигнали за ${category.name}`}
            >
              {totalCases}
            </Link>
          ) : (
            <span className={TOTAL_CASES_BUTTON_STYLE_ZERO}>0</span>
          );

        const statusElements = CASE_STATUS_DISPLAY_ORDER.map(
          (status, index, array) => {
            const count = countsByStatus[status];
            const element =
              count > 0 ? (
                <Link
                  to={`/dashboard?perPage=10&page=1&categoryIds=${category._id}&status=${status}`}
                  className={CASE_STATUS_STYLES_CLICKABLE[status]}
                  title={`Вижте ${count} ${getStatusLabel(
                    status
                  )} сигнали за ${category.name}`}
                >
                  {count}
                </Link>
              ) : (
                <span
                  className={CASE_STATUS_STYLES_ZERO[status]}
                  title={`${getStatusLabel(status)} сигнали`}
                >
                  {count}
                </span>
              );
            return (
              <React.Fragment key={status}>
                {element}
                {index < array.length - 1 && (
                  <span className="mx-0.5 text-gray-300">|</span>
                )}
              </React.Fragment>
            );
          }
        );

        return (
          <div className="flex flex-col items-stretch justify-center gap-1 py-1">
            {totalCasesElement}
            <div className="flex items-center justify-center gap-0.5 flex-wrap">
              {statusElements}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Действия",
      width: "w-1/6",
      cellClassName: "whitespace-nowrap text-center",
      render: (category) => {
        const { isInactive } = getCategoryStates(category);
        const canDeleteCategory =
          isNullOrEmptyArray(category.experts) &&
          isNullOrEmptyArray(category.managers) &&
          isNullOrEmptyArray(category.cases);
        return (
          <div
            className={`inline-flex items-center ${
              canDeleteCategory ? "space-x-1" : ""
            }`}
          >
            <button
              onClick={() => onEditCategory(category)}
              className={`${
                isInactive ? "opacity-50" : ""
              } ${
                canDeleteCategory ? "w-10" : "w-20"
              } inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
              aria-label={`Редактирай ${category.name}`}
              title={`Редактирай ${category.name}`}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>

            {canDeleteCategory && (
              <button
                onClick={() => onDeleteCategory(category)}
                className={`${
                  isInactive ? "opacity-50" : ""
                } w-10 inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 hover:text-red-800 active:bg-red-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                aria-label={`Изтрий ${category.name}`}
                title={`Изтрий ${category.name}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (showSkeleton && isLoadingCategories)
    return <CategoryTableSkeleton rows={itemsPerPage} />;
  if (!isLoadingCategories && categoriesError)
    return (
      <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
        Грешка при зареждане: {categoriesError.message || "Неизвестна грешка"}
      </div>
    );

  return (
    <>
      <DataTable
        columns={columns}
        data={categories}
        rowKey={(category) => category._id}
        rowClassName={(category) => {
          const { isMisconfigured, isInactive } = getCategoryStates(category);
          if (isMisconfigured)
            return "transition-colors duration-150 bg-yellow-50 hover:bg-yellow-100";
          if (isInactive)
            return "bg-gray-50 text-gray-400 hover:bg-gray-100";
          return "transition-colors duration-150 hover:bg-gray-100";
        }}
        emptyMessage={`Няма намерени категории${
          Object.keys(currentQueryInput || {}).some((key) => {
            if (key === "itemsPerPage" || key === "currentPage") return false;
            const value = currentQueryInput[key];
            return Array.isArray(value) ? value.length > 0 : !!value;
          })
            ? " съответстващи на филтрите"
            : ""
        }.`}
      />
      {!isLoadingCategories && totalCategoryCount > 0 && (
        <Pagination
          totalPages={Math.ceil(totalCategoryCount / itemsPerPage)}
          totalCount={totalCategoryCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </>
  );
};

export default CategoryTable;
