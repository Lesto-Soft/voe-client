import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IMe, IUser } from "../../db/interfaces";
import AccountSettings from "../../pages/Settings/components/AccountSettings";
import AppearanceSettings from "../../pages/Settings/components/AppearanceSettings";
import NotificationSettings from "../../pages/Settings/components/NotificationSettings";
import BehaviorSettings from "../../pages/Settings/components/BehaviourSettings";
import SettingsPermissions from "./SettingsPermissions";

interface IndividualUserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  isTemplateMode?: boolean; // <-- NEW PROP
}

export const IndividualUserSettingsModal: React.FC<
  IndividualUserSettingsModalProps
> = ({ isOpen, onClose, user, isTemplateMode = false }) => {
  const [activeTab, setActiveTab] = useState("account");

  const title = isTemplateMode
    ? user.username === "new-template"
      ? "Създаване на нов шаблон"
      : `Редакция на шаблон: ${user.name}`
    : `Редакция на настройки за: ${user.name}`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[95vw] max-w-4xl bg-gray-50 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          <header className="p-4 border-b border-b-gray-300 flex justify-between items-center bg-white rounded-t-lg flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="cursor-pointer p-1 rounded-full hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex flex-1 overflow-y-hidden">
            <nav className="w-38 p-4 border-r border-r-gray-300 bg-gray-100 flex-shrink-0 overflow-y-auto">
              {/* --- The Account and Permissions tabs are disabled in Template Mode --- */}
              <button
                onClick={() => setActiveTab("account")}
                className={`w-full text-left p-2 rounded text-sm ${
                  activeTab === "account" ? "bg-blue-100" : "hover:bg-gray-200"
                } ${
                  isTemplateMode
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                disabled={isTemplateMode}
              >
                Акаунт
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`cursor-pointer w-full text-left p-2 rounded text-sm ${
                  activeTab === "appearance"
                    ? "bg-blue-100"
                    : "hover:bg-gray-200"
                }`}
              >
                Визия
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`cursor-pointer w-full text-left p-2 rounded text-sm ${
                  activeTab === "notifications"
                    ? "bg-blue-100"
                    : "hover:bg-gray-200"
                }`}
              >
                Известия
              </button>
              <button
                onClick={() => setActiveTab("behavior")}
                className={`cursor-pointer w-full text-left p-2 rounded text-sm ${
                  activeTab === "behavior" ? "bg-blue-100" : "hover:bg-gray-200"
                }`}
              >
                Изгледи
              </button>
              {/* MODIFIED: This button is now ALWAYS enabled */}
              <button
                onClick={() => setActiveTab("permissions")}
                className={`cursor-pointer w-full text-left p-2 rounded text-sm ${
                  activeTab === "permissions"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                Права
              </button>
            </nav>

            <main className="p-6 overflow-y-auto flex-1">
              {/* In Template mode, some components might not be relevant (e.g., changing password) */}
              {activeTab === "account" && (
                <AccountSettings
                  currentUser={user as IMe}
                  isEditingSelf={false}
                />
              )}
              {activeTab === "appearance" && <AppearanceSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
              {activeTab === "behavior" && <BehaviorSettings />}
              {activeTab === "permissions" && (
                <SettingsPermissions user={user} />
              )}
            </main>
          </div>

          <footer className="p-4 border-t border-t-gray-300 flex z-[99] justify-end gap-4 bg-white rounded-b-lg flex-shrink-0">
            {/* The save button text changes based on the mode */}
            {isTemplateMode ? (
              <button className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">
                Запази шаблон
              </button>
            ) : (
              <>
                <button className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-300">
                  Запази като шаблон
                </button>
                <button className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">
                  Запази промените
                </button>
              </>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
