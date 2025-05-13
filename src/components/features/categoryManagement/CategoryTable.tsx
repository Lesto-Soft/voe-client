// src/components/features/userManagement/UserTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path
import { ICategory } from "../../../db/interfaces";
import { Link } from "react-router";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Pagination from "../../tables/Pagination";
import CategoryTableSkeleton from "../../skeletons/CategoryTableSkeleton";
import TruncatedListWithDialog, { ListItem } from "./TruncatedListWithDialog";

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
  currentQueryInput: any;
  createLoading: boolean;
  updateLoading: boolean;
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
  currentQueryInput,
  createLoading,
  updateLoading,
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
    signalAmount: "w-1/8",
    edit: "w-1/6",
  };

  if (showSkeleton) return <CategoryTableSkeleton rows={itemsPerPage} />;
  if (categoriesError)
    return (
      <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
        Грешка при зареждане: {categoriesError.message}
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
                  className={`${columnWidths.signalAmount} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative whitespace-nowrap`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Брой Сигнали
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.edit} hidden md:table-cell px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Редактирай
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {categories.map((category) => {
                // Determine if the user is inactive
                const isInactive = category.archived;

                // Define base row classes
                let rowClasses = "hover:bg-gray-100";
                // Define inactive specific classes
                const inactiveClasses = "bg-gray-50 text-gray-300 cursor-text"; // Example inactive style

                if (isInactive) {
                  rowClasses = inactiveClasses;
                }

                return (
                  <tr key={category._id} className={rowClasses}>
                    <td
                      className={`${
                        columnWidths.name // Assuming columnWidths.name provides necessary width/alignment
                      } px-3 py-4 whitespace-nowrap`} // Removed font-medium, as link will have its own
                    >
                      <Link
                        to={`/category/${category._id}`} // Link to the category's detail page
                        key={category._id} // Key for list item, good practice
                        className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150 ease-in-out ${
                          // Increased padding slightly for better look
                          isInactive // This is category.archived
                            ? "bg-gray-200 text-gray-500 pointer-events-none" // Style for inactive/archived categories
                            : "bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200" // Style for active categories
                        }`}
                        title={
                          isInactive
                            ? `${category.name} (Архивирана)`
                            : category.name
                        } // Tooltip
                      >
                        {category.name}
                      </Link>
                    </td>

                    {/* EXPERTS Column */}
                    <td className={`${columnWidths.experts} px-3 py-4 text-sm`}>
                      <TruncatedListWithDialog
                        items={category.experts || []} // Pass the experts array
                        itemTypeLabel="Expert" // Label for this type of item
                        parentContextName={category.name} // Optional: For dialog title
                        baseLinkPath="/user-data/" // Path prefix for individual item links
                        isContextInactive={isInactive} // Pass the category's inactive state
                      />
                    </td>

                    <td
                      className={`${columnWidths.managers} px-3 py-4 text-sm`}
                    >
                      {" "}
                      {category.managers && category.managers.length > 0 ? (
                        category.managers.map((manager) => (
                          <div
                            key={manager._id}
                            className="flex items-center space-x-2"
                          >
                            <Link
                              to={`/user-data/${manager._id}`}
                              className={`max-w-75 inline-block px-2 py-0.5 rounded-md font-medium transition-colors duration-150 ease-in-out text-left hover:cursor-pointer ${
                                isInactive
                                  ? "bg-purple-50 text-purple-400 hover:bg-purple-100 border border-purple-100 opacity-75"
                                  : "bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200"
                              } truncate`}
                              title={manager._id}
                            >
                              {manager.name}
                            </Link>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Няма мениджъри</span>
                      )}{" "}
                    </td>

                    <td
                      className={`${columnWidths.signalAmount} px-3 py-4 whitespace-nowrap`}
                    >
                      {category.cases && category.cases.length > 0
                        ? category.cases.length + " (open X / closed Y)"
                        : 0}
                    </td>
                    <td
                      className={`${columnWidths.edit} px-3 py-4 whitespace-nowrap text-center`}
                    >
                      <button
                        onClick={() => onEditCategory(category)}
                        className={`${
                          isInactive ? "opacity-50" : ""
                        } w-30 inline-flex justify-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                        aria-label={`Редактирай ${category.name}`}
                        disabled={
                          createLoading || updateLoading || isLoadingCategories
                        }
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
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
