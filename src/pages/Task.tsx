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
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import TextEditor from "../components/forms/partials/TextEditor";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";

// --- Типове за Данни ---
interface FiveWhysPair {
  why: string;
  because: string;
}

interface RiskAssessment {
  user: IUser;
  probability: number; // 1-5
  impact: number; // 1-5
  description: string;
}

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
  priority: "ВИСОК",
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
      analysis: [
        {
          why: "Защо принтерът не работи?",
          because: "Защото драйверът е остарял.",
        },
        {
          why: "Защо драйверът е остарял?",
          because: "Защото не е бил включен в автоматичните ъпдейти.",
        },
        {
          why: "Защо не е бил включен?",
          because: "Защото е специфичен модел, който изисква ръчна инсталация.",
        },
        {
          why: "Защо изисква ръчна инсталация?",
          because: "Политиката на производителя.",
        },
        {
          why: "Защо следваме тази политика?",
          because: "Нямаме алтернатива за този модел.",
        },
      ],
    },
    {
      user: mockUsers[0],
      analysis: [
        {
          why: "Защо инсталацията отнема толкова време?",
          because: "Защото трябва да се прави на всяка машина поотделно.",
        },
        {
          why: "Защо трябва поотделно?",
          because: "Защото нямаме софтуер за централизирано управление.",
        },
        {
          why: "Защо нямаме такъв софтуер?",
          because: "Не е бил предвиден в бюджета.",
        },
        {
          why: "Защо не е бил предвиден?",
          because: "Проблемът не е бил считан за приоритетен досега.",
        },
        {
          why: "Защо не е бил приоритетен?",
          because: "Защото инцидентните проблеми са били решавани ръчно.",
        },
      ],
    },
  ],
  riskAssessments: [
    {
      user: mockUsers[2],
      probability: 4,
      impact: 3,
      description:
        "Има риск някои стари програми да не са съвместими с новите драйвери, което може да прекъсне работата на финансовия отдел.",
    },
    {
      user: mockUsers[1],
      probability: 2,
      impact: 2,
      description: "Рискът е минимален. Процедурата е стандартна и тествана.",
    },
    {
      user: mockUsers[0],
      probability: 5,
      impact: 5,
      description:
        "Ако драйверът е грешен, може да блокира цялата мрежа от принтери.",
    },
  ] as RiskAssessment[],
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
      text: 'Промени статуса на "Процес"',
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

const FiveWhysModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<FiveWhysPair[]>(
    Array.from({ length: 5 }, () => ({ why: "", because: "" }))
  );

  const handleAnalysisChange = (
    index: number,
    field: "why" | "because",
    value: string
  ) => {
    const newAnalysis = analysis.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setAnalysis(newAnalysis);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Добавете Вашия "5 Защо" Анализ
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-800 cursor-pointer">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {analysis.map((pair, i) => (
              <div
                key={i}
                className="p-3 border-gray-300 border-2 rounded-md bg-gray-50/50 space-y-2"
              >
                <h4 className="font-semibold text-gray-500 text-sm">
                  Двойка #{i + 1}
                </h4>
                <div>
                  <label
                    htmlFor={`why-modal-${i + 1}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Защо?
                  </label>
                  <input
                    type="text"
                    id={`why-modal-${i + 1}`}
                    value={pair.why}
                    onChange={(e) =>
                      handleAnalysisChange(i, "why", e.target.value)
                    }
                    className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
                    placeholder="..."
                  />
                </div>
                <div>
                  <label
                    htmlFor={`because-modal-${i + 1}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Защото...
                  </label>
                  <input
                    type="text"
                    id={`because-modal-${i + 1}`}
                    value={pair.because}
                    onChange={(e) =>
                      handleAnalysisChange(i, "because", e.target.value)
                    }
                    className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
                    placeholder="..."
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Запази анализ
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const customSliderStyles = `
  .custom-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    margin-top: 0px; /* Center the thumb on the track */
    background-color: currentColor; /* Inherit color from the text-color utility */
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: grab;
  }

  .custom-range::-moz-range-thumb {
    background-color: currentColor;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: none;
    cursor: grab;
  }
`;

const RiskAssessmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [description, setDescription] = useState("");

  const getSliderColor = (value: number) => {
    switch (value) {
      case 1:
        return "accent-green-500 text-green-500";
      case 2:
        return "accent-lime-500 text-lime-500";
      case 3:
        return "accent-yellow-500 text-yellow-500";
      case 4:
        return "accent-orange-500 text-orange-500";
      default:
        return "accent-red-500 text-red-500";
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <style>{customSliderStyles}</style>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Добавете Оценка на Риска
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-800 cursor-pointer">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="probability"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Вероятност ({probability})
              </label>
              <input
                id="probability"
                type="range"
                min="1"
                max="5"
                step="1"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className={`custom-range w-full h-2 rounded-lg appearance-none cursor-pointer ${getSliderColor(
                  probability
                )} bg-[linear-gradient(to_right,_#22c55e50_0%,_#facc1550_50%,_#ef444450_100%)]`}
              />
            </div>
            <div>
              <label
                htmlFor="impact"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Влияние ({impact})
              </label>
              <input
                id="impact"
                type="range"
                min="1"
                max="5"
                step="1"
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className={`custom-range w-full h-2 rounded-lg appearance-none cursor-pointer ${getSliderColor(
                  impact
                )} bg-[linear-gradient(to_right,_#22c55e50_0%,_#facc1550_50%,_#ef444450_100%)]`}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Описание на риска
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 border-gray-300"
                placeholder="Опишете потенциалните рискове..."
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Запази оценка
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const RiskMatrixModal: React.FC<{
  assessments: RiskAssessment[];
  isOpen: boolean;
  onClose: () => void;
}> = ({ assessments, isOpen, onClose }) => {
  const impactLabels: { [key: number]: string } = {
    1: "Незначително",
    2: "Ниско",
    3: "Умерено",
    4: "Значително",
    5: "Катастрофално",
  };
  const probabilityLabels: { [key: number]: string } = {
    1: "Малко вер.",
    2: "Рядка",
    3: "Случайна",
    4: "Вероятна",
    5: "Честа",
  };

  const impactAxisValues = [1, 2, 3, 4, 5];
  const probabilityAxisValues = [5, 4, 3, 2, 1];

  const getRiskCellColor = (impact: number, probability: number) => {
    const score = impact * probability;
    if (score <= 4) return "bg-green-200/70";
    if (score <= 9) return "bg-yellow-200/70";
    if (score <= 15) return "bg-orange-300/70";
    return "bg-red-300/70";
  };

  const getOverallRiskInfo = () => {
    if (assessments.length === 0) {
      return {
        text: "НЕОЦЕНЕН",
        style: "text-gray-500 bg-gray-100",
        score: 0,
      };
    }
    const maxScore = Math.max(
      ...assessments.map((a) => a.impact * a.probability)
    );
    if (maxScore <= 4)
      return {
        text: "НИСЪК",
        style: "text-green-800 bg-green-100",
        score: maxScore,
      };
    if (maxScore <= 9)
      return {
        text: "СРЕДЕН",
        style: "text-yellow-800 bg-yellow-100",
        score: maxScore,
      };
    if (maxScore <= 15)
      return {
        text: "ВИСОК",
        style: "text-orange-800 bg-orange-100",
        score: maxScore,
      };
    return {
      text: "КРИТИЧЕН",
      style: "text-red-800 bg-red-100",
      score: maxScore,
    };
  };

  const overallRisk = getOverallRiskInfo();
  // --- CHANGE START: Find the specific assessment corresponding to the max score ---
  const maxRiskAssessment =
    assessments.find((a) => a.impact * a.probability === overallRisk.score) ||
    null;
  // --- CHANGE END ---

  const matrixGridItems = [];
  probabilityAxisValues.forEach((probability) => {
    matrixGridItems.push(
      <div
        key={`prob-label-${probability}`}
        className="font-semibold text-xs text-center p-2 flex items-center justify-end"
      >
        {probabilityLabels[probability]} ({probability})
      </div>
    );
    impactAxisValues.forEach((impact) => {
      matrixGridItems.push(
        <div
          key={`cell-${probability}-${impact}`}
          className={`relative w-full aspect-square rounded flex items-center justify-center ${getRiskCellColor(
            impact,
            probability
          )}`}
        >
          {/* --- CHANGE START: Reworked cell content to include tooltips --- */}
          <div className="absolute flex flex-col items-center justify-center gap-y-1">
            {assessments
              .filter(
                (a) => a.probability === probability && a.impact === impact
              )
              .map((a) => (
                <div
                  key={a.user._id}
                  className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-0.5 pr-1.5"
                >
                  <UserLink user={a.user} />
                  <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger asChild>
                      <button>
                        <InformationCircleIcon className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-xs rounded-md p-2 max-w-xs shadow-lg z-50"
                        sideOffset={5}
                      >
                        {a.description}
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              ))}
          </div>
          {/* --- CHANGE END --- */}
        </div>
      );
    });
  });

  matrixGridItems.push(<div key="bottom-left-spacer" />);
  impactAxisValues.forEach((impact) => {
    matrixGridItems.push(
      <div
        key={`impact-label-${impact}`}
        className="font-semibold text-xs text-center pt-2 flex items-center justify-center"
      >
        {impactLabels[impact]} ({impact})
      </div>
    );
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <Dialog.Portal>
        {/* --- CHANGE START: Wrap the modal content in a Tooltip Provider --- */}
        <Tooltip.Provider>
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                Матрица на Риска
              </Dialog.Title>
              {/* --- CHANGE START: Reworked risk display to include tooltip --- */}
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>Максимален риск:</span>
                <span className={`px-2 py-1 rounded-full ${overallRisk.style}`}>
                  {overallRisk.score > 0
                    ? `${overallRisk.text} (${overallRisk.score})`
                    : overallRisk.text}
                </span>
                {maxRiskAssessment && (
                  <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger asChild>
                      <button>
                        <InformationCircleIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-xs rounded-md p-2 max-w-xs shadow-lg z-50"
                        sideOffset={5}
                      >
                        {maxRiskAssessment.description}
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}
              </div>
              {/* --- CHANGE END --- */}
              <Dialog.Close asChild>
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-800 cursor-pointer">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex items-stretch">
              <div
                className="flex items-center justify-center -rotate-180 p-2"
                style={{ writingMode: "vertical-rl" }}
              >
                <span className="font-bold text-sm">Вероятност</span>
              </div>
              <div className="flex-grow">
                <div className="grid grid-cols-[auto_repeat(5,1fr)] grid-rows-[repeat(5,1fr)_auto] gap-x-1 gap-y-1">
                  {matrixGridItems}
                </div>
                <div className="text-center mt-2 font-bold text-sm">
                  Влияние
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Tooltip.Provider>
        {/* --- CHANGE END --- */}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const TaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const task = mockTaskDetail;
  const [progressType, setProgressType] = useState("progress");
  const [activeWhyTab, setActiveWhyTab] = useState(task.fiveWhys[0].user._id);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isProgressDropdownOpen, setIsProgressDropdownOpen] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<
    "fiveWhys" | "riskAssessment"
  >("fiveWhys");
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Процес");
  const [isRiskMatrixModalOpen, setIsRiskMatrixModalOpen] = useState(false);

  const RiskAssessmentItem: React.FC<{ assessment: RiskAssessment }> = ({
    assessment,
  }) => {
    const riskScore = assessment.probability * assessment.impact;
    const getRiskStyle = () => {
      if (riskScore <= 4)
        return {
          text: "НИСЪK",
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-500",
        };
      if (riskScore <= 12)
        return {
          text: "СРЕДЕН",
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-500",
        };
      return {
        text: "ВИСОК",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-500",
      };
    };
    const riskStyle = getRiskStyle();

    return (
      <div
        className={`p-3 rounded-md border-l-4 ${riskStyle.bg} ${riskStyle.border}`}
      >
        <div className="flex justify-between items-center mb-2">
          <UserLink user={assessment.user} />
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-full ${riskStyle.bg} ${riskStyle.color}`}
          >
            {riskStyle.text}
          </span>
        </div>
        <p className="text-sm text-gray-700">{assessment.description}</p>
        <div className="text-xs text-gray-500 mt-2 flex gap-4">
          <span>
            Вероятност: <strong>{assessment.probability}</strong>/5
          </span>
          <span>
            Влияние: <strong>{assessment.impact}</strong>/5
          </span>
        </div>
      </div>
    );
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "ВИСОК":
        return "text-red-600 bg-red-100";
      case "СРЕДЕН":
        return "text-yellow-600 bg-yellow-100";
      case "НИСЪК":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getStatusUI = (status: string) => {
    switch (status) {
      case "Процес":
        return {
          style: "bg-yellow-100 text-yellow-800",
          icon: <ClockIcon className="h-4 w-4" />,
        };
      case "За изпълнение":
        return {
          style: "bg-blue-100 text-blue-800",
          icon: <PlayCircleIcon className="h-4 w-4" />,
        };
      case "Завършена":
        return {
          style: "bg-green-100 text-green-800",
          icon: <CheckCircleIcon className="h-4 w-4" />,
        };
      default:
        return {
          style: "bg-gray-100 text-gray-800",
          icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
        };
    }
  };

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
      case "status_change":
        return "border-purple-500";
      default:
        return "border-gray-300";
    }
  };

  const progressTypeOptions = [
    { value: "progress", label: "Доклад за напредък", color: "bg-blue-500" },
    { value: "comment", label: "Общ коментар", color: "bg-gray-500" },
    { value: "assistance", label: "Искане за помощ", color: "bg-red-500" },
    { value: "review", label: "Предаване за одобрение", color: "bg-green-500" },
    {
      value: "status_change",
      label: "Промяна на статус",
      color: "bg-purple-500",
    },
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
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex-1">
                {task.title}
              </h2>
            </div>
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

              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  getStatusUI(task.status).style
                } flex items-center gap-1 flex-shrink-0`}
              >
                {getStatusUI(task.status).icon}
                {task.status}
              </span>
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
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-gray-500 uppercase">
                  Анализи
                </h4>
              </div>
              <button
                onClick={() => {
                  activeAnalysisTab === "fiveWhys"
                    ? setIsWhyModalOpen(true)
                    : setIsRiskModalOpen(true);
                }}
                className="text-xs p-1 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
                title="Добави нов анализ"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex border-b border-gray-200 mb-3">
              <button
                onClick={() => setActiveAnalysisTab("fiveWhys")}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium border-b-2 -mb-px ${
                  activeAnalysisTab === "fiveWhys"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                <QuestionMarkCircleIcon className="h-4 w-4" />5 Защо
              </button>
              <button
                onClick={() => setActiveAnalysisTab("riskAssessment")}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium border-b-2 -mb-px ${
                  activeAnalysisTab === "riskAssessment"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Оценка на риска
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar pr-2">
              {activeAnalysisTab === "fiveWhys" && (
                <>
                  <div className="flex border-b border-gray-200 mb-2">
                    {task.fiveWhys.map((analysis) => (
                      <button
                        key={analysis.user._id}
                        onClick={() => setActiveWhyTab(analysis.user._id)}
                        className={`px-3 py-1 text-xs font-medium border-b-2 -mb-px ${
                          activeWhyTab === analysis.user._id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                        }`}
                      >
                        Анализ на {analysis.user.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  {activeWhyAnalysis && (
                    <ul className="space-y-3 text-sm">
                      {activeWhyAnalysis.analysis.map((pair, index) => (
                        <li key={index}>
                          <p className="font-semibold text-gray-700">
                            {pair.why}
                          </p>
                          <p className="text-gray-600 pl-2 border-l-2 ml-1 italic">
                            {pair.because}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeAnalysisTab === "riskAssessment" && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsRiskMatrixModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    <TableCellsIcon className="h-5 w-5" />
                    Покажи Матрица на Риска
                  </button>
                  {task.riskAssessments.length > 0 ? (
                    task.riskAssessments.map((assessment, index) => (
                      <RiskAssessmentItem key={index} assessment={assessment} />
                    ))
                  ) : (
                    <p className="text-sm text-center text-gray-500 py-4">
                      Няма добавени оценки на риска.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Десен панел: Активност */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-400">
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
          <div className="p-4 border-t border-gray-400 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">Добави запис</h4>
              <div className="flex items-center gap-2">
                {progressType === "status_change" && (
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm cursor-pointer"
                  >
                    <option value="За изпълнение">За изпълнение</option>
                    <option value="Процес">В процес</option>
                    <option value="Завършена">Завършена</option>
                  </select>
                )}
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsProgressDropdownOpen(!isProgressDropdownOpen)
                    }
                    className={`flex items-center gap-2 text-xs p-1 pr-2 border-2 rounded-md transition-colors cursor-pointer ${getProgressTypeStyle(
                      progressType
                    )}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${
                        progressTypeOptions.find(
                          (o) => o.value === progressType
                        )?.color
                      }`}
                    ></span>
                    {
                      progressTypeOptions.find((o) => o.value === progressType)
                        ?.label
                    }
                  </button>
                  {isProgressDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      {progressTypeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setProgressType(opt.value);
                            setIsProgressDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
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
            </div>
            <TextEditor height="80px" />
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 cursor-pointer">
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
      <RiskAssessmentModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
      />
      <RiskMatrixModal
        assessments={task.riskAssessments}
        isOpen={isRiskMatrixModalOpen}
        onClose={() => setIsRiskMatrixModalOpen(false)}
      />
    </>
  );
};

export default TaskPage;
