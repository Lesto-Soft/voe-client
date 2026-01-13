import React, { useState, useEffect } from "react";
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { ICategory, IMe } from "../../db/interfaces";
import { CASE_CONTENT } from "../../utils/GLOBAL_PARAMETERS";
import { TFunction } from "i18next";
import {
  UpdateCaseInput,
  useUpdateCase,
  useCreateCase,
  CreateCaseInput,
} from "../../graphql/hooks/case";
import { getTextLength } from "../../utils/contentRenderer";
import { usePastedAttachments } from "./hooks/usePastedAttachments";
import ContentWithAttachmentsField from "./partials/ContentWithAttachmentsField";

const MAX_SELECTED_CATEGORIES = 3;

const getCategoryClass = (
  categoryId: string,
  selectedCategoryIds: string[],
  caseType: "PROBLEM" | "SUGGESTION"
) => {
  const isSelected = selectedCategoryIds.includes(categoryId);
  const isMaxReached =
    selectedCategoryIds.length >= MAX_SELECTED_CATEGORIES && !isSelected;

  let baseClass =
    "px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none hover:cursor-pointer disabled:cursor-not-allowed";

  if (isSelected) {
    if (caseType === "SUGGESTION") {
      baseClass += " bg-green-600 text-white border-green-700";
    } else {
      baseClass += " bg-red-600 text-white border-red-700";
    }
  } else {
    baseClass += " bg-white text-gray-700 border-gray-300 hover:bg-gray-100";
  }

  if (isMaxReached) {
    baseClass += "cursor-not-allowed opacity-50";
  }
  return baseClass;
};

const getSubmitButtonClass = (caseType: "PROBLEM" | "SUGGESTION") => {
  const baseClasses =
    "px-6 py-2 hover:cursor-pointer rounded-md border border-transparent text-white font-semibold focus:outline-none disabled:cursor-not-allowed transition-colors duration-200";

  if (caseType === "SUGGESTION") {
    return `${baseClasses} bg-green-600 hover:bg-green-700 disabled:bg-green-400`;
  }
  return `${baseClasses} bg-red-600 hover:bg-red-700 disabled:bg-red-400`;
};

// --- Form State and Props ---

interface CaseFormData {
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "PROBLEM" | "SUGGESTION";
  categoryIds: string[];
}

// Props for the form component
type CaseFormProps = {
  me: IMe;
  availableCategories: ICategory[];
  onCancel: () => void;
  onSubmitSuccess: (message: string) => void;
  onFormError: (message: string | null) => void;
  onSubmissionError: (message: string) => void;
  onUnsavedChangesChange: (hasChanges: boolean) => void;
  t: TFunction<("dashboard" | "caseSubmission")[], undefined>;
  isOpen: boolean;
  processFiles: (files: File[]) => Promise<File[]>;
  isCompressing: boolean;
} & (
  | {
      mode: "edit";
      caseId: string;
      caseNumber: number;
      initialData: {
        content: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        type: "PROBLEM" | "SUGGESTION";
        categories: ICategory[];
        attachments: string[];
      };
    }
  | {
      mode: "create";
      caseType: "PROBLEM" | "SUGGESTION";
    }
);

// --- The Form Component ---

