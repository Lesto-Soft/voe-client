// src/components/modals/CreateTaskModal.tsx

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ICase, IAnswer, IUser } from "../../db/interfaces";
import { XMarkIcon } from "@heroicons/react/24/outline";
import TextEditor from "../forms/partials/TextEditor";

// --- Помощни Типове и Компоненти за Модалния Прозорец ---

interface SubTask {
  id: number;
  title: string;
}

// --- Стъпка 1: Компонент за Дефиниране на Задачата ---
const Step1_TaskDefinition: React.FC<{
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="taskTitle"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Заглавие на задачата <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="taskTitle"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
        />
      </div>
      <div>
        <label
          htmlFor="taskDescription"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Описание
        </label>
        <TextEditor
          content={formData.description}
          onUpdate={(html) => setFormData({ ...formData, description: html })}
          height="150px"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Приоритет
          </label>
          <div className="flex space-x-4">
            {["НИСЪК", "СРЕДЕН", "ВИСОК"].map((p) => (
              <label key={p} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={formData.priority.toUpperCase() === p}
                  onChange={() => setFormData({ ...formData, priority: p })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">{p}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Краен срок (Опционално)
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

// --- Стъпка 2: Компонент за "5 Защо" Анализ ---
const Step2_FiveWhys: React.FC<{
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}> = ({ formData, setFormData }) => {
  const handleWhyChange = (index: number, value: string) => {
    const newWhys = [...formData.whys];
    newWhys[index] = value;
    setFormData({ ...formData, whys: newWhys });
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Анализирайте първопричината на проблема, като си зададете въпроса
        "Защо?" пет пъти.
      </p>
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <label
            htmlFor={`why-${i + 1}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Защо #{i + 1}?
          </label>
          <input
            type="text"
            id={`why-${i + 1}`}
            value={formData.whys[i]}
            onChange={(e) => handleWhyChange(i, e.target.value)}
            className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
          />
        </div>
      ))}
    </div>
  );
};

// --- Стъпка 3: Компонент за Подзадачи и Възлагане ---
const Step3_SubtasksAndAssignment: React.FC<{
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}> = ({ formData, setFormData }) => {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddSubtask = () => {
    if (newSubtask.trim() === "") return;
    const newSubtaskObject: SubTask = {
      id: Date.now(),
      title: newSubtask.trim(),
    };
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, newSubtaskObject],
    });
    setNewSubtask("");
  };

  const handleRemoveSubtask = (id: number) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((st: SubTask) => st.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Секция за подзадачи */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Подзадачи (Опционално)
        </label>
        <div className="space-y-2">
          {formData.subtasks.map((st: SubTask) => (
            <div
              key={st.id}
              className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
            >
              <span className="text-sm">{st.title}</span>
              <button
                onClick={() => handleRemoveSubtask(st.id)}
                className="p-1 text-gray-500 hover:text-red-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Добавете подзадача..."
            className="flex-grow rounded-l-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
          />
          <button
            onClick={handleAddSubtask}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-r-md hover:bg-gray-700"
          >
            -&gt;
          </button>
        </div>
      </div>
      {/* Секция за възлагане */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Възложи на <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500"> (Търсене на потребител)</p>
        <div className="bg-gray-200 p-4 rounded-md h-32 flex items-center justify-center">
          <p className="text-gray-500">
            Тук ще се намира компонентът за избор на потребител.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Основен Компонент на Модалния Прозорец ---
interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  originatingCase: ICase;
  originatingAnswer: IAnswer;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  originatingCase,
  originatingAnswer,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: `Задача по Сигнал #${originatingCase.case_number}`,
    description: originatingAnswer.content || "",
    priority: "MEDIUM",
    dueDate: "",
    whys: ["", "", "", "", ""],
    subtasks: [] as SubTask[],
    assignees: [] as IUser[],
  });

  const totalSteps = 3;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl max-h-[90vh] flex flex-col focus:outline-none">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Създаване на нова задача - Стъпка {step} от {totalSteps}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-800">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* КОРЕКЦИЯ: Добавен е контейнер с минимална височина */}
          <div
            className="flex-grow overflow-y-auto pr-2"
            style={{ minHeight: "525px" }}
          >
            {step === 1 && (
              <Step1_TaskDefinition
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {step === 2 && (
              <Step2_FiveWhys formData={formData} setFormData={setFormData} />
            )}
            {step === 3 && (
              <Step3_SubtasksAndAssignment
                formData={formData}
                setFormData={setFormData}
              />
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
                >
                  Назад
                </button>
              )}
            </div>
            <div>
              {step < totalSteps ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                  Напред
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
                >
                  Създай задача
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateTaskModal;
