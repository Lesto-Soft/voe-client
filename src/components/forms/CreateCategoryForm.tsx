// src/components/forms/CreateCategoryForm.tsx
import React, { useState, useEffect } from "react";
import { ICategory, IUser } from "../../db/interfaces"; // Adjust path
import { useCreateCategoryFormState } from "./hooks/useCreateCategoryFormState"; // Adjust path
import CategoryInputFields from "./partials/CategoryInputFields"; // Adjust path

export interface CategoryFormData {
  name: string;
  problem?: string;
  suggestion?: string;
  expertIds?: string[];
  managerIds?: string[];
  archived?: boolean;
}

interface ILeanUserForForm {
  _id: string;
  name: string;
  role: { _id: string } | null;
}

interface CreateCategoryFormProps {
  onSubmit: (
    formData: CategoryFormData,
    editingCategoryId: string | null
  ) => Promise<void>;
  onClose: () => void;
  initialData: ICategory | null;
  submitButtonText?: string;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  allUsersForForm: ILeanUserForForm[];
  allUsersForFormLoading: boolean;
}

const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  submitButtonText,
  isSubmitting = false,
  onDirtyChange,
  allUsersForForm,
  allUsersForFormLoading,
}) => {
  const {
    name,
    setName,
    problem,
    setProblem,
    suggestion,
    setSuggestion,
    expertIds,
    setExpertIds,
    managerIds,
    setManagerIds,
    archived,
    setArchived,
    nameError,
    setNameError,
    initialExpertObjects, // These are ILeanUser in useCreateCategoryFormState
    initialManagerObjects, // These are ILeanUser in useCreateCategoryFormState
  } = useCreateCategoryFormState({ initialData, onDirtyChange });

  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitError(null);
    setNameError(null);

    const finalTrimmedName = name.trim();
    if (!finalTrimmedName) {
      setNameError("Името на категорията е задължително.");
      return;
    }

    const formDataObject: CategoryFormData = {
      name: finalTrimmedName,
      problem: problem.trim() || undefined,
      suggestion: suggestion.trim() || undefined,
      expertIds: expertIds.length > 0 ? expertIds : undefined,
      managerIds: managerIds.length > 0 ? managerIds : undefined,
      archived: archived,
    };

    try {
      await onSubmit(formDataObject, initialData?._id || null);
    } catch (error: any) {
      console.error("Error submitting category form:", error);
      setFormSubmitError(error.message || "Възникна грешка при запис.");
    }
  };

  const errorPlaceholderClass = "mt-1 text-xs min-h-[1.2em]";

  if (allUsersForFormLoading) {
    return (
      <div className="p-4 text-center">
        Зареждане на потребители за форма...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <CategoryInputFields
          name={name}
          setName={setName}
          nameError={nameError}
          problem={problem}
          setProblem={setProblem}
          suggestion={suggestion}
          setSuggestion={setSuggestion}
          expertIds={expertIds}
          setExpertIds={setExpertIds}
          managerIds={managerIds}
          setManagerIds={setManagerIds}
          archived={archived}
          setArchived={setArchived}
          errorPlaceholderClass={errorPlaceholderClass}
          initialExperts={initialExpertObjects as ILeanUserForForm[]} // Cast to match expected type in CategoryInputFields
          initialManagers={initialManagerObjects as ILeanUserForForm[]} // Cast to match
          allUsersForAssigning={allUsersForForm}
          usersLoading={allUsersForFormLoading}
        />
      </div>

      {formSubmitError && (
        <div className="mt-6 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">
          {formSubmitError}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          type="submit"
          disabled={isSubmitting || allUsersForFormLoading}
          className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Запис..."
            : submitButtonText ||
              (initialData ? "Запази промените" : "Създай категория")}
        </button>
      </div>
    </form>
  );
};
export default CreateCategoryForm;
