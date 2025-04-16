import React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import {
  ClipboardDocumentListIcon,
  ChartPieIcon,
  UsersIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { useGetMe } from "../graphql/hooks/user";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { dev_endpoint } from "../db/config";
import axios from "axios";

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
          ? "p-2 text-sm text-gray-700 rounded-md w-full block text-left hover:scale-105 hover:text-btnRedHover"
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
          withCredentials: true, // Ensure cookies are included
        }
      );
      window.location.href = "/"; // Redirect to the home page
    } catch (err) {
      console.error("Error during sign out:", err);
    }
  };

  // Map routes to page names
  const pageNames: { [key: string]: string } = {
    "/dashboard": "Твоето табло",
    "/profile": "Профил",
    "/users": "Потребители",
    "/submit-case": "Подай сигнал",
  };

  const currentPage =
    pageNames[location.pathname] || "Страницата не е намерена";

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-200 p-4 shadow-md px-12">
      <div className="text-lg font-bold hidden md:block">
        <h1 className="text-gray-800 text-2xl">Гласът на служителите</h1>
        <h3 className="text-gray-600 italic text-md font-light mt-1">
          {currentPage}
        </h3>
      </div>
      <div className="flex space-x-4 items-center">
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
              <button className="flex items-center justify-center w-12 h-12 bg-btnRedHover text-white rounded-full shadow-lg overflow-hidden">
                {me.me.avatar ? (
                  <img
                    src={`${dev_endpoint}/static/avatars/${me.me.avatar}`}
                    alt="User Avatar"
                    className="w-full h-full object-cover hover:cursor-pointer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"; // Hide the broken image
                    }}
                  />
                ) : (
                  <span className="absolute text-white text-2xl font-bold">
                    {initials}
                  </span>
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              className="absolute right-0 bg-white rounded-md shadow-lg p-2 w-32"
              sideOffset={5}
            >
              <DropdownMenu.Item asChild>
                <NavLink to="/profile" dropdown={true} label="Профил" />
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-sm text-gray-700 rounded-md w-full block text-left hover:scale-105 hover:text-btnRedHover"
                >
                  Излез
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </div>
        </DropdownMenu.Root>
      </div>
    </div>
  );
};

export default NavBar;
