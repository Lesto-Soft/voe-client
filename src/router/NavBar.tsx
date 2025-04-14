import React from "react";
import { useLocation } from "react-router";
import {
  ClipboardDocumentListIcon,
  ChartPieIcon,
  UserIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";

const NavButton = ({
  icon,
  tooltip,
}: {
  icon: React.ReactNode;
  tooltip: string;
}) => {
  return (
    <button className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:cursor-pointer hover:from-blue-600 hover:to-indigo-800 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out">
      {icon}
      <span className="text-white text-sm font-medium">{tooltip}</span>
    </button>
  );
};

const NavBar = () => {
  const location = useLocation();

  // Map routes to page names
  const pageNames: { [key: string]: string } = {
    "/dashboard": "Твоето табло",
    "/contact": "Контакт",
  };

  const currentPage =
    pageNames[location.pathname] || "Страницата не е намерена";

  return (
    <div className="flex flex-col h-screen">
      {/* Top Menu */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-200 p-4 shadow-md">
        <div className="text-lg font-bold">
          <h1 className="text-gray-800 text-2xl">Гласът на служителите</h1>
          <h3 className="text-gray-600 italic text-md font-light mt-1">
            {currentPage}
          </h3>
        </div>
        <div className="flex space-x-4">
          <NavButton
            icon={<ClipboardDocumentListIcon className="h-6 w-6 text-white" />}
            tooltip="Документи"
          />
          <NavButton
            icon={<ChartPieIcon className="h-6 w-6 text-white" />}
            tooltip="Анализи"
          />
          <NavButton
            icon={<UserIcon className="h-6 w-6 text-white" />}
            tooltip="Профил"
          />
          <NavButton
            icon={
              <ArrowDownTrayIcon className="h-6 w-6 text-white rotate-270" />
            }
            tooltip="Изтегляне"
          />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
