import React, { useState } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import {
  ClipboardDocumentListIcon,
  ChartPieIcon,
  UsersIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { endpoint } from "../../db/config";
import axios from "axios";
import MobileMenu from "./MobileMenu";
import { useTranslation } from "react-i18next";
import { IMe } from "../../db/interfaces";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import { capitalizeFirstLetter } from "../../utils/stringUtils";
import { useGetActiveCategories } from "../../graphql/hooks/category";
import CaseDialog from "../modals/CaseDialog";
import UserAvatar from "../cards/UserAvatar";
import NotificationCenter from "../notification/NotificationCenter";

export interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  dropdown?: boolean;
  theme?: "red" | "blue";
  adminOnly?: boolean; // Optional prop to conditionally render for admin only
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  icon,
  label,
  onClick,
  dropdown = false,
  theme = "red", // <-- Default to 'red'
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Conditionally set class names based on the theme
  const themeClasses = {
    red: {
      hover: "hover:text-btnRedHover",
      active: "bg-btnRedHover text-white hover:text-white",
    },
    blue: {
      hover: "hover:text-btnBlueHover",
      active: "bg-btnBlueHover text-white hover:text-white",
    },
  };
  const currentTheme = themeClasses[theme];

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${
        dropdown
          ? `space-x-2 p-2 mb-2 text-gray-700 rounded-lg w-full text-left transition duration-300 hover:scale-105 flex items-center ${currentTheme.hover}`
          : `w-32 flex items-center space-x-2 p-3 rounded-lg shadow-lg transition duration-300 ease-in-out hover:scale-105 ${currentTheme.hover}`
      } ${isActive ? currentTheme.active : "bg-white text-black"}`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
};

const NavBar: React.FC<{ me: IMe }> = ({ me }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMgmtDropdownOpen, setIsMgmtDropdownOpen] = useState(false);
  const { t } = useTranslation("menu");

  const {
    categories: categoriesDataFromHook,
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetActiveCategories();

  const isMgmtPageActive = [
    "/user-management",
    "/category-management",
    "/rating-management",
  ].includes(location.pathname);

  const handleSignOut = async () => {
    try {
      await axios.post(
        `${endpoint}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      // Clear all session storage for this tab
      sessionStorage.clear();

      window.location.href = "/";
    } catch (err) {
      console.error("Error during sign out:", err);
    }
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const pageNames: { [key: string]: string } = {
    "/dashboard": t("dashboard_desc"),
    "/profile": t("profile_desc"),
    "/users": t("accounts_desc"),
    "/submit-case": t("submit_case_desc"),
    "/user-management": t("accounts_desc"),
    "/category-management": t("categories_desc"),
    "/rating-management": t("ratings_desc"),
    "/analyses": t("analyses_desc"),
  };

  let currentPage: string;
  if (/^\/case\/\d+/.test(location.pathname)) {
    const caseId = location.pathname.split("/").pop();
    currentPage = t("case_desc", { caseId });
  } else if (/^\/category\/[^/]+$/.test(location.pathname)) {
    const encodedCategoryName = location.pathname.split("/").pop();
    if (encodedCategoryName) {
      const categoryName = decodeURIComponent(encodedCategoryName);
      currentPage = t("category_desc", { categoryName });
    } else {
      currentPage = "Проблем с името на категорията";
    }
  } else if (/^\/user\/[^/]+$/.test(location.pathname)) {
    const username = location.pathname.split("/").pop();
    if (username) {
      currentPage = t("user_desc", { username });
    } else {
      currentPage = "Проблем с потребителя";
    }
  } else if (/^\/rating-metric\/[^/]+$/.test(location.pathname)) {
    // TODO change to name
    const ratingMetricId = location.pathname.split("/").pop();
    if (ratingMetricId) {
      currentPage = t("rating_desc", { username: ratingMetricId });
    } else {
      currentPage = "Проблем с оценката";
    }
  } else {
    currentPage = pageNames[location.pathname] || "Страницата не е намерена";
  }

  const isAdmin = me.role._id === ROLES.ADMIN;
  const isManagerExpert =
    me.role._id === ROLES.EXPERT && me.managed_categories.length > 0;

  return (
    <div className="bg-gradient-to-r z-20 from-gray-100 to-gray-200 shadow-md relative max-w-full h-[6rem]">
      <div className="flex items-center justify-between p-4 px-4 md:px-1 lg:px-12">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink min-w-0">
            <h1 className="text-gray-800 text-xl font-semibold md:text-2xl truncate">
              {t("voe")}
            </h1>
            <h3 className="text-gray-600 text-md md:text-md font-normal mt-1 hidden lg:block truncate">
              {currentPage}
            </h3>
          </div>
          <div className="flex items-center gap-2 mr-2">
            {!categoriesLoading && !categoriesError && (
              <>
                <CaseDialog
                  mode="create"
                  caseType="SUGGESTION"
                  me={me}
                  availableCategories={categoriesDataFromHook || []}
                >
                  <button
                    title={t("suggestion", "Предложете Подобрение")}
                    className="hover:cursor-pointer p-2 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-transform transform hover:scale-110"
                  >
                    <LightBulbIcon className="h-5 w-5" />
                  </button>
                </CaseDialog>
                <CaseDialog
                  mode="create"
                  caseType="PROBLEM"
                  me={me}
                  availableCategories={categoriesDataFromHook || []}
                >
                  <button
                    title={t("problem", "Подайте Проблем")}
                    className="hover:cursor-pointer p-2 bg-red-600 text-white rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-transform transform hover:scale-110"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5" />
                  </button>
                </CaseDialog>
              </>
            )}
          </div>
        </div>

        {/* --- REFACTORED RIGHT-SIDE CONTROLS --- */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* This container holds desktop-only items */}
          <div className="hidden md:flex items-center space-x-4">
            {(isAdmin || isManagerExpert) && (
              <DropdownMenu.Root
                open={isMgmtDropdownOpen}
                onOpenChange={setIsMgmtDropdownOpen}
              >
                <DropdownMenu.Trigger asChild>
                  <button
                    className={`w-40 flex items-center justify-between p-3 rounded-lg shadow-lg transition-colors duration-150 ease-in-out hover:cursor-pointer ${
                      isMgmtPageActive
                        ? "bg-btnBlueHover text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <WrenchScrewdriverIcon className="h-6 w-6" />
                      <span className="text-sm font-semibold">
                        {t("management", "Управление")}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isMgmtDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-white rounded-md shadow-lg p-2 w-56 z-20"
                    sideOffset={8}
                    align="end"
                  >
                    <DropdownMenu.Item asChild className="focus:outline-none">
                      <NavLink
                        to="/user-management"
                        dropdown={true}
                        label={t("accounts")}
                        icon={<UsersIcon className="h-6 w-6" />}
                        onClick={() => setIsMgmtDropdownOpen(false)}
                        theme="blue"
                      />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild className="focus:outline-none">
                      <NavLink
                        to="/category-management"
                        dropdown={true}
                        label={t("categories")}
                        icon={<TagIcon className="h-6 w-6" />}
                        onClick={() => setIsMgmtDropdownOpen(false)}
                        theme="blue"
                      />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild className="focus:outline-none">
                      <NavLink
                        to="/rating-management"
                        dropdown={true}
                        label={t("ratings")}
                        icon={<StarIcon className="h-6 w-6" />}
                        onClick={() => setIsMgmtDropdownOpen(false)}
                        theme="blue"
                      />
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}

            <NavLink
              to="/tasks-dashboard" // <-- Нов маршрут
              icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
              label={"Задачи"}
              theme="red"
            />

            <NavLink
              to="/dashboard"
              icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
              label={t("dashboard")}
              theme="red"
            />

            <NavLink
              to="/analyses"
              icon={<ChartPieIcon className="h-6 w-6" />}
              label={t("analyses")}
              theme="red"
            />

            <div className="relative">
              <DropdownMenu.Root
                open={isUserDropdownOpen}
                onOpenChange={setIsUserDropdownOpen}
              >
                <DropdownMenu.Trigger asChild className="focus:outline-none">
                  <button className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-gray-300 hover:cursor-pointer">
                    <div className="rounded-full shadow-lg">
                      <UserAvatar
                        name={me.name}
                        imageUrl={
                          me.avatar
                            ? `${endpoint}/static/avatars/${me._id}/${me.avatar}`
                            : null
                        }
                        size={48}
                      />
                    </div>
                    <div
                      className="text-left max-w-32 hidden lg:block"
                      title={me.name}
                    >
                      <p className="font-bold text-xs text-gray-800 truncate">
                        {me.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {me.username}
                      </p>
                    </div>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                        isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-white rounded-md shadow-lg p-2 w-56 z-20"
                    align="end"
                    side="bottom"
                    sideOffset={8}
                  >
                    <DropdownMenu.Item className="p-2 focus:outline-none">
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">
                          {me.position || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span>
                            {" " + capitalizeFirstLetter(me.role.name) || "N/A"}
                            {me.managed_categories.length > 0 && " - Мениджър"}
                          </span>
                          <span>
                            {me.financial_approver && " (финансов одобрител)"}
                          </span>
                        </p>
                      </div>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
                    <DropdownMenu.Item asChild className="focus:outline-none">
                      <NavLink
                        to={`/user/${me.username}`}
                        dropdown={true}
                        label={t("profile")}
                        icon={<UserIcon className="h-6 w-6" />}
                        onClick={() => setIsUserDropdownOpen(false)}
                        theme="red"
                      />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild className="focus:outline-none">
                      <button
                        onClick={handleSignOut}
                        className="p-2 text-sm text-gray-700 rounded-md w-full flex items-center text-left hover:scale-105 hover:text-btnRedHover hover:cursor-pointer space-x-2"
                      >
                        <ArrowRightCircleIcon className="h-6 w-6" />
                        <span>{t("signOut")}</span>
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* This NotificationCenter is now rendered once on all screen sizes */}
          <NotificationCenter userId={me._id} />

          {/* This hamburger button is now only visible on mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 focus:outline-none "
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-8 w-8 hover:cursor-pointer" />
              ) : (
                <Bars3Icon className="h-8 w-8 hover:cursor-pointer" />
              )}
            </button>
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={isMenuOpen}
        handleSignOut={handleSignOut}
        onLinkClick={closeMobileMenu}
        me={me}
      />
    </div>
  );
};

export default NavBar;
