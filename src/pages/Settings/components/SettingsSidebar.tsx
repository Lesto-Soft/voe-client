import React from "react";
import {
  UserCircleIcon,
  PaintBrushIcon,
  BellIcon,
  Cog6ToothIcon,
  ClockIcon,
  RectangleStackIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export type SettingsTab =
  | "account"
  | "appearance"
  | "notifications"
  | "behavior"
  | "automation"
  | "templates"
  | "bulkChanges";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  isAdmin: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
}) => {
  const navItems = [
    { key: "account", label: "Акаунт", icon: UserCircleIcon },
    { key: "appearance", label: "Визия", icon: PaintBrushIcon },
    { key: "notifications", label: "Известия", icon: BellIcon },
    { key: "behavior", label: "Изгледи", icon: Cog6ToothIcon },
  ];

  const adminNavItems = [
    { key: "automation", label: "Напомняния", icon: ClockIcon },
    { key: "templates", label: "Шаблони", icon: RectangleStackIcon },
    { key: "bulkChanges", label: "Масови Промени", icon: UsersIcon },
  ];

  const NavItem: React.FC<{
    item: (typeof navItems)[0];
    isActive: boolean;
  }> = ({ item, isActive }) => {
    const Icon = item.icon;
    const activeClasses = "bg-blue-100 text-blue-700 font-semibold";
    const inactiveClasses =
      "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    return (
      <button
        onClick={() => setActiveTab(item.key as SettingsTab)}
        className={`flex items-center w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors duration-150 ${
          isActive ? activeClasses : inactiveClasses
        }`}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavItem key={item.key} item={item} isActive={activeTab === item.key} />
      ))}
      {isAdmin && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Администрация
          </h3>
          <div className="mt-2 space-y-1">
            {adminNavItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                isActive={activeTab === item.key}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default SettingsSidebar;
