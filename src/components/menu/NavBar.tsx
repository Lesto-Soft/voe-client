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
} from "@heroicons/react/24/solid";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { dev_endpoint } from "../../db/config";
import axios from "axios";
import MobileMenu from "./MobileMenu";
import { useTranslation } from "react-i18next";
import { IMe } from "../../db/interfaces";

export interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void; // Add this line
  dropdown?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  icon,
  label,
  dropdown = false,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`${
        dropdown
          ? "space-x-2 p-2 text-gray-700 rounded-lg w-full text-left transition duration-300 hover:scale-105  hover:text-btnRedHover flex  "
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

  // Handle dynamic /case/:number and category/:number path for heading
  let currentPage: string;
  if (/^\/case\/\d+/.test(location.pathname)) {
    const caseId = location.pathname.split("/").pop();
    currentPage = t("case_desc", { caseId });
  } else if (/^\/category\/[^/]+$/.test(location.pathname)) {
    const encodedCategoryName = location.pathname.split("/").pop();
    if (encodedCategoryName) {
      // Ensure it's not undefined or empty
      const categoryName = decodeURIComponent(encodedCategoryName);
      // Use the decoded categoryName in your translation function
      currentPage = t("category_desc", { categoryName });
    } else {
      currentPage = "Проблем с името на категорията";
    }
  } else if (/^\/user\/[^/]+$/.test(location.pathname)) {
    console.log("User path detected:", location.pathname);
    const username = location.pathname.split("/").pop();
    console.log("EMP:", username);
    if (username) {
      // Use the decoded categoryName in your translation function
      currentPage = t("user_desc", { username });
    } else {
      currentPage = "Проблем с потребителя";
    }
  } else {
    currentPage = pageNames[location.pathname] || "Страницата не е намерена";
  }

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 shadow-md relative max-w-full h-[6rem]">
      <div className="flex items-center justify-between p-4 px-6 md:px-12">
        <div className="text-lg font-bold ">
          <h1 className="text-gray-800 text-xl md:text-2xl">{t("voe")}</h1>
          <h3 className="text-gray-600 italic text-md md:text-md font-light mt-1 hidden lg:block">
            {currentPage}
          </h3>
        </div>

        <div className="hidden md:flex space-x-4 items-center">
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
          <DropdownMenu.Root>
            <div className="relative">
              <DropdownMenu.Trigger asChild className="focus:outline-none">
                <button className="flex items-center justify-center w-12 h-12 bg-white text-white rounded-full shadow-lg overflow-hidden">
                  {me.avatar ? (
                    <img
                      src={`${dev_endpoint}/static/avatars/${me._id}/${me.avatar}`}
                      alt="User Avatar"
                      className="w-full h-full object-cover hover:cursor-pointer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="hover:scale-105 absolute inset-0 flex items-center justify-center text-black text-2xl font-bold  hover:cursor-pointer hover:text-btnRedHover">
                      {initials}
                    </span>
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="absolute right-0 mt-2 bg-white rounded-md shadow-lg p-2 w-32 z-10">
                <DropdownMenu.Item asChild>
                  <NavLink
                    to="/profile"
                    dropdown={true}
                    label={t("profile")}
                    icon={<UserIcon className="h-6 w-6" />}
                  />
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild className="focus:outline-none">
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-sm text-gray-700 rounded-md w-full block text-left hover:scale-105 hover:text-btnRedHover hover:cursor-pointer"
                  >
                    <ArrowRightCircleIcon className="h-6 w-6 inline-block mr-2" />
                    {t("signOut")}
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </div>
          </DropdownMenu.Root>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 focus:outline-none "
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-8 w-8  hover:cursor-pointer" />
            ) : (
              <Bars3Icon className="h-8 w-8  hover:cursor-pointer" />
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        handleSignOut={handleSignOut}
        onLinkClick={closeMobileMenu}
      />
    </div>
  );
};

export default NavBar;
