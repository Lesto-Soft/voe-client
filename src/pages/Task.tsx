// src/pages/Task.tsx

import React, { useState } from "react";
import { useParams } from "react-router";
import { ICase, IUser } from "../db/interfaces";
import UserLink from "../components/global/UserLink";
import CaseLink from "../components/global/CaseLink";
import {
  FlagIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import TextEditor from "../components/forms/partials/TextEditor";
import * as Dialog from "@radix-ui/react-dialog";

// --- Макетирани Данни ---
const mockUsers: IUser[] = [
  { _id: "1", name: "Иван Петров", username: "ivan.petrov" },
  { _id: "2", name: "Мари Анеева", username: "mari.aneeva" },
  { _id: "3", name: "Георги Тодоров", username: "georgi.todorov" },
];

const mockTaskDetail = {
  id: 1,
  title: "Актуализация на драйверите за принтери в офиса",
  caseNumber: 123,
  priority: "HIGH",
  dueDate: "2025-08-15",
  status: "Завършена",
  assignees: [mockUsers[0], mockUsers[1]],
  creator: mockUsers[2],
  description:
    "Одобреното решение за сигнал #123 е да се актуализират драйверите на принтерите. Новият драйвер се намира на [линк]. Тази задача включва инсталирането на този нов драйвер на всички компютри в централния офис.",
  originatingAnswerId: "ans1",
  fiveWhys: [
    {
      user: mockUsers[2],
      whys: [
        "Защо принтерът не работи?",
        "Защото драйверът е остарял.",
        "Защо драйверът е остарял?",
        "Защото не е бил включен в автоматичните ъпдейти.",
        "Защо не е бил включен?",
        "Защото е специфичен модел, който изисква ръчна инсталация.",
        "Защо изисква ръчна инсталация?",
        "Политиката на производителя.",
        "Защо следваме тази политика?",
        "Нямаме алтернатива за този модел.",
      ],
    },
    {
      user: mockUsers[0],
      whys: [
        "Защо инсталацията отнема толкова време?",
        "Защото трябва да се прави на всяка машина поотделно.",
        "Защо трябва поотделно?",
        "Защото нямаме софтуер за централизирано управление.",
        "Защо нямаме такъв софтуер?",
        "Не е бил предвиден в бюджета.",
        "Защо не е бил предвиден?",
        "Проблемът не е бил считан за приоритетен досега.",
        "Защо не е бил приоритетен?",
        "Защото инцидентните проблеми са били решавани ръчно.",
      ],
    },
  ],
  subTasks: [
    { id: "sub1", title: "Изтегляне на новия драйвер", completed: true },
    {
      id: "sub2",
      title: "Тестване на драйвера на един компютър",
      completed: true,
    },
    { id: "sub3", title: "Инсталиране на всички компютри", completed: false },
  ],
  activity: [
    {
      type: "status_change",
      user: mockUsers[2],
      text: 'Задачата е създадена със статус "За изпълнение"',
      date: "2025-08-01 10:00",
    },
    {
      type: "comment",
      user: mockUsers[2],
      text: "Иван, Мари, моля поемете тази задача. Драйверът трябва да се инсталира на всички машини до края на следващата седмица.",
      date: "2025-08-01 10:01",
    },
    {
      type: "status_change",
      user: mockUsers[0],
      text: 'Промени статуса на "В процес"',
      date: "2025-08-02 15:31",
    },
    {
      type: "progress",
      user: mockUsers[0],
      text: "Изтеглих и тествах драйвера на моята машина. Всичко работи нормално. Започвам инсталация на останалите.",
      date: "2025-08-02 15:30",
    },
    {
      type: "assistance",
      user: mockUsers[1],
      text: "На компютъра в счетоводството има проблем със съвместимостта. Ще е нужна помощ от системен администратор.",
      date: "2025-08-04 11:22",
    },
    {
      type: "comment",
      user: mockUsers[2],
      text: "Разбрано, ще съдействам на място утре сутрин.",
      date: "2025-08-04 14:00",
    },
    {
      type: "progress",
      user: mockUsers[0],
      text: "Всички драйвери са инсталирани успешно, включително и на проблемната машина.",
      date: "2025-08-05 16:45",
    },
    {
      type: "review",
      user: mockUsers[0],
      text: "Предавам задачата за одобрение.",
      date: "2025-08-05 16:46",
    },
    {
      type: "status_change",
      user: mockUsers[2],
      text: 'Задачата е прегледана и маркирана като "Завършена"',
      date: "2025-08-06 09:15",
    },
  ],
};

// --- Компонент за "5 Защо" Модал ---
const FiveWhysModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  // ... съдържанието на модала остава същото
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Добавете Вашия "5 Защо" Анализ
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-800">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <label
                  htmlFor={`why-modal-${i + 1}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Защо #{i + 1}?
                </label>
                <input
                  type="text"
                  id={`why-modal-${i + 1}`}
                  className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              Запази анализ
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// --- Основен Компонент на Страницата ---
const TaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const task = mockTaskDetail;
  const [progressType, setProgressType] = useState("progress");
  const [activeWhyTab, setActiveWhyTab] = useState(task.fiveWhys[0].user._id);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isProgressDropdownOpen, setIsProgressDropdownOpen] = useState(false);

  // Функции за стилизиране
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "LOW":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  // *** ДОБАВЕНА ЛИПСВАЩА ФУНКЦИЯ ***
  const getProgressTypeStyle = (type: string) => {
    switch (type) {
      case "progress":
        return "border-blue-500";
      case "comment":
        return "border-gray-500";
      case "assistance":
        return "border-red-500";
      case "review":
        return "border-green-500";
      default:
        return "border-gray-300";
    }
  };

  const progressTypeOptions = [
    { value: "progress", label: "Доклад за напредък", color: "bg-blue-500" },
    { value: "comment", label: "Общ коментар", color: "bg-gray-500" },
    { value: "assistance", label: "Искане за помощ", color: "bg-red-500" },
    { value: "review", label: "Предаване за одобрение", color: "bg-green-500" },
  ];

  const getActivityMessageStyle = (type: string) => {
    switch (type) {
      case "progress":
        return {
          bg: "bg-blue-50",
          border: "border-l-blue-500",
          label: "Доклад за напредък",
        };
      case "comment":
        return {
          bg: "bg-gray-50",
          border: "border-l-gray-500",
          label: "Общ коментар",
        };
      case "assistance":
        return {
          bg: "bg-red-50",
          border: "border-l-red-500",
          label: "Искане за помощ",
        };
      case "review":
        return {
          bg: "bg-green-50",
          border: "border-l-green-500",
          label: "Предаване за одобрение",
        };
      case "status_change":
        return {
          bg: "bg-purple-50",
          border: "border-l-purple-500",
          label: "Промяна на статус",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-l-gray-400",
          label: "Дейност",
        };
    }
  };

  const t = (key: string) =>
    key === "details_for" ? "Детайли за сигнал" : key;
  const mockCase: ICase = {
    _id: task.caseNumber.toString(),
    case_number: task.caseNumber,
  } as ICase;
  const activeWhyAnalysis = task.fiveWhys.find(
    (analysis) => analysis.user._id === activeWhyTab
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row bg-gray-50 lg:h-[calc(100vh-6rem)] w-full p-4 gap-4">
        {/* Ляв панел: Детайли */}
        <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityStyle(
                  task.priority
                )} flex items-center gap-1`}
              >
                <FlagIcon className="h-4 w-4" />
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {task.dueDate}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md w-1/2">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                Произход
              </h4>
              <div className="space-y-3">
                <div className="w-20">
                  <CaseLink my_case={mockCase} t={t} />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md w-1/2">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                Възложена от
              </h4>
              <div className="space-y-3">
                <div>
                  <UserLink user={task.creator} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
              Възложена на
            </h4>
            <div className="flex flex-wrap gap-2">
              {task.assignees.map((user) => (
                <UserLink key={user._id} user={user} />
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-gray-500 uppercase">
                "5 Защо" Анализ
              </h4>
              <button
                onClick={() => setIsWhyModalOpen(true)}
                className="text-xs p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                title="Добави твой анализ"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex border-b border-gray-200 mb-2">
              {task.fiveWhys.map((analysis) => (
                <button
                  key={analysis.user._id}
                  onClick={() => setActiveWhyTab(analysis.user._id)}
                  className={`px-3 py-1 text-xs font-medium border-b-2 -mb-px ${
                    activeWhyTab === analysis.user._id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Анализ на {analysis.user.name.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto custom-scrollbar pr-2">
              {activeWhyAnalysis && (
                <ul className="space-y-2 text-sm">
                  {activeWhyAnalysis.whys.map(
                    (why, index) =>
                      index % 2 === 0 && (
                        <li key={index}>
                          <p className="font-semibold text-gray-700">{why}</p>
                          <p className="text-gray-500 pl-2 border-l-2 ml-1">
                            {activeWhyAnalysis.whys[index + 1]}
                          </p>
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Десен панел: Активност */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Работен Процес</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {task.activity.map((item, index) => {
              const style = getActivityMessageStyle(item.type);
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 text-center w-24">
                    <UserLink user={item.user} />
                    <p
                      className={`text-xs mt-1 font-semibold ${style.border.replace(
                        "border-l-",
                        "text-"
                      )}`}
                    >
                      {style.label}
                    </p>
                  </div>
                  <div
                    className={`p-3 w-full rounded-lg border-l-4 ${style.bg} ${style.border}`}
                  >
                    <p className="text-sm text-gray-800">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">Добави запис</h4>
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProgressDropdownOpen(!isProgressDropdownOpen)
                  }
                  className={`flex items-center gap-2 text-xs p-1 pr-2 border-2 rounded-md transition-colors ${getProgressTypeStyle(
                    progressType
                  )}`}
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      progressTypeOptions.find((o) => o.value === progressType)
                        ?.color
                    }`}
                  ></span>
                  {
                    progressTypeOptions.find((o) => o.value === progressType)
                      ?.label
                  }
                </button>
                {isProgressDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border z-10">
                    {progressTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setProgressType(opt.value);
                          setIsProgressDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100"
                      >
                        <span
                          className={`h-3 w-3 rounded-full ${opt.color}`}
                        ></span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <TextEditor height="80px" />
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                Публикувай
              </button>
            </div>
          </div>
        </div>
      </div>

      <FiveWhysModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />
    </>
  );
};

export default TaskPage;
