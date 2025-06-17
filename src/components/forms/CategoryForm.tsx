// src/components/forms/CategoryForm.tsx
// NOTE: This file was renamed from CreateCategoryForm.tsx
import React, { useState } from "react";
import { ICategory } from "../../db/interfaces"; // Adjust path
import { useCategoryFormState } from "./hooks/useCategoryFormState"; // Adjust path
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
  username: string;
  role: { _id: string } | null;
}

// Interface name updated
interface CategoryFormProps {
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

// Component name updated
const CategoryForm: React.FC<CategoryFormProps> = ({
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
    initialExpertObjects,
    initialManagerObjects,
  } = useCategoryFormState({ initialData, onDirtyChange });

  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const [problemError, setProblemError] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitError(null);
    setNameError(null);
    setProblemError(null);
    setSuggestionError(null);

    const finalTrimmedName = name.trim();
    const finalTrimmedProblem = problem.trim();
    const finalTrimmedSuggestion = suggestion.trim();
    let hasValidationErrors = false;

    if (!finalTrimmedName) {
      setNameError("Името на категорията е задължително.");
      hasValidationErrors = true;
    } else if (finalTrimmedName.length < 3) {
      setNameError("Името на категорията трябва да е поне 3 символа.");
      hasValidationErrors = true;
    } else if (finalTrimmedName.length > 25) {
      setNameError(
        "Името на категорията не може да бъде по-дълго от 25 символа."
      );
      hasValidationErrors = true;
    }

    // Validation for 'problem' field (if not empty)
    if (finalTrimmedProblem.length < 10) {
      setProblemError(
        "Описанието на проблема е задължително и трябва да е поне 10 символа."
      );
      hasValidationErrors = true;
    }

    // Validation for 'suggestion' field (if not empty)
    if (finalTrimmedSuggestion.length < 10) {
      setSuggestionError(
        "Описанието на предложението е задължително и трябва да е поне 10 символа."
      );
      hasValidationErrors = true;
    }

    if (hasValidationErrors) {
      return;
    }

    const formDataObject: CategoryFormData = {
      name: finalTrimmedName,
      problem: finalTrimmedProblem || undefined,
      suggestion: finalTrimmedSuggestion || undefined,
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
          problemError={problemError}
          suggestion={suggestion}
          setSuggestion={setSuggestion}
          suggestionError={suggestionError}
          expertIds={expertIds}
          setExpertIds={setExpertIds}
          managerIds={managerIds}
          setManagerIds={setManagerIds}
          archived={archived}
          setArchived={setArchived}
          errorPlaceholderClass={errorPlaceholderClass}
          initialExperts={initialExpertObjects as ILeanUserForForm[]}
          initialManagers={initialManagerObjects as ILeanUserForForm[]}
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
// Export name updated
export default CategoryForm;
