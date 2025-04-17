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

// Re-define or import NavLink if needed, or pass necessary props
// For simplicity, let's define a mobile-specific link style here
const MobileNavLink = ({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void; // To close menu on navigation
}) => {
  const location = useLocation(); // Assuming useLocation is available here
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
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  handleSignOut,
  onLinkClick,
}) => {
  return (
    <div
      className={`
        md:hidden absolute top-full left-0 w-full bg-gray-200 shadow-lg z-20 border-t border-gray-300
        transition-all duration-500 ease-in-out transform origin-top
        ${
          isOpen
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-95 pointer-events-none"
        }
      `}
    >
      <div className="flex flex-col space-y-1 p-4">
        <MobileNavLink
          to="/user-management"
          icon={<UsersIcon className="h-6 w-6" />}
          label="Акаунти"
          onClick={onLinkClick}
        />
        <MobileNavLink
          to="/category-management"
          icon={<TagIcon className="h-6 w-6" />}
          label="Категории"
          onClick={onLinkClick}
        />
        <MobileNavLink
          to="/dashboard"
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          label="Табло"
          onClick={onLinkClick}
        />
        <MobileNavLink
          to="/analyses"
          icon={<ChartPieIcon className="h-6 w-6" />}
          label="Анализи"
          onClick={onLinkClick}
        />
        <MobileNavLink
          to="/profile"
          icon={<UserIcon className="h-6 w-6" />} // Add icon if desired
          label="Профил"
          onClick={onLinkClick}
        />
        <button
          onClick={() => {
            handleSignOut();
            onLinkClick(); // Close menu after sign out action
          }}
          className="flex items-center space-x-3 p-3 w-full text-left text-gray-700 hover:bg-gray-300 hover:text-btnRedHover transition duration-150 ease-in-out"
        >
          <ArrowRightCircleIcon className="h-6 w-6" />
          <span className="text-base font-medium">Излез</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
