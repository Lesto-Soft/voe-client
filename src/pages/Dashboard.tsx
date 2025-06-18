import { useState, useEffect, useMemo } from "react";
import {
  useGetAllCases,
  useGetCasesByUserCategories,
  useGetCasesByUserManagedCategories,
  useUserAnsweredCases,
  useUserCases,
  useUserCommentedCases,
} from "../graphql/hooks/case";
import CaseTableWithFilters from "../components/tables/CaseTableWithFilters";
import {
  ListBulletIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import LoadingModal from "../components/modals/LoadingModal";
import { useCurrentUser } from "../context/UserContext";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
// roles are ROLES.NORMAL, ROLES.EXPERT, ROLES.ADMIN

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
  const [fitler, setFilter] = useState(true);
  const currentUser = useCurrentUser();

  const allSubmenus = useMemo(
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
        label: "Управлявани",
        hookKey: "managed",
        hook: null,
        icon: <Cog6ToothIcon className="h-5 w-5 mr-2" />,
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

  // Filter submenus based on user role and managed categories
  const submenu = useMemo(() => {
    const userRole = currentUser?.role?._id;
    const hasManagedCategories = currentUser?.managed_categories?.length > 0;

    if (userRole === ROLES.NORMAL) {
      // Normal users can only see "all" tab
      return [allSubmenus[0]]; // Only "all" submenu
    } else if (userRole === ROLES.EXPERT && !hasManagedCategories) {
      // Expert users without managed categories see all except "managed"
      return allSubmenus.filter((item) => item.hookKey !== "managed");
    } else if (userRole === ROLES.EXPERT && hasManagedCategories) {
      // Expert users with managed categories can see all
      return allSubmenus;
    } else if (userRole === ROLES.ADMIN) {
      // Admin users can see all
      return allSubmenus;
    }

    // Default fallback - show only "all" tab
    return [allSubmenus[0]];
  }, [
    allSubmenus,
    currentUser?.role?._id,
    currentUser?.managed_categories?.length,
  ]);

  const searchParams = new URLSearchParams(location.search);
  const screenKey = searchParams.get("screen") || "all";
  const selectedHookIdx =
    submenu.findIndex((item) => item.hookKey === screenKey) !== -1
      ? submenu.findIndex((item) => item.hookKey === screenKey)
      : 0;

  const getCasesByUserCategoriesWithUser = withUserIdHook(
    useGetCasesByUserCategories,
    currentUser._id
  );
  const getCasesByUserManagedCategoriesWithUser = withUserIdHook(
    useGetCasesByUserManagedCategories,
    currentUser._id
  );
  const getUserCasesWithUser = withUserIdHook(useUserCases, currentUser._id);
  const getUserAnsweredCasesWithUser = withUserIdHook(
    useUserAnsweredCases,
    currentUser._id
  );
  const getUserCommentedCasesWithUser = withUserIdHook(
    useUserCommentedCases,
    currentUser._id
  );

  const submenuWithHooks = useMemo(() => {
    const updatedSubmenu = [...submenu];

    // Only update hooks for items that exist in the filtered submenu
    updatedSubmenu.forEach((item, index) => {
      switch (item.hookKey) {
        case "mine":
          updatedSubmenu[index].hook = getUserCasesWithUser;
          break;
        case "managed":
          updatedSubmenu[index].hook = getCasesByUserManagedCategoriesWithUser;
          break;
        case "expert":
          updatedSubmenu[index].hook = getCasesByUserCategoriesWithUser;
          break;
        case "answered":
          updatedSubmenu[index].hook = getUserAnsweredCasesWithUser;
          break;
        case "commented":
          updatedSubmenu[index].hook = getUserCommentedCasesWithUser;
          break;
        default:
          // "all" hook is already set in allSubmenus
          break;
      }
    });

    return updatedSubmenu;
  }, [
    submenu,
    getUserCasesWithUser,
    getCasesByUserManagedCategoriesWithUser,
    getCasesByUserCategoriesWithUser,
    getUserAnsweredCasesWithUser,
    getUserCommentedCasesWithUser,
  ]);

  useEffect(() => {
    setClearFiltersSignal((s) => s + 1);
  }, [screenKey]);

  // Check if current screenKey is valid for the filtered submenu
  useEffect(() => {
    const isValidScreen = submenu.some((item) => item.hookKey === screenKey);
    if (!isValidScreen) {
      // Redirect to "all" tab if current screen is not available for this user
      const params = new URLSearchParams(location.search);
      params.set("screen", "all");
      params.set("page", "1");
      navigate(`${location.pathname}?${params.toString()}`, {
        replace: true,
      });
    }
  }, [submenu, screenKey, location.pathname, location.search, navigate]);

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
