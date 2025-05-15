import { useState, useEffect, useMemo } from "react";
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
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import LoadingModal from "../components/modals/LoadingModal";

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
  const { t } = useTranslation("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const [clearFiltersSignal, setClearFiltersSignal] = useState(0);
  const { me, error: meError, loading: meLoading } = useGetMe();
  const [fitler, setFilter] = useState(true);

  const submenu = useMemo(
    () => [
      {
        label: t("all"),
        hookKey: "all",
        hook: useGetAllCases,
        icon: <ListBulletIcon className="h-5 w-5 mr-2" />,
      },
      {
        label: t("mine"),
        hookKey: "mine",
        hook: null,
        icon: <UserCircleIcon className="h-5 w-5 mr-2" />,
      },
      {
        label: t("expert"),
        hookKey: "expert",
        hook: null,
        icon: <AcademicCapIcon className="h-5 w-5 mr-2" />,
      },
      {
        label: t("answered"),
        hookKey: "answered",
        hook: null,
        icon: <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />,
      },
      {
        label: t("commented"),
        hookKey: "commented",
        hook: null,
        icon: <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-2" />,
      },
    ],
    [t]
  );

  const searchParams = new URLSearchParams(location.search);
  const screenKey = searchParams.get("screen") || "all";
  const selectedHookIdx =
    submenu.findIndex((item) => item.hookKey === screenKey) !== -1
      ? submenu.findIndex((item) => item.hookKey === screenKey)
      : 0;

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

  const submenuWithHooks = useMemo(() => {
    const updatedSubmenu = [...submenu];
    updatedSubmenu[1].hook = getUserCasesWithUser;
    updatedSubmenu[2].hook = getCasesByUserCategoriesWithUser;
    updatedSubmenu[3].hook = getUserAnsweredCasesWithUser;
    updatedSubmenu[4].hook = getUserCommentedCasesWithUser;
    return updatedSubmenu;
  }, [
    submenu,
    getUserCasesWithUser,
    getCasesByUserCategoriesWithUser,
    getUserAnsweredCasesWithUser,
    getUserCommentedCasesWithUser,
  ]);

  useEffect(() => {
    setClearFiltersSignal((s) => s + 1);
  }, [screenKey]);

  if (meLoading) return <LoadingModal />;
  if (meError) return <div>Error: {meError.message}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex items-center justify-between gap-2 mb-6 px-8 mt-6">
        <div className="flex flex-wrap gap-2">
          {submenuWithHooks.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => {
                const params = new URLSearchParams(location.search);
                params.set("screen", item.hookKey);
                params.set("page", "1"); // <-- Ensure page is set to 1 on menu click
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

        <button
          className="flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
          title={fitler ? t("hide_filters") : t("show_filters")}
          onClick={() => setFilter(!fitler)}
        >
          {fitler ? (
            <ChevronUpIcon className="h-5 w-5 mr-1" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 mr-1" />
          )}
          {t("filter")}
        </button>
      </div>
      <CaseTableWithFilters
        fetchHook={submenuWithHooks[selectedHookIdx].hook!}
        clearFiltersSignal={clearFiltersSignal}
        filter={fitler}
        t={t}
      />
    </div>
  );
};

export default Dashboard;
