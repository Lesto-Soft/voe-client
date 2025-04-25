import React, { useState, useEffect } from "react";
import {
  useGetAllCases,
  useGetCasesByUserCategories,
  useUserAnsweredCases,
  useUserCases,
  useUserCommentedCases,
} from "../graphql/hooks/case";
import { useGetMe } from "../graphql/hooks/user";
import CaseTableWithFilters from "../components/tables/CaseTableWithFilters";
import {
  ListBulletIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronUpIcon, // Import ChevronUpIcon
  ChevronDownIcon, // Import ChevronDownIcon
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router";

const submenu = [
  {
    label: "Всички",
    hookKey: "all",
    hook: useGetAllCases,
    icon: <ListBulletIcon className="h-5 w-5 mr-2" />,
  },
  {
    label: "Моите",
    hookKey: "mine",
    hook: null, // will be set later
    icon: <UserCircleIcon className="h-5 w-5 mr-2" />,
  },
  {
    label: "Експертни",
    hookKey: "expert",
    hook: null, // will be set later
    icon: <AcademicCapIcon className="h-5 w-5 mr-2" />,
  },
  {
    label: "Отговорени",
    hookKey: "answered",
    hook: null, // will be set later
    icon: <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />,
  },
  {
    label: "Коментирани",
    hookKey: "commented",
    hook: null, // will be set later
    icon: <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-2" />,
  },
];

function withUserIdHook(
  hook: (userId: string, input: any) => any,
  userId: string | undefined
) {
  return (input: any) => {
    if (!userId) {
      return {
        cases: [],
        count: 0,
        loading: true,
        error: null,
        refetch: () => {},
      };
    }
    return hook(userId, input);
  };
}

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clearFiltersSignal, setClearFiltersSignal] = useState(0);
  const { me, error: meError, loading: meLoading } = useGetMe();
  const [fitler, setFilter] = useState(true);

  // Determine selected screen from URL
  const searchParams = new URLSearchParams(location.search);
  const screenKey = searchParams.get("screen") || "all";
  const selectedHookIdx =
    submenu.findIndex((item) => item.hookKey === screenKey) !== -1
      ? submenu.findIndex((item) => item.hookKey === screenKey)
      : 0;

  // Prepare hooks with userId
  const getCasesByUserCategoriesWithUser = withUserIdHook(
    useGetCasesByUserCategories,
    me?.me?._id
  );
  const getUserCasesWithUser = withUserIdHook(useUserCases, me?.me?._id);
  const getUserAnsweredCasesWithUser = withUserIdHook(
    useUserAnsweredCases,
    me?.me?._id
  );
  const getUserCommentedCasesWithUser = withUserIdHook(
    useUserCommentedCases,
    me?.me?._id
  );

  // Assign hooks to submenu
  submenu[1].hook = getUserCasesWithUser;
  submenu[2].hook = getCasesByUserCategoriesWithUser;
  submenu[3].hook = getUserAnsweredCasesWithUser;
  submenu[4].hook = getUserCommentedCasesWithUser;

  // When screen changes, clear filters
  useEffect(() => {
    setClearFiltersSignal((s) => s + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  if (meLoading) return <div>Loading...</div>;
  if (meError) return <div>Error: {meError.message}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Submenu and Add New Button */}
      <div className="flex items-center justify-between gap-2 mb-6 px-8 mt-6">
        {/* Submenu - Added flex-wrap */}
        <div className="flex flex-wrap gap-2">
          {submenu.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => {
                const params = new URLSearchParams(location.search);
                params.set("screen", item.hookKey);
                navigate(`${location.pathname}?${params.toString()}`, {
                  replace: true,
                });
              }}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 w-42 
                ${
                  selectedHookIdx === idx
                    ? "border border-btnRedHover text-btnRedHover shadow"
                    : "border border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-btnRedHover hover:cursor-pointer"
                }`}
              type="button"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Filter Toggle Button */}
        <button
          className="flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
          title={fitler ? "Скрий филтри" : "Покажи филтри"}
          onClick={() => setFilter(!fitler)}
        >
          {fitler ? (
            <ChevronUpIcon className="h-5 w-5 mr-1" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 mr-1" />
          )}
          Филтри
        </button>
      </div>
      <CaseTableWithFilters
        fetchHook={submenu[selectedHookIdx].hook!}
        clearFiltersSignal={clearFiltersSignal}
        filter={fitler}
      />
    </div>
  );
};

export default Dashboard;
