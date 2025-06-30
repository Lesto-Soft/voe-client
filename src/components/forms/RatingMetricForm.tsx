// src/components/forms/RatingMetricForm.tsx
import React, { useState, useEffect } from "react";
import { IRatingMetric } from "../../db/interfaces";

interface RatingMetricFormProps {
  onSubmit: (formData: Partial<IRatingMetric>) => void;
  onClose: () => void;
  initialData: IRatingMetric | null;
  isLoading: boolean;
}

const RatingMetricForm: React.FC<RatingMetricFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    if (!name.trim()) {
      setError("Името на метриката е задължително.");
      return;
    }
    if (!description.trim()) {
      setError("Описанието на метриката е задължително.");
      return;
    }

    const formData: Partial<IRatingMetric> = { name, description, archived };
    onSubmit(formData);
  };

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
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              error?.includes("Име") ? "border-red-500" : "border-gray-300"
            }`}
          />
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
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              error?.includes("Описание") ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>

        {/* --- CHANGE IS HERE --- */}
        {/* Archived Status - Now always visible */}
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="metricArchived"
            name="metricArchived"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
          />
          <label
            htmlFor="metricArchived"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Архивирана
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-1 text-xs text-red-500 min-h-[1.2em]">{error}</div>
        )}
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
