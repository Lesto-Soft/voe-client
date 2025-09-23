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
}

export const IndividualUserSettingsModal: React.FC<
  IndividualUserSettingsModalProps
> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[95vw] max-w-4xl bg-gray-50 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          <header className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold">
              Редакция на настройки за: {user.name}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <nav className="w-48 p-4 border-r bg-gray-100 flex-shrink-0">
              <button
                onClick={() => setActiveTab("account")}
                className={`w-full text-left p-2 rounded text-sm ${
                  activeTab === "account"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                Акаунт
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`w-full text-left p-2 rounded text-sm ${
                  activeTab === "appearance"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                Визия
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left p-2 rounded text-sm ${
                  activeTab === "notifications"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                Известия
              </button>
              <button
                onClick={() => setActiveTab("behavior")}
                className={`w-full text-left p-2 rounded text-sm ${
                  activeTab === "behavior"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                Поведение
              </button>
              <button
                onClick={() => setActiveTab("permissions")}
                className={`w-full text-left p-2 rounded text-sm ${
                  activeTab === "permissions"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                Права
              </button>
            </nav>

            <main className="p-6 overflow-y-auto flex-1">
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

          <footer className="p-4 border-t flex justify-end gap-4 bg-white rounded-b-lg flex-shrink-0">
            <button className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold text-gray-800 hover:bg-gray-300">
              Запази като шаблон
            </button>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">
              Запази промените
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
