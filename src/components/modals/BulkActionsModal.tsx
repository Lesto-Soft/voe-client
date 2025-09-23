import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  PaintBrushIcon,
  RectangleStackIcon,
  LockClosedIcon,
  BellIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import NotificationSettings from "../../pages/Settings/components/NotificationSettings";
import SettingsPermissions from "./SettingsPermissions";
import { IUser } from "../../db/interfaces";
import ConfirmActionDialog from "./ConfirmActionDialog"; // <-- NEW IMPORT

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
}

// A generic component to represent a setting that can be overridden
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
          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
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
    "appearance" | "behavior" | "notifications" | "template" | "lock"
  >("appearance");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isConfirmApplyOpen, setIsConfirmApplyOpen] = useState(false); // <-- NEW STATE for confirmation

  const handleApplyOverrides = () => {
    alert(
      `Прилагане на ръчни промени за ${selectedUserIds.length} потребителя (симулация).`
    );
    onClose();
  };

  const handleApplyTemplate = () => {
    console.log(`Applying template ${selectedTemplate} to users...`);
    alert(
      `Шаблонът е приложен за ${selectedUserIds.length} потребителя (симулация).`
    );
    setIsConfirmApplyOpen(false); // Close the confirmation dialog
    onClose(); // Close the main modal
  };

  const TabButton: React.FC<{
    tabKey: typeof activeTab;
    label: string;
    icon: React.ElementType;
  }> = ({ tabKey, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex-1 p-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 ${
        activeTab === tabKey
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-5 w-5" /> {label}
    </button>
  );

  return (
    <>
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
              <TabButton
                tabKey="appearance"
                label="Визия"
                icon={PaintBrushIcon}
              />
              <TabButton
                tabKey="behavior"
                label="Поведение"
                icon={Cog6ToothIcon}
              />
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
              <TabButton
                tabKey="lock"
                label="Заключване"
                icon={LockClosedIcon}
              />
            </div>

            <main className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {activeTab === "appearance" && (
                <div className="space-y-4 h-105">
                  <OverridableSetting label="Тема">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option>Светла</option>
                      <option>Тъмна</option>
                      <option>Системна</option>
                    </select>
                  </OverridableSetting>
                  <OverridableSetting label="Наситеност">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option>Комфортна</option>
                      <option>Компактна</option>
                    </select>
                  </OverridableSetting>
                  <OverridableSetting label="Език">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option>Български</option>
                      <option>English</option>
                    </select>
                  </OverridableSetting>
                  <OverridableSetting label="Формат на дати">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option>Относителен</option>
                      <option>Абсолютен</option>
                    </select>
                  </OverridableSetting>
                </div>
              )}
              {activeTab === "behavior" && (
                <div className="space-y-4">
                  <OverridableSetting label="Резултати на страница">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                  </OverridableSetting>
                  <OverridableSetting label="Таб на сигнал по подразбиране">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option>Решения</option>
                      <option>Коментари</option>
                      <option>История</option>
                    </select>
                  </OverridableSetting>

                  <OverridableSetting label="Изглед по подразбиране за страници">
                    <select className="w-full p-2 border rounded-md border-gray-300">
                      <option value="standard">Стандартен</option>
                      <option value="analytical">Аналитичен</option>
                    </select>
                  </OverridableSetting>
                  <OverridableSetting label="Панели по подразбиране за страници">
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded" />{" "}
                        Панел "Информация"
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded" />{" "}
                        Панел "Активност"
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded" />{" "}
                        Панел "Статистика"
                      </label>
                    </div>
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
                <div className="space-y-4 h-105">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Изберете шаблон за прилагане
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full p-2 border rounded-md border-gray-300"
                    >
                      <option value="">-- Изберете --</option>
                      <option value="t1">Нов служител - Базов достъп</option>
                      <option value="t2">Мениджър на категория</option>
                    </select>
                  </div>
                  {selectedTemplate && (
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                      <h4 className="font-semibold text-gray-800">
                        Преглед на шаблон:
                      </h4>
                      <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Тема: Светла</li>
                        <li>Език: Български</li>
                        <li>
                          Известия за @споменаване: Включени за всички
                          приоритети
                        </li>
                        <li>Заключени секции: Акаунт</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-3">
                        Забележка: Прилагането на шаблон ще замени и правата за
                        редакция на потребителя с тези от шаблона.
                      </p>
                      <div className="text-right mt-3">
                        <button
                          onClick={() => setIsConfirmApplyOpen(true)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-green-700"
                        >
                          Приложи този шаблон
                        </button>
                      </div>
                    </div>
                  )}
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
                onClick={handleApplyOverrides}
                disabled={activeTab === "template"} // The main button is disabled when in template mode
                className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Приложи
              </button>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* NEW: Confirmation dialog for applying templates */}
      <ConfirmActionDialog
        isOpen={isConfirmApplyOpen}
        onOpenChange={setIsConfirmApplyOpen}
        onConfirm={handleApplyTemplate}
        title="Потвърждение за прилагане на шаблон"
        description={`Сигурни ли сте, че искате да приложите избрания шаблон върху ${selectedUserIds.length} потребителя? Техните текущи настройки ще бъдат презаписани.`}
        confirmButtonText="Да, приложи"
        isDestructiveAction={true}
      />
    </>
  );
};
