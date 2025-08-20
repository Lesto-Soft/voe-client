// src/pages/DashboardContent.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useGetAllCases,
  useGetCasesByUserCategories,
  useGetCasesByUserManagedCategories,
  useGetRelevantCases,
  useUserAnsweredCases,
  useUserCases,
  useUserCommentedCases,
} from "../graphql/hooks/case";
import CaseTableWithFilters from "../components/tables/CaseTableWithFilters";
import {
  ListBulletIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "../context/UserContext";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { ICase } from "../db/interfaces";

// Type for the filters prop
type CaseFilters = {
  caseNumber?: string;
  priority?: ICase["priority"] | "";
  type?: ICase["type"] | "";
  creatorId?: string;
  categoryIds?: string[];
  content?: string;
  status?: (ICase["status"] | "")[];
  readStatus?: string;
  startDate?: Date | null;
  endDate?: Date | null;
};

// Props interface for the component
interface DashboardContentProps {
  initialFiltersOverride?: CaseFilters;
}

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

const DashboardContent: React.FC<DashboardContentProps> = ({
  initialFiltersOverride,
}) => {
  const { t } = useTranslation("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const [clearFiltersSignal, setClearFiltersSignal] = useState(0);
  const [fitler, setFilter] = useState(!initialFiltersOverride); // <-- CHANGED: Hide filters by default in modal view
  const currentUser = useCurrentUser();

  const useAllRelevantCasesHook = useCallback(
    (input: any) => {
      return useGetRelevantCases(currentUser._id, input);
    },
    [currentUser._id]
  );

  const allSubmenus = useMemo(
    () => [
      {
        label: t("all"),
        hookKey: "all",
        hook:
          currentUser.role?._id === ROLES.ADMIN
            ? useGetAllCases
            : useAllRelevantCasesHook,
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
        icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2" />,
      },
      {
        label: t("commented"),
        hookKey: "commented",
        hook: null,
        icon: <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-2" />,
      },
    ],
    [t, currentUser.role?._id, useAllRelevantCasesHook]
  );

  const submenu = useMemo(() => {
    const userRole = currentUser?.role?._id;
    const hasManagedCategories = currentUser?.managed_categories?.length > 0;

    if (userRole === ROLES.NORMAL) {
      return [allSubmenus[0]];
    } else if (userRole === ROLES.EXPERT && !hasManagedCategories) {
      return allSubmenus.filter((item) => item.hookKey !== "managed");
    } else if (userRole === ROLES.EXPERT && hasManagedCategories) {
      return allSubmenus;
    } else if (userRole === ROLES.ADMIN) {
      return allSubmenus;
    }

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

  const getExpertCases = withUserIdHook(
    useGetCasesByUserCategories,
    currentUser._id
  );
  const getManagedCases = withUserIdHook(
    useGetCasesByUserManagedCategories,
    currentUser._id
  );
  const getCreatedCases = withUserIdHook(useUserCases, currentUser._id);
  const getAnsweredCases = withUserIdHook(
    useUserAnsweredCases,
    currentUser._id
  );
  const getCommentedCases = withUserIdHook(
    useUserCommentedCases,
    currentUser._id
  );

  const submenuWithHooks = useMemo(() => {
    const updatedSubmenu = [...submenu];
    updatedSubmenu.forEach((item, index) => {
      switch (item.hookKey) {
        case "mine":
          updatedSubmenu[index].hook = getCreatedCases;
          break;
        case "managed":
          updatedSubmenu[index].hook = getManagedCases;
          break;
        case "expert":
          updatedSubmenu[index].hook = getExpertCases;
          break;
        case "answered":
          updatedSubmenu[index].hook = getAnsweredCases;
          break;
        case "commented":
          updatedSubmenu[index].hook = getCommentedCases;
          break;
        default:
          break;
      }
    });
    return updatedSubmenu;
  }, [
    submenu,
    getCreatedCases,
    getManagedCases,
    getExpertCases,
    getAnsweredCases,
    getCommentedCases,
  ]);

  useEffect(() => {
    setClearFiltersSignal((s) => s + 1);
  }, [screenKey]);

  useEffect(() => {
    // This effect is for the main page, it can be skipped in modal view
    if (initialFiltersOverride) return;
    const isValidScreen = submenu.some((item) => item.hookKey === screenKey);
    if (!isValidScreen) {
      const params = new URLSearchParams(location.search);
      params.set("screen", "all");
      params.set("page", "1");
      navigate(`${location.pathname}?${params.toString()}`, {
        replace: true,
      });
    }
  }, [
    submenu,
    screenKey,
    location.pathname,
    location.search,
    navigate,
    initialFiltersOverride,
  ]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* <-- CHANGED: Conditionally render the entire header/tabs section --> */}
      {!initialFiltersOverride && (
        <div className="flex items-center justify-between gap-2 mb-6 px-8 mt-6">
          <div className="flex flex-wrap gap-2">
            {submenuWithHooks.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.set("screen", item.hookKey);
                  params.set("page", "1");
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
      )}
      <CaseTableWithFilters
        // <-- CHANGED: Determine the fetch hook and pass the override prop -->
        fetchHook={
          initialFiltersOverride
            ? allSubmenus[0].hook!
            : submenuWithHooks[selectedHookIdx].hook!
        }
        clearFiltersSignal={clearFiltersSignal}
        filter={fitler}
        t={t}
        initialFiltersOverride={initialFiltersOverride}
      />
    </div>
  );
};

export default DashboardContent;
