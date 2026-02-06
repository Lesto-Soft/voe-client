import React, { useState, useEffect } from "react";
import { IFiveWhy, IWhyStep } from "../../../db/interfaces";

interface FiveWhyFormProps {
  fiveWhy?: IFiveWhy;
  onSubmit: (data: {
    whys: IWhyStep[];
    rootCause: string;
    counterMeasures: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const emptyWhys = (): IWhyStep[] =>
  Array.from({ length: 5 }, () => ({ question: "", answer: "" }));

const FiveWhyForm: React.FC<FiveWhyFormProps> = ({
  fiveWhy,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [whys, setWhys] = useState<IWhyStep[]>(emptyWhys());
  const [rootCause, setRootCause] = useState("");
  const [counterMeasures, setCounterMeasures] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize form when editing
  useEffect(() => {
    if (fiveWhy) {
      // Strip __typename and pad to 5 if fewer than 5 whys
      const cleanedWhys = fiveWhy.whys.map((w) => ({
        question: w.question,
        answer: w.answer,
      }));
      while (cleanedWhys.length < 5) {
        cleanedWhys.push({ question: "", answer: "" });
      }
      setWhys(cleanedWhys.slice(0, 5));
      setRootCause(fiveWhy.rootCause);
      setCounterMeasures(fiveWhy.counterMeasures);
    } else {
      setWhys(emptyWhys());
      setRootCause("");
      setCounterMeasures("");
    }
  }, [fiveWhy]);

  const handleWhyChange = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const newWhys = whys.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setWhys(newWhys);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that at least the first why pair is filled
    const firstWhy = whys[0];
    if (!firstWhy.question.trim() || !firstWhy.answer.trim()) {
      setError("Поне първата двойка въпрос/отговор трябва да бъде попълнена.");
      return;
    }

    if (!rootCause.trim()) {
      setError("Първопричината е задължителна.");
      return;
    }

    if (!counterMeasures.trim()) {
      setError("Контрамерките са задължителни.");
      return;
    }

    // Filter out empty pairs but keep filled ones
    const filledWhys = whys.filter((w) => w.question.trim() || w.answer.trim());

    onSubmit({
      whys: filledWhys,
      rootCause: rootCause.trim(),
      counterMeasures: counterMeasures.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Why pairs */}
      <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar-xs">
        {whys.map((pair, i) => (
          <div
            key={i}
            className="p-3 border border-gray-300 rounded-md bg-gray-50/50 space-y-2"
          >
            <h4 className="font-semibold text-gray-500 text-sm">
              Двойка #{i + 1}{" "}
              {i === 0 && <span className="text-red-500">*</span>}
            </h4>
            <div>
              <label
                htmlFor={`why-${i}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Защо?
              </label>
              <input
                type="text"
                id={`why-${i}`}
                value={pair.question}
                onChange={(e) => handleWhyChange(i, "question", e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Въведете въпрос..."
              />
            </div>
            <div>
              <label
                htmlFor={`because-${i}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Защото...
              </label>
              <input
                type="text"
                id={`because-${i}`}
                value={pair.answer}
                onChange={(e) => handleWhyChange(i, "answer", e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Въведете отговор..."
              />
            </div>
          </div>
        ))}
      </div>

      {/* Root Cause */}
      <div className="pt-2 border border-0 border-t-2 border-gray-300">
        <label
          htmlFor="root-cause"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Първопричина <span className="text-red-500">*</span>
        </label>
        <textarea
          id="root-cause"
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          placeholder="Въведете идентифицираната първопричина..."
        />
      </div>

      {/* Counter Measures */}
      <div>
        <label
          htmlFor="counter-measures"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Контрамерки <span className="text-red-500">*</span>
        </label>
        <textarea
          id="counter-measures"
          value={counterMeasures}
          onChange={(e) => setCounterMeasures(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          placeholder="Опишете предложените контрамерки..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          disabled={isLoading}
        >
          Отмени
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Запазване..."
            : fiveWhy
              ? "Запази промените"
              : "Създай анализ"}
        </button>
      </div>
    </form>
  );
};

export default FiveWhyForm;
