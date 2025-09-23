import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  PencilSquareIcon,
  RectangleStackIcon,
  LockClosedIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import NotificationSettings from "../../pages/Settings/components/NotificationSettings";
import { IUser } from "../../db/interfaces";
import SettingsPermissions from "./SettingsPermissions";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
}

const OverridableSetting: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => {
  const [isOverridden, setIsOverridden] = useState(false);
  return (
    <div
      className={`p-3 rounded-md transition-colors ${
        isOverridden ? "bg-blue-50 border border-blue-200" : "bg-gray-100"
      }`}
    >
      <div className="flex items-center">
        <input
          id={`override-${label}`}
          type="checkbox"
          checked={isOverridden}
          onChange={() => setIsOverridden(!isOverridden)}
          className="h-4 w-4 rounded"
        />
        <label
          htmlFor={`override-${label}`}
          className="ml-2 text-sm font-medium text-gray-800"
        >
          Промени "{label}"
        </label>
      </div>
      <div
        className={`mt-2 pl-6 ${
          !isOverridden ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedUserIds,
}) => {
  const [activeTab, setActiveTab] = useState<
    "edit" | "template" | "notifications" | "lock"
  >("edit");

  const handleSave = () => {
    alert(
      `Прилагане на промени за ${selectedUserIds.length} потребителя (симулация).`
    );
    onClose();
  };

  const TabButton: React.FC<{
    tabKey: typeof activeTab;
    label: string;
    icon: React.ElementType;
  }> = ({ tabKey, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${
        activeTab === tabKey
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-5 w-5" /> {label}
    </button>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl bg-white rounded-lg shadow-xl max-h-[85vh] flex flex-col">
          <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold">
              Масови действия за {selectedUserIds.length} потребителя
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </header>

          <div className="border-b flex flex-shrink-0">
            <TabButton tabKey="edit" label="Редакция" icon={PencilSquareIcon} />
            <TabButton
              tabKey="notifications"
              label="Известия"
              icon={BellIcon}
            />
            <TabButton
              tabKey="template"
              label="Шаблон"
              icon={RectangleStackIcon}
            />
            <TabButton tabKey="lock" label="Заключване" icon={LockClosedIcon} />
          </div>

          <main className="p-6 overflow-y-auto flex-1 bg-gray-50">
            {activeTab === "edit" && (
              <div className="space-y-4">
                <OverridableSetting label="Тема">
                  <select className="w-full p-2 border rounded-md border-gray-300">
                    <option>Светла</option>
                    <option>Тъмна</option>
                  </select>
                </OverridableSetting>
                <OverridableSetting label="Наситеност">
                  <select className="w-full p-2 border rounded-md border-gray-300">
                    <option>Комфортна</option>
                    <option>Компактна</option>
                  </select>
                </OverridableSetting>
              </div>
            )}
            {activeTab === "notifications" && (
              <OverridableSetting label="Настройки за известия">
                <p className="text-xs text-gray-500 pb-2">
                  Всички избрани настройки ще бъдат приложени за избраните
                  потребители.
                </p>
                <div className="pointer-events-auto">
                  <NotificationSettings />
                </div>
              </OverridableSetting>
            )}
            {activeTab === "template" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Изберете шаблон
                </label>
                <select className="w-full p-2 border rounded-md border-gray-300">
                  <option>Нов служител - Базов достъп</option>
                  <option>Мениджър на категория</option>
                </select>
              </div>
            )}
            {activeTab === "lock" && (
              <OverridableSetting label="Права за редакция на настройки">
                <SettingsPermissions
                  user={{ name: "избраните потребители" } as IUser}
                />
              </OverridableSetting>
            )}
          </main>

          <footer className="p-4 border-t flex justify-end flex-shrink-0 bg-white">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
            >
              Приложи
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
