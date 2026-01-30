// src/components/forms/RatingMetricForm.tsx
import React, { useState, useEffect } from "react";
import { IRatingMetric } from "../../db/interfaces";

// NEW: Add validation constants based on the backend schema
const VALIDATION = {
  NAME: { MIN: 3, MAX: 50 },
  DESCRIPTION: { MIN: 10, MAX: 200 },
};

interface RatingMetricFormProps {
  onSubmit: (formData: Partial<IRatingMetric>) => void;
  onClose: () => void;
  initialData: IRatingMetric | null;
  isLoading: boolean;
}

const RatingMetricForm: React.FC<RatingMetricFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [archived, setArchived] = useState(false);

  // NEW: Specific error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setArchived(initialData.archived);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // NEW: Reset specific errors
    setNameError(null);
    setDescriptionError(null);
    let hasErrors = false;

    const trimmedName = name.trim();
    if (trimmedName.length < VALIDATION.NAME.MIN) {
      setNameError(`Името трябва да е поне ${VALIDATION.NAME.MIN} символа.`);
      hasErrors = true;
    } else if (trimmedName.length > VALIDATION.NAME.MAX) {
      setNameError(
        `Името не може да бъде по-дълго от ${VALIDATION.NAME.MAX} символа.`
      );
      hasErrors = true;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < VALIDATION.DESCRIPTION.MIN) {
      setDescriptionError(
        `Описанието трябва да е поне ${VALIDATION.DESCRIPTION.MIN} символа.`
      );
      hasErrors = true;
    } else if (trimmedDescription.length > VALIDATION.DESCRIPTION.MAX) {
      setDescriptionError(
        `Описанието не може да бъде по-дълго от ${VALIDATION.DESCRIPTION.MAX} символа.`
      );
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const formData: Partial<IRatingMetric> = {
      name: trimmedName,
      description: trimmedDescription,
      archived,
    };
    onSubmit(formData);
  };

  const errorPlaceholderClass = "mt-1 text-xs min-h-[1.2em]";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-y-4">
        {/* Metric Name */}
        <div>
          <label
            htmlFor="metricName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Име на метрика<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="metricName"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            maxLength={VALIDATION.NAME.MAX + 5} // Allow some overtyping
            className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
              nameError ? "border-red-500" : "border-gray-300"
            }`}
          />
          <div className="flex justify-between items-center">
            <p
              className={`${errorPlaceholderClass} ${
                nameError ? "text-red-500" : ""
              }`}
            >
              {nameError || <>&nbsp;</>}
            </p>
            <p
              className={`text-xs ${
                name.length > VALIDATION.NAME.MAX
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {name.length} / {VALIDATION.NAME.MAX}
            </p>
          </div>
        </div>

        {/* Metric Description */}
        <div>
          <label
            htmlFor="metricDescription"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Описание<span className="text-red-500">*</span>
          </label>
          <textarea
            id="metricDescription"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (descriptionError) setDescriptionError(null);
            }}
            maxLength={VALIDATION.DESCRIPTION.MAX + 10} // Allow some overtyping
            className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 resize-none ${
              descriptionError ? "border-red-500" : "border-gray-300"
            }`}
          />
          <div className="flex justify-between items-center">
            <p
              className={`${errorPlaceholderClass} ${
                descriptionError ? "text-red-500" : ""
              }`}
            >
              {descriptionError || <>&nbsp;</>}
            </p>
            <p
              className={`text-xs ${
                description.length > VALIDATION.DESCRIPTION.MAX
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {description.length} / {VALIDATION.DESCRIPTION.MAX}
            </p>
          </div>
        </div>

        {/* Archived Status */}
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="metricArchived"
            name="metricArchived"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
            className="cursor-pointer h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
          />
          <label
            htmlFor="metricArchived"
            className="cursor-pointer ml-2 text-sm font-medium text-gray-700"
          >
            Архивирана
          </label>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Запазване..."
            : isEditing
            ? "Запази промените"
            : "Създай метрика"}
        </button>
      </div>
    </form>
  );
};

export default RatingMetricForm;
