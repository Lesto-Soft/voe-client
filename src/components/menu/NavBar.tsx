import React, { useState } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router"; // Corrected import for react-router-dom v6+
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
} from "@heroicons/react/24/solid";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { dev_endpoint } from "../../db/config";
import axios from "axios";
import MobileMenu from "./MobileMenu";
import { useTranslation } from "react-i18next";
import { IMe } from "../../db/interfaces";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import { capitalizeFirstLetter } from "../../utils/stringUtils";

export interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  dropdown?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  icon,
  label,
  onClick,
  dropdown = false,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${
        dropdown
          ? "space-x-2 p-2 text-gray-700 rounded-lg w-full text-left transition duration-300 hover:scale-105 hover:text-btnRedHover flex items-center"
          : "w-32 flex items-center space-x-2 p-3 rounded-lg shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:text-btnRedHover"
      } ${
        isActive
          ? "bg-btnRedHover text-white hover:text-white"
          : "bg-white text-black"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

const NavBar: React.FC<{ me: IMe }> = ({ me }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useTranslation("menu");

  const initials = me.name
    .split(" ")
    .map((word: string) => word[0])
    .join("");

  const handleSignOut = async () => {
    try {
      await axios.post(
        `${dev_endpoint}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
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
  } else {
    currentPage = pageNames[location.pathname] || "Страницата не е намерена";
  }

  const isAdmin = me.role._id === ROLES.ADMIN;
  const isManagerExpert =
    me.role._id === ROLES.EXPERT && me.managed_categories.length > 0;

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 shadow-md relative max-w-full h-[6rem]">
      <div className="flex items-center justify-between p-4 px-4 md:px-1 lg:px-12">
        {/* MODIFIED: Flex container for title and new buttons */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Title and Subtitle Container */}
          <div className="flex-shrink min-w-0">
            <h1 className="text-gray-800 text-xl font-semibold md:text-2xl truncate">
              {t("voe")}
            </h1>
            <h3 className="text-gray-600 italic text-md md:text-md font-normal mt-1 hidden lg:block truncate">
              {currentPage}
            </h3>
          </div>

          {/* NEW: Buttons Container */}
          <div className="flex items-center gap-2 mr-2">
            <button
              title="Подобрение"
              className="hover:cursor-pointer p-2 bg-green-500 text-white rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-transform transform hover:scale-110"
            >
              <LightBulbIcon className="h-5 w-5" />
            </button>
            <button
              title="Проблем"
              className="hover:cursor-pointer p-2 bg-red-500 text-white rounded-md shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-transform transform hover:scale-110"
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex space-x-4 items-center">
          {(isAdmin || isManagerExpert) && (
            <>
              <NavLink
                to="/user-management"
                icon={<UsersIcon className="h-6 w-6" />}
                label={t("accounts")}
              />
              <NavLink
                to="/category-management"
                icon={<TagIcon className="h-6 w-6" />}
                label={t("categories")}
              />
            </>
          )}
          <NavLink
            to="/dashboard"
            icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
            label={t("dashboard")}
          />
          <NavLink
            to="/analyses"
            icon={<ChartPieIcon className="h-6 w-6" />}
            label={t("analyses")}
          />
          {/* Fixed dropdown container with relative positioning */}
          <div className="relative">
            <DropdownMenu.Root
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenu.Trigger asChild className="focus:outline-none">
                <button className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-gray-300">
                  {/* User Avatar */}
                  <div className="relative flex items-center justify-center w-12 h-12 bg-white text-white rounded-full shadow-lg overflow-hidden">
                    {me.avatar ? (
                      <img
                        src={`${dev_endpoint}/static/avatars/${me._id}/${me.avatar}`}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-black text-2xl font-bold">
                        {initials}
                      </span>
                    )}
                  </div>
                  {/* User Name and Username */}
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
                  {/* Animated Dropdown Arrow */}
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                className="bg-white rounded-md shadow-lg p-2 w-56 z-10"
                align="end"
                side="bottom"
                sideOffset={8}
              >
                {/* New field for Position and Role */}
                <DropdownMenu.Item className="p-2 focus:outline-none">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {me.position || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span>
                        {" " + capitalizeFirstLetter(me.role.name) || "N/A"}
                        {me.managed_categories.length > 0 && " (Мениджър)"}
                      </span>
                    </p>
                  </div>
                </DropdownMenu.Item>

                {/* Separator */}
                <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />

                <DropdownMenu.Item asChild className="focus:outline-none">
                  <NavLink
                    to={`/user/${me.username}`}
                    dropdown={true}
                    label={t("profile")}
                    icon={<UserIcon className="h-6 w-6" />}
                    onClick={() => setIsDropdownOpen(false)}
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
            </DropdownMenu.Root>
          </div>
        </div>

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
