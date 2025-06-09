import React from "react";
import { Link, useLocation } from "react-router";
import {
  ClipboardDocumentListIcon,
  ChartPieIcon,
  UsersIcon,
  TagIcon,
  UserIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { NavLinkProps } from "./NavBar";
import { IMe } from "../../db/interfaces";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";

const MobileNavLink: React.FC<NavLinkProps> = ({
  to,
  icon,
  label,
  onClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-md w-full text-left transition duration-150 ease-in-out ${
        isActive
          ? "bg-btnRedHover text-white"
          : "text-gray-700 hover:bg-gray-300 hover:text-btnRedHover"
      }`}
    >
      {icon && <span className="flex-shrink-0 w-6 h-6">{icon}</span>}
      <span className="text-base font-medium">{label}</span>
    </Link>
  );
};

interface MobileMenuProps {
  isOpen: boolean;
  handleSignOut: () => void;
  onLinkClick: () => void; // Function to close the menu
  me: IMe;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  handleSignOut,
  onLinkClick,
  me,
}) => {
  const { t } = useTranslation("menu");

  const isAdmin = me.role._id === ROLES.ADMIN;
  const isManagerExpert =
    me.role._id === ROLES.EXPERT && me.managed_categories.length > 0;
  return (
    <div
      className={`
      md:hidden absolute top-full left-0 w-full bg-gray-200 shadow-lg z-20 border-t border-gray-300
        transition-all duration-500 ease-in-out transform origin-top
        ${
          isOpen
            ? "opacity-100 scale-y-100 "
            : "opacity-0 scale-y-95 pointer-events-none"
        }
      `}
    >
      <div className="flex flex-col space-y-1 p-4">
        {(isAdmin || isManagerExpert) && (
          <>
            <MobileNavLink
              to="/user-management"
              icon={<UsersIcon className="h-6 w-6" />}
              label={t("accounts")}
              onClick={onLinkClick}
            />
            <MobileNavLink
              to="/category-management"
              icon={<TagIcon className="h-6 w-6" />}
              label={t("categories")}
              onClick={onLinkClick}
            />
            <MobileNavLink
              to="/analyses"
              icon={<ChartPieIcon className="h-6 w-6" />}
              label={t("analyses")}
              onClick={onLinkClick}
            />
          </>
        )}
        <MobileNavLink
          to="/dashboard"
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          label={t("dashboard")}
          onClick={onLinkClick}
        />
        <MobileNavLink
          to={`/user/${me.username}`}
          icon={<UserIcon className="h-6 w-6" />} // Add icon if desired
          label={t("profile")}
          onClick={onLinkClick}
        />
        <button
          onClick={() => {
            handleSignOut();
            onLinkClick(); // Close menu after sign out action
          }}
          className="flex items-center rounded-md  space-x-3 p-3 w-full text-left text-gray-700 hover:bg-gray-300 hover:text-btnRedHover transition duration-150 ease-in-out"
        >
          <ArrowRightCircleIcon className="h-6 w-6" />
          <span className="text-base font-medium">{t("signOut")}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
