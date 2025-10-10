import React, { useState, useEffect } from "react";
import { ICase } from "../../db/interfaces";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import DateRangeSelector from "../features/userAnalytics/DateRangeSelector";
import CustomDropdown from "../global/dropdown/CustomDropdown";
import CustomMultiSelectDropdown from "../global/dropdown/CustomMultiSelectDropdown";
import {
  getPriorityOptions,
  getReadStatusOptions,
  getStatusOptions,
  getTypeOptions,
} from "../../utils/dashboardFilterUtils";
import CategoryMultiSelect from "../global/dropdown/CategoryMultiSelect";
import UserSelector from "../global/dropdown/UserSelector";
import ClearableInput from "../global/inputs/ClearableInput";

interface CaseSearchBarProps {
  caseNumber: string;
  setCaseNumber: (v: string) => void;
  priority: ICase["priority"] | "";
  setPriority: (v: ICase["priority"] | "") => void;
  type: ICase["type"] | "";
  setType: (v: ICase["type"] | "") => void;
  creatorId: string;
  setCreatorId: (v: string) => void;
  categoryIds: string[];
  setCategoryIds: (v: string[]) => void;
  content: string;
  setContent: (v: string) => void;
  status: (ICase["status"] | "")[];
  setStatus: (v: (ICase["status"] | "")[]) => void;
  readStatus: string;
  setReadStatus: (v: string) => void;
  dateRange: { startDate: Date | null; endDate: Date | null };
  setDateRange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  t: (key: string) => string;
}

const CaseSearchBar: React.FC<CaseSearchBarProps> = ({
  caseNumber,
  setCaseNumber,
  priority,
  setPriority,
  type,
  setType,
  creatorId,
  setCreatorId,
  categoryIds,
  setCategoryIds,
  content,
  setContent,
  status,
  setStatus,
  readStatus,
  setReadStatus,
  dateRange,
  setDateRange,
  t,
}) => {
  const [isDateSelectorVisible, setIsDateSelectorVisible] = useState(
    !!(dateRange.startDate || dateRange.endDate)
  );

  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;

  useEffect(() => {
    if (!dateRange.startDate && !dateRange.endDate) {
      setIsDateSelectorVisible(false);
    }
  }, [dateRange]);

  const priorityOptions = getPriorityOptions(t);
  const typeOptions = getTypeOptions(t);
  const statusOptions = getStatusOptions(t);
  const readStatusOptions = getReadStatusOptions(t);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-wrap gap-x-4 gap-y-3 items-end">
        <div className="w-28">
          <ClearableInput
            id="caseNumber"
            label={t("case_number")}
            value={caseNumber}
            onChange={setCaseNumber}
            placeholder={t("search_by_case_number")}
          />
        </div>
        <CustomDropdown
          label={t("priority")}
          options={priorityOptions}
          value={priority}
          onChange={(value) => setPriority(value as ICase["priority"] | "")}
        />
        <CustomDropdown
          label={t("type")}
          options={typeOptions}
          value={type}
          onChange={(value) => setType(value as ICase["type"] | "")}
        />
        <UserSelector
          label={t("creator")}
          placeholder={t("choose_creator")}
          selectedUserId={creatorId}
          setSelectedUserId={setCreatorId}
          t={t}
        />
        <CategoryMultiSelect
          label={t("categories")}
          placeholder={t("choose_categories")}
          selectedCategoryIds={categoryIds}
          setSelectedCategoryIds={setCategoryIds}
          t={t}
        />
        <div className="flex w-full items-end gap-x-4 xl:flex-1 xl:w-auto">
          <div className="flex-1 min-w-[200px]">
            <ClearableInput
              id="content"
              label={t("description")}
              value={content}
              onChange={setContent}
              placeholder={t("search_by_description")}
            />
          </div>
          <div>
            <label
              htmlFor="date-filter-toggle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("date")}
            </label>
            <button
              id="date-filter-toggle"
              type="button"
              onClick={() => setIsDateSelectorVisible((prev) => !prev)}
              title={t("filter_by_date")}
              className={`cursor-pointer px-3 py-2 flex items-center justify-center border rounded-md shadow-sm transition duration-150 ease-in-out text-sm ${
                isDateSelectorVisible
                  ? "bg-indigo-100 border-indigo-500 text-indigo-600"
                  : isDateFilterActive
                  ? "bg-white border-indigo-400 text-indigo-600"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
            </button>
          </div>
          <CustomMultiSelectDropdown
            label={t("status")}
            options={statusOptions}
            selectedValues={status}
            onChange={(values) => setStatus(values as ICase["status"][])}
            placeholder="Всички"
          />
          <CustomDropdown
            label={"Прочетени"}
            options={readStatusOptions}
            value={readStatus === "" ? "ALL" : readStatus}
            onChange={(value) => setReadStatus(value as "READ" | "UNREAD" | "")}
          />
        </div>
      </div>

      {isDateSelectorVisible && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            justify="end"
          />
        </div>
      )}
    </div>
  );
};

export default CaseSearchBar;
