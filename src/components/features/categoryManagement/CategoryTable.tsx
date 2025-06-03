// src/components/features/categoryManagement/CategoryTable.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ICategory,
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../../../db/interfaces"; // Adjust path
import { Link } from "react-router"; // Corrected import for React Router v5/v6
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid"; // Or your preferred variant
import Pagination from "../../tables/Pagination"; // Adjust path
import CategoryTableSkeleton from "../../skeletons/CategoryTableSkeleton"; // Adjust path
import TruncatedListWithDialog from "./TruncatedListWithDialog"; // Adjust path
import { isNullOrEmptyArray } from "../../../utils/arrayUtils"; // Adjust path

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
      // This ensures that if a new status is added and not handled, TypeScript will complain.
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
  onDeleteCategory: (category: ICategory) => void; // New prop
  currentQueryInput: any; // Consider defining a more specific type if possible
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading?: boolean; // New prop
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
  createLoading,
  updateLoading,
  deleteLoading,
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
    return <CategoryTableSkeleton rows={itemsPerPage} />; // Show skeleton only if truly loading
  if (!isLoadingCategories && categoriesError)
    // Show error if not loading but error exists
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
                  className={`${columnWidths.edit} hidden md:table-cell px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Действия{" "}
                  {/* Changed from "Редактирай" to "Действия" as it now includes delete */}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {categories.map((category) => {
                const isInactive = category.archived;
                let rowClasses =
                  "hover:bg-gray-100 transition-colors duration-150"; // Added transition
                const inactiveClasses =
                  "bg-gray-50 text-gray-400 hover:bg-gray-100"; // Still allow hover on inactive for consistency

                if (isInactive) {
                  rowClasses = inactiveClasses;
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
                      title={`View all ${totalCases} cases for ${category.name}`}
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
                          title={`View ${count} ${getStatusLabel(
                            status
                          )} cases for ${category.name}`}
                        >
                          {count}
                        </Link>
                      ) : (
                        <span
                          className={CASE_STATUS_STYLES_ZERO[status]}
                          title={`${getStatusLabel(status)} cases`}
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
                    <td
                      className={`${columnWidths.name} px-3 py-4 whitespace-nowrap`}
                    >
                      <Link
                        to={`/category/${category.name}`} // Ensure Link leads somewhere meaningful or remove if not needed
                        className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-150 ease-in-out ${
                          isInactive
                            ? "bg-gray-200 text-gray-500" // cursor-not-allowed" // Made inactive link look more disabled
                            : "bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200 cursor-pointer"
                        }`}
                        title={
                          isInactive
                            ? `${category.name} (Архивирана)`
                            : category.name
                        }
                        // onClick={(e) => isInactive && e.preventDefault()} // Prevent navigation for inactive categories
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className={`${columnWidths.experts} px-3 py-4 text-sm`}>
                      <TruncatedListWithDialog
                        items={category.experts || []}
                        itemTypeLabel="Експерт"
                        parentContextName={category.name}
                        baseLinkPath="/user/" // Example path
                        isContextInactive={!!isInactive}
                      />
                    </td>
                    <td
                      className={`${columnWidths.managers} px-3 py-4 text-sm`}
                    >
                      <TruncatedListWithDialog
                        items={category.managers || []}
                        itemTypeLabel="Мениджър"
                        parentContextName={category.name}
                        baseLinkPath="/user/" // Example path
                        isContextInactive={!!isInactive}
                      />
                    </td>
                    <td
                      className={`${columnWidths.signalAmount.replace(
                        "px-2",
                        "" // Allow internal padding of signalAmountDisplay to control spacing
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
                            isInactive ? "opacity-50" : "" // pointer-events-none" : ""
                          } ${
                            // Pointer-events-none for inactive
                            canDeleteCategory ? "w-10" : "w-20"
                          } inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                          aria-label={`Редактирай ${category.name}`}
                          title={`Редактирай ${category.name}`}
                          // disabled={
                          //   isInactive ||
                          //   createLoading ||
                          //   updateLoading ||
                          //   deleteLoading ||
                          //   isLoadingCategories
                          // }
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>

                        {canDeleteCategory && (
                          <button
                            onClick={() => onDeleteCategory(category)}
                            className={`${
                              isInactive ? "opacity-50" : "" //pointer-events-none" : "" // Pointer-events-none for inactive
                            } w-10 inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 hover:text-red-800 active:bg-red-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                            aria-label={`Изтрий ${category.name}`}
                            title={`Изтрий ${category.name}`}
                            // disabled={
                            //   isInactive ||
                            //   createLoading ||
                            //   updateLoading ||
                            //   deleteLoading ||
                            //   isLoadingCategories
                            // }
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
