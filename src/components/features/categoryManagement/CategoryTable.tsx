// src/components/features/categoryManagement/CategoryTable.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ICategory,
  IUser,
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../../../db/interfaces"; // Adjust path
// Removed: import { Link } from "react-router"; // Original Link from react-router
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import Pagination from "../../tables/Pagination";
import CategoryTableSkeleton from "../../skeletons/CategoryTableSkeleton";
import TruncatedListWithDialog from "./TruncatedListWithDialog";
import { isNullOrEmptyArray } from "../../../utils/arrayUtils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import * as Tooltip from "@radix-ui/react-tooltip";

// Import your custom Link components (ensure paths are correct)
import CategoryLink from "../../global/CategoryLink";
// UserLink is used within TruncatedListWithDialog, so direct import here might not be needed unless used elsewhere

// If other general Links are still needed (e.g., for dashboard links)
import { Link } from "react-router"; // Or "react-router"

// ... (rest of the constants and helper functions: BASE_STATUS_BUTTON_STYLE, CASE_STATUS_STYLES_CLICKABLE, etc. remain unchanged)
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
  // createLoading,
  // updateLoading,
  // deleteLoading,
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

  const columnWidths = {
    name: "w-1/5",
    experts: "w-1/4",
    managers: "w-1/4",
    signalAmount: "w-auto px-2",
    edit: "w-1/6",
  };

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
      <section className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-500 sticky top-0 z-10">
              {/* ... table headers ... */}
              <tr>
                <th
                  scope="col"
                  className={`${columnWidths.name} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  Категория
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.experts} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Експерти
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.managers} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Мениджъри
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.signalAmount.replace(
                    "px-2",
                    "px-3"
                  )} py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Брой Сигнали
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.edit} md:table-cell px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {categories.map((category) => {
                const isInactive = !!category.archived;

                // define check for misconfigured category
                const isMisconfigured =
                  !isInactive &&
                  (!category.experts ||
                    category.experts.length === 0 || // changed to OR
                    !category.managers ||
                    category.managers.length === 0);

                // update row styling logic
                let rowClasses = "transition-colors duration-150";
                let categoryCellClasses = `${columnWidths.name} px-3 py-4 whitespace-nowrap`; // Base classes
                if (isMisconfigured) {
                  rowClasses += " bg-yellow-50 hover:bg-yellow-100";
                  // Add the "inner border" using an inset box shadow
                  categoryCellClasses += " shadow-[inset_4px_0_0_#EAB308]";
                } else if (isInactive) {
                  rowClasses = "bg-gray-50 text-gray-400 hover:bg-gray-100";
                  // Add a transparent shadow to maintain structure if ever needed
                  categoryCellClasses += " shadow-[inset_4px_0_0_transparent]";
                } else {
                  rowClasses += " hover:bg-gray-100";
                  categoryCellClasses += " shadow-[inset_4px_0_0_transparent]";
                }

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
                const signalAmountDisplay = (
                  <div className="flex flex-col items-stretch justify-center gap-1 py-1">
                    {totalCasesElement}
                    <div className="flex items-center justify-center gap-0.5 flex-wrap">
                      {statusElements}
                    </div>
                  </div>
                );

                const canDeleteCategory =
                  isNullOrEmptyArray(category.experts) &&
                  isNullOrEmptyArray(category.managers) &&
                  isNullOrEmptyArray(category.cases);

                return (
                  <tr key={category._id} className={rowClasses}>
                    <td className={categoryCellClasses}>
                      {/*
                        IMPORTANT: For CategoryLink to work with JSX <CategoryLink category={...} />,
                        its definition MUST be: const CategoryLink = ({ category }: { category: ICategory }) => { ... }
                        If its definition is literally (category: ICategory), you'd use {CategoryLink(category)}

                        LIMITATIONS with verbatim CategoryLink:
                        - No conditional inactive styling (will always be sky blue).
                        - No custom 'title' prop (original title logic lost).
                        - No 'onClick' prop forwarding (cannot prevent navigation for inactive).
                        - Styling (padding, font size) is fixed by CategoryLink (text-xs).
                      */}
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
                          <Tooltip.Provider delayDuration={100}>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <span className="ml-2 flex-shrink-0">
                                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                                </span>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  sideOffset={5}
                                  className="z-50 max-w-xs rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg"
                                >
                                  Категория без експерти или мениджъри
                                  <Tooltip.Arrow className="fill-gray-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        )}
                      </div>
                    </td>
                    <td className={`${columnWidths.experts} px-3 py-4 text-sm`}>
                      <TruncatedListWithDialog
                        items={(category.experts as IUser[]) || []}
                        itemTypeLabel="Експерт"
                        parentContextName={category.name}
                        baseLinkPath="/user/" // This prop is not directly used if UserLink hardcodes its path
                        isContextInactive={isInactive}
                      />
                    </td>
                    <td
                      className={`${columnWidths.managers} px-3 py-4 text-sm`}
                    >
                      <TruncatedListWithDialog
                        items={(category.managers as IUser[]) || []}
                        itemTypeLabel="Мениджър"
                        parentContextName={category.name}
                        baseLinkPath="/user/"
                        isContextInactive={isInactive}
                      />
                    </td>
                    <td
                      className={`${columnWidths.signalAmount.replace(
                        "px-2",
                        ""
                      )} py-2 text-center`}
                    >
                      {signalAmountDisplay}
                    </td>
                    <td
                      className={`${columnWidths.edit} px-3 py-4 whitespace-nowrap text-center`}
                    >
                      <div
                        className={`inline-flex items-center ${
                          canDeleteCategory ? "space-x-1" : ""
                        }`}
                      >
                        <button
                          onClick={() => onEditCategory(category)}
                          className={`${
                            isInactive ? "opacity-50" : "" // Basic inactive visual cue
                          } ${
                            canDeleteCategory ? "w-10" : "w-20"
                          } inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                          aria-label={`Редактирай ${category.name}`}
                          title={`Редактирай ${category.name}`}
                          // disabled={isInactive} // Consider disabling the button itself if category is inactive
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>

                        {canDeleteCategory && (
                          <button
                            onClick={() => onDeleteCategory(category)}
                            className={`${
                              isInactive ? "opacity-50" : "" // Basic inactive visual cue
                            } w-10 inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 hover:text-red-800 active:bg-red-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                            aria-label={`Изтрий ${category.name}`}
                            title={`Изтрий ${category.name}`}
                            // disabled={isInactive} // Consider disabling
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoadingCategories && categories.length === 0 && (
                <tr>
                  <td
                    colSpan={Object.keys(columnWidths).length}
                    className="px-3 py-10 text-center text-gray-500"
                  >
                    Няма намерени категории
                    {Object.keys(currentQueryInput || {}).some((key) => {
                      if (key === "itemsPerPage" || key === "currentPage")
                        return false;
                      const value = currentQueryInput[key];
                      return Array.isArray(value) ? value.length > 0 : !!value;
                    })
                      ? " съответстващи на филтрите"
                      : ""}
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
