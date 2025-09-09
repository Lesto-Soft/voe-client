// src/components/forms/CategoryForm.tsx
// NOTE: This file was renamed from CreateCategoryForm.tsx
import React, { useState, useRef } from "react";
import { ICategory, IPaletteColor } from "../../db/interfaces"; // Adjust path
import { useCategoryFormState } from "./hooks/useCategoryFormState"; // Adjust path
import CategoryInputFields from "./partials/CategoryInputFields"; // Adjust path
import { getTextLength } from "../../utils/contentRenderer";
import { CATEGORY_HELPERS } from "../../utils/GLOBAL_PARAMETERS";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import ColorManagementDialog from "./partials/ColorManagementDialog";

export interface CategoryFormData {
  name: string;
  color: string;
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
  usedColors: { color: string; categoryName: string }[];
  allUsersForForm: ILeanUserForForm[];
  allUsersForFormLoading: boolean;
  paletteColors: IPaletteColor[];
  paletteColorsLoading: boolean;
  canManageColors: boolean;
}

// Component name updated
const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  initialData = null,
  submitButtonText,
  isSubmitting = false,
  onDirtyChange,
  usedColors,
  allUsersForForm,
  allUsersForFormLoading,
  paletteColors,
  paletteColorsLoading,
  canManageColors,
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
    color,
    setColor,
    nameError,
    setNameError,
    initialExpertObjects,
    initialManagerObjects,
  } = useCategoryFormState({ initialData, onDirtyChange });

  const [isColorManagerOpen, setIsColorManagerOpen] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const [problemError, setProblemError] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // add ref to hold form data while dialog is open
  const pendingSubmitData = useRef<{
    formData: CategoryFormData;
    editingCategoryId: string | null;
  } | null>(null);

  // create handler for dialog confirmation
  const handleConfirmSubmit = () => {
    if (pendingSubmitData.current) {
      const { formData, editingCategoryId } = pendingSubmitData.current;
      onSubmit(formData, editingCategoryId);
    }
    setIsConfirmOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitError(null);
    setNameError(null);
    setProblemError(null);
    setSuggestionError(null);

    const finalTrimmedName = name.trim();
    const problemLength = getTextLength(problem);
    const suggestionLength = getTextLength(suggestion);
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

    // UPDATED validation for 'problem' field
    if (problemLength < CATEGORY_HELPERS.MIN) {
      setProblemError(
        `Описанието на проблема е задължително и трябва да е поне ${CATEGORY_HELPERS.MIN} символа.`
      );
      hasValidationErrors = true;
    } else if (problemLength > CATEGORY_HELPERS.MAX) {
      setProblemError(
        `Описанието на проблема не може да надвишава ${CATEGORY_HELPERS.MAX} символа.`
      );
      hasValidationErrors = true;
    }

    // UPDATED validation for 'suggestion' field
    if (suggestionLength < CATEGORY_HELPERS.MIN) {
      setSuggestionError(
        `Описанието на предложението е задължително и трябва да е поне ${CATEGORY_HELPERS.MIN} символа.`
      );
      hasValidationErrors = true;
    } else if (suggestionLength > CATEGORY_HELPERS.MAX) {
      setSuggestionError(
        `Описанието на предложението не може да надвишава ${CATEGORY_HELPERS.MAX} символа.`
      );
      hasValidationErrors = true;
    }

    if (hasValidationErrors) {
      return;
    }

    const formDataObject: CategoryFormData = {
      name: finalTrimmedName,
      color: color,
      problem: problem, // Send the full HTML
      suggestion: suggestion, // Send the full HTML
      expertIds: expertIds.length > 0 ? expertIds : undefined,
      managerIds: managerIds.length > 0 ? managerIds : undefined,
      archived: archived,
    };

    // add the pre-submit check
    const isMisconfigured = expertIds.length === 0 || managerIds.length === 0; // changed to OR

    if (isMisconfigured) {
      pendingSubmitData.current = {
        formData: formDataObject,
        editingCategoryId: initialData?._id || null,
      };
      setIsConfirmOpen(true);
      return; // stop submission until user confirms
    }

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
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 col-span-2">
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
              color={color}
              setColor={setColor}
              usedColors={usedColors}
              errorPlaceholderClass={errorPlaceholderClass}
              initialExperts={initialExpertObjects as ILeanUserForForm[]}
              initialManagers={initialManagerObjects as ILeanUserForForm[]}
              allUsersForAssigning={allUsersForForm}
              usersLoading={allUsersForFormLoading}
              paletteColors={paletteColors}
              paletteColorsLoading={paletteColorsLoading}
              canManageColors={canManageColors}
              onOpenColorManager={() => setIsColorManagerOpen(true)}
            />
          </div>
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
      {canManageColors && (
        <ColorManagementDialog
          isOpen={isColorManagerOpen}
          onClose={() => setIsColorManagerOpen(false)}
          paletteColors={paletteColors}
          isLoading={paletteColorsLoading}
        />
      )}

      {/* add the dialog to the component's render output */}
      <ConfirmActionDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Потвърждение за категория"
        description={
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              Към тази категория няма назначени експерти или мениджъри.
              Сигналите може да останат без надзор.
              <br />
              <br />
              Сигурни ли сте, че искате да продължите?
            </div>
          </div>
        }
        confirmButtonText="Да, запази"
        isDestructiveAction={false}
      />
    </>
  );
};
// Export name updated
export default CategoryForm;
