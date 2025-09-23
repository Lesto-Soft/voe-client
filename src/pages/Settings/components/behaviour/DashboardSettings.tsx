import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // <-- 1. Import the hook
import CaseSearchBar from "../../../../components/tables/CaseSearchBar";
import DateRangeSelector from "../../../../components/features/userAnalytics/DateRangeSelector";

const DashboardSettings: React.FC = () => {
  // 2. Initialize the hook to get the 't' function
  const { t } = useTranslation("dashboard");

  // State to hold the default filter values for the dashboard
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [caseNumber, setCaseNumber] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState([]);
  const [readStatus, setReadStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleSave = () => {
    const settingsToSave = {
      isFilterOpen,
      caseNumber,
      priority,
      type,
      creatorId,
      categoryIds,
      content,
      status,
      readStatus,
      dateRange,
    };
    console.log("Saving Dashboard Default Settings:", settingsToSave);
    alert("Настройките за Табло са запазени (симулация).");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFilterOpen}
            onChange={(e) => setIsFilterOpen(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">
            Филтрите да са отворени по подразбиране
          </span>
        </label>
      </div>

      <div>
        <label
          htmlFor="items-per-page-dashboard"
          className="block text-sm font-medium text-gray-700"
        >
          Резултати на страница по подразбиране
        </label>
        <select
          id="items-per-page-dashboard"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="mt-1 max-w-xs w-full rounded-md border-gray-300 p-2 shadow-sm focus:outline-none focus:border-indigo-500"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm font-medium text-gray-600 mb-2">
          Стойности на филтрите по подразбиране:
        </p>
        <CaseSearchBar
          caseNumber={caseNumber}
          setCaseNumber={setCaseNumber}
          priority={priority}
          setPriority={setPriority}
          type={type}
          setType={setType}
          creatorId={creatorId}
          setCreatorId={setCreatorId}
          categoryIds={categoryIds}
          setCategoryIds={setCategoryIds}
          content={content}
          setContent={setContent}
          status={status}
          setStatus={setStatus}
          readStatus={readStatus}
          setReadStatus={setReadStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
          t={t} // <-- 3. Pass the real 't' function
        />
      </div>

      <div className="pt-4 border-t border-t-gray-200 text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          Запази настройките
        </button>
      </div>
    </div>
  );
};

export default DashboardSettings;
