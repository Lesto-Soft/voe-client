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
import { useGetMe } from "../graphql/hooks/user";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { dev_endpoint } from "../db/config";
import axios from "axios";
import MobileMenu from "./MobileMenu";

const NavLink = ({
  to,
  icon,
  label,
  dropdown,
}: {
  to: string;
  icon?: React.ReactNode;
  label: string;
  dropdown?: boolean;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`${
        dropdown
          ? "space-x-2 p-2 text-gray-700 rounded-md w-full text-left transition duration-300 hover:scale-105  hover:text-btnRedHover flex  "
          : "w-32 flex items-center space-x-2 p-3 rounded-full shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:text-btnRedHover"
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

const NavBar = () => {
  const location = useLocation();
  const { me, error, loading } = useGetMe();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!me || !me.me) return <div>Неуспешно зареждане на потребител.</div>;

  const initials = me.me.name
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
    "/dashboard": "Твоето табло",
    "/profile": "Профил",
    "/users": "Потребители",
    "/submit-case": "Подай сигнал",
    "/user-management": "Управление на акаунти",
    "/category-management": "Управление на категории",
    "/analyses": "Анализи",
  };

  const currentPage =
    pageNames[location.pathname] || "Страницата не е намерена";

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 shadow-md relative">
      <div className="flex items-center justify-between p-4 px-6 md:px-12">
        <div className="text-lg font-bold">
          <h1 className="text-gray-800 text-xl md:text-2xl">
            Гласът на служителите
          </h1>
          <h3 className="text-gray-600 italic text-md md:text-md font-light mt-1 hidden md:block">
            {currentPage}
          </h3>
        </div>

        <div className="hidden md:flex space-x-4 items-center">
          <NavLink
            to="/user-management"
            icon={<UsersIcon className="h-6 w-6" />}
            label="Акаунти"
          />
          <NavLink
            to="/category-management"
            icon={<TagIcon className="h-6 w-6" />}
            label="Категории"
          />
          <NavLink
            to="/dashboard"
            icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
            label="Табло"
          />
          <NavLink
            to="/analyses"
            icon={<ChartPieIcon className="h-6 w-6" />}
            label="Анализи"
          />
          <DropdownMenu.Root>
            <div className="relative">
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-center w-12 h-12 bg-white text-white rounded-full shadow-lg overflow-hidden">
                  {!me.me.avatar ? (
                    <img
                      src={`${dev_endpoint}/static/avatars/${me.me.avatar}`}
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
                    label="Профил"
                    icon={<UserIcon className="h-6 w-6" />}
                  />
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-sm text-gray-700 rounded-md w-full block text-left hover:scale-105 hover:text-btnRedHover hover:cursor-pointer"
                  >
                    <ArrowRightCircleIcon className="h-6 w-6 inline-block mr-2" />
                    Излез
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
              <XMarkIcon className="h-8 w-8" />
            ) : (
              <Bars3Icon className="h-8 w-8" />
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