const CaseForm: React.FC<CaseFormProps> = (props) => {
  const {
    me,
    availableCategories,
    onCancel,
    onSubmitSuccess,
    onFormError,
    onSubmissionError,
    onUnsavedChangesChange,
    t,
    isOpen,
    processFiles, // Destructure new prop
    isCompressing, // Destructure new prop
  } = props;

  const getInitialFormData = (): CaseFormData => {
    if (props.mode === "edit") {
      return {
        content: props.initialData.content,
        type: props.initialData.type,
        priority: props.initialData.priority,
        categoryIds: props.initialData.categories.map((cat) => cat._id),
      };
    }
    return {
      content: "",
      priority: "MEDIUM",
      type: props.caseType,
      categoryIds: [],
    };
  };

  // All form-related state now lives here
  const [formData, setFormData] = useState<CaseFormData>(getInitialFormData());
  const [initialFormState] = useState<CaseFormData>(getInitialFormData());
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    props.mode === "edit" ? props.initialData.attachments || [] : []
  );

  // GraphQL hooks live here
  const { updateCase, loading: isUpdating } = useUpdateCase(
    props.mode === "edit" ? props.caseNumber : 0
  );
  const { createCase, loading: isCreating } = useCreateCase();
  const isLoading = isUpdating || isCreating;

  usePastedAttachments(
    isOpen,
    newAttachments,
    existingAttachments,
    setNewAttachments,
    t
  );

  useEffect(() => {
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormState);
    let attachmentsChanged = false;

    if (props.mode === "edit") {
      const initialAttachmentCount = props.initialData.attachments?.length || 0;
      attachmentsChanged =
        newAttachments.length > 0 ||
        existingAttachments.length !== initialAttachmentCount;
    } else {
      attachmentsChanged = newAttachments.length > 0;
    }

    onUnsavedChangesChange(formChanged || attachmentsChanged);
  }, [
    formData,
    newAttachments,
    existingAttachments,
    initialFormState,
    props,
    onUnsavedChangesChange,
  ]);

  // Form value change handlers
  const handlePriorityChange = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    setFormData((prev) => ({ ...prev, priority }));
    onFormError(null); // Clear error on change
  };

  const handleTypeChange = (type: "PROBLEM" | "SUGGESTION") => {
    setFormData((prev) => ({ ...prev, type }));
    onFormError(null); // Clear error on change
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => {
      const isSelected = prev.categoryIds.includes(categoryId);
      if (isSelected) {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter((id) => id !== categoryId),
        };
      }
      if (prev.categoryIds.length < MAX_SELECTED_CATEGORIES) {
        return { ...prev, categoryIds: [...prev.categoryIds, categoryId] };
      }
      return prev;
    });
    onFormError(null); // Clear error on change
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onFormError(null); // Clear previous errors

    // Prevent submission if compressing
    if (isCompressing) return;

    // --- Client-side validation ---
    const textLength = getTextLength(formData.content);
    if (textLength < CASE_CONTENT.MIN) {
      onFormError(`Съдържанието трябва да е поне ${CASE_CONTENT.MIN} символа.`);
      return;
    }
    if (textLength > CASE_CONTENT.MAX) {
      onFormError(
        `Съдържанието не може да надвишава ${CASE_CONTENT.MAX} символа.`
      );
      return;
    }
    if (formData.categoryIds.length === 0) {
      onFormError("Моля изберете поне една категория.");
      return;
    }

    // --- Submission logic ---
    try {
      if (props.mode === "edit") {
        const initialUrls = props.initialData.attachments || [];
        const deletedAttachments = initialUrls.filter(
          (url) => !existingAttachments.includes(url)
        );

        const input: UpdateCaseInput = {
          content: formData.content,
          type: formData.type,
          priority: formData.priority,
          categories: formData.categoryIds,
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
          deletedAttachments:
            deletedAttachments.length > 0 ? deletedAttachments : undefined,
        };
        await updateCase(props.caseId, me._id, input);
        // Call parent on success
        onSubmitSuccess(`Сигнал #${props.caseNumber} беше успешно редактиран.`);
      } else {
        // create mode
        const input: CreateCaseInput = {
          creator: me._id,
          content: formData.content,
          type: formData.type,
          priority: formData.priority,
          categories: formData.categoryIds,
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
        };
        await createCase(input);
        const typeText =
          formData.type === "SUGGESTION"
            ? "Предложението беше успешно създадено."
            : "Проблемът беше успешно създаден.";
        // Call parent on success
        onSubmitSuccess(typeText);
      }
    } catch (err) {
      let errorMessage = "Възникна неочаквана грешка.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        const graphQLError = (err as any).graphQLErrors?.[0]?.message;
        const networkError = (err as any).networkError?.message;
        errorMessage = graphQLError || networkError || errorMessage;
      }
      console.error(`Failed to ${props.mode} case:`, err);
      // Call parent on error
      onSubmissionError(
        `Грешка при ${
          props.mode === "edit" ? "редактиране" : "създаване"
        } на сигнала: ${errorMessage}`
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-grow flex flex-col overflow-hidden"
    >
      <div className="overflow-y-auto flex-grow">
        <div className="space-y-6 p-6 bg-white shadow">
          <ContentWithAttachmentsField
            label={t("content")}
            content={formData.content}
            onContentChange={(html) => {
              setFormData((prev) => ({ ...prev, content: html }));
              onFormError(null);
            }}
            newAttachments={newAttachments}
            setNewAttachments={setNewAttachments}
            existingAttachments={existingAttachments}
            setExistingAttachments={setExistingAttachments}
            isCompressing={isCompressing}
            processFiles={processFiles}
            t={t}
            isOpen={isOpen}
            caseId={props.mode === "edit" ? props.caseId : undefined}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {props.mode === "edit" && (
              <div>
                <p className="text-sm font-medium mb-3 text-gray-700">
                  {t("type", "Тип на сигнала")}
                  <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg items-center">
                  {[
                    {
                      value: "PROBLEM",
                      color: "#c30505",
                      bgText: "Проблем",
                      Icon: ExclamationTriangleIcon,
                    },
                    {
                      value: "SUGGESTION",
                      color: "#009b00",
                      bgText: "Предложение",
                      Icon: LightBulbIcon,
                    },
                  ].map(({ value, color, bgText, Icon }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={formData.type === value}
                        onChange={() =>
                          handleTypeChange(value as "PROBLEM" | "SUGGESTION")
                        }
                        style={{ accentColor: color }}
                        className="w-5 h-5 cursor-pointer"
                        name="type"
                        disabled={isCompressing}
                      />
                      <Icon className="h-5 w-5" style={{ color }} />
                      <span className="text-sm text-gray-700 font-semibold">
                        {bgText}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-3 text-gray-700">
                {t("caseSubmission:caseSubmission.priorityLabel", "Приоритет")}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg items-center">
                {[
                  {
                    labelKey: "priority.low",
                    value: "LOW",
                    color: "#009b00",
                    bgText: "Нисък",
                  },
                  {
                    labelKey: "priority.medium",
                    value: "MEDIUM",
                    color: "#ad8600",
                    bgText: "Среден",
                  },
                  {
                    labelKey: "priority.high",
                    value: "HIGH",
                    color: "#c30505",
                    bgText: "Висок",
                  },
                ].map(({ value, color, bgText }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  >
                    <input
                      type="radio"
                      value={value}
                      checked={formData.priority === value}
                      onChange={() =>
                        handlePriorityChange(value as "LOW" | "MEDIUM" | "HIGH")
                      }
                      style={{ accentColor: color }}
                      className="w-5 h-5 cursor-pointer"
                      name="priority"
                      disabled={isCompressing}
                    />
                    <span className="text-sm text-gray-700">{bgText}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-gray-700">
              {`Категории`}
              <span className="text-red-500">*</span>{" "}
              {`(максимум ${MAX_SELECTED_CATEGORIES})`}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat._id)}
                  className={getCategoryClass(
                    cat._id,
                    formData.categoryIds,
                    formData.type
                  )}
                  disabled={
                    (!formData.categoryIds.includes(cat._id) &&
                      formData.categoryIds.length >= MAX_SELECTED_CATEGORIES) ||
                    isCompressing
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-3 bg-stone-100 border-t border-gray-300 rounded-b-xl sticky bottom-0">
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCompressing}
            className="w-34 px-6 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none hover:cursor-pointer disabled:opacity-50"
          >
            {t("cancel", "Отказ")}
          </button>
          <button
            type="submit"
            disabled={isLoading || isCompressing}
            className={`${getSubmitButtonClass(
              formData.type
            )} hover:cursor-pointer w-34 text-center disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isCompressing
              ? t("processingFiles", "Обработка...")
              : isLoading
              ? t("saving", "Записване...")
              : props.mode === "edit"
              ? t("saveChanges", "Запази")
              : t("submit", "Изпрати")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CaseForm;
