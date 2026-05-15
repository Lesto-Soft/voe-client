import React, { useState, useEffect } from "react";
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { ICategory, IMe } from "../../db/interfaces";
import { TFunction } from "i18next";
import { useUpdateCase, useCreateCase } from "../../graphql/hooks/case";
import { getTextLength } from "../../utils/contentRenderer";
import UnifiedEditor from "./partials/UnifiedRichTextEditor"; // Новият компонент
import { CASE_CONTENT } from "../../utils/GLOBAL_PARAMETERS";

const MAX_SELECTED_CATEGORIES = 3;

const getCategoryClass = (
  categoryId: string,
  selectedCategoryIds: string[],
  caseType: "PROBLEM" | "SUGGESTION",
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
    baseClass += " cursor-not-allowed opacity-50";
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

interface CaseFormData {
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "PROBLEM" | "SUGGESTION";
  categoryIds: string[];
}

type CaseFormProps = {
  me: IMe;
  availableCategories: ICategory[];
  onCancel: () => void;
  onSubmitSuccess: (message: string) => void;
  onFormError: (message: string | null) => void;
  onSubmissionError: (message: string) => void;
  onUnsavedChangesChange: (hasChanges: boolean) => void;
  t: TFunction<("dashboard" | "caseSubmission")[], undefined>;
  mentions?: any[];
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
    mentions = [],
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

  const [formData, setFormData] = useState<CaseFormData>(getInitialFormData());
  const [initialFormState] = useState<CaseFormData>(getInitialFormData());
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    props.mode === "edit" ? props.initialData.attachments || [] : [],
  );

  const [isCompressing, setIsProcessing] = useState(false);

  const { updateCase, loading: isUpdating } = useUpdateCase(
    props.mode === "edit" ? props.caseNumber : 0,
  );
  const { createCase, loading: isCreating } = useCreateCase();
  const isLoading = isUpdating || isCreating;
  const textLength = getTextLength(formData.content);

  useEffect(() => {
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormState);
    let attachmentsChanged = false;

    if (props.mode === "edit") {
      const initialCount = props.initialData.attachments?.length || 0;
      attachmentsChanged =
        newAttachments.length > 0 ||
        existingAttachments.length !== initialCount;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onFormError(null);

    if (isCompressing) return;

    const textLength = getTextLength(formData.content);
    if (textLength < CASE_CONTENT.MIN) {
      onFormError(`Съдържанието трябва да е поне ${CASE_CONTENT.MIN} символа.`);
      return;
    }
    if (formData.categoryIds.length === 0) {
      onFormError("Моля изберете поне една категория.");
      return;
    }

    try {
      if (props.mode === "edit") {
        const deleted = (props.initialData.attachments || []).filter(
          (url) => !existingAttachments.includes(url),
        );
        await updateCase(props.caseId, me._id, {
          content: formData.content,
          type: formData.type,
          priority: formData.priority,
          categories: formData.categoryIds,
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
          deletedAttachments: deleted.length > 0 ? deleted : undefined,
        });
        onSubmitSuccess(
          t("caseSubmission:caseSubmission.submissionSuccess.edit", {
            caseNumber: props.caseNumber,
          }),
        );
      } else {
        await createCase({
          creator: me._id,
          content: formData.content,
          type: formData.type,
          priority: formData.priority,
          categories: formData.categoryIds,
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
        });
        onSubmitSuccess(
          formData.type === "SUGGESTION"
            ? t(
                "caseSubmission:caseSubmission.submissionSuccess.createSuggestion",
              )
            : t(
                "caseSubmission:caseSubmission.submissionSuccess.createProblem",
              ),
        );
      }
    } catch (err: any) {
      onSubmissionError(err.message || "Грешка при запис.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-grow flex flex-col overflow-hidden"
    >
      <div className="overflow-y-auto flex-grow">
        <div className="space-y-6 p-6 bg-white shadow">
          <div>
            <p className="text-sm font-medium mb-2 text-gray-700">
              {t("content")} <span className="text-red-500">*</span>
            </p>
            <UnifiedEditor
              content={formData.content}
              onContentChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html }));
                onFormError(null);
              }}
              attachments={newAttachments}
              setAttachments={setNewAttachments}
              existingAttachments={existingAttachments}
              setExistingAttachments={setExistingAttachments}
              mentions={mentions}
              placeholder={
                t("caseSubmission:caseSubmission.placeholder") ||
                "Напишете съдържание..."
              }
              minLength={CASE_CONTENT.MIN}
              maxLength={CASE_CONTENT.MAX}
              hideSideButtons={true}
              onProcessingChange={setIsProcessing}
              caseId={props.mode === "edit" ? props.caseId : undefined}
              type="case"
              editorClassName="h-[180px] min-h-[180px] max-h-[180px]"
            />
          </div>

          {/* ОРИГИНАЛЕН ДИЗАЙН ЗА ТИП И ПРИОРИТЕТ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {props.mode === "edit" && (
              <div>
                <p className="text-sm font-medium mb-3 text-gray-700">
                  {t("type", "Тип на сигнала")}{" "}
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
                          setFormData((prev) => ({
                            ...prev,
                            type: value as any,
                          }))
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
                {t("caseSubmission:caseSubmission.priorityLabel", "Приоритет")}{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg items-center">
                {[
                  {
                    value: "LOW",
                    color: "#009b00",
                    bgText: "Нисък",
                    key: "low",
                  },
                  {
                    value: "MEDIUM",
                    color: "#ad8600",
                    bgText: "Среден",
                    key: "medium",
                  },
                  {
                    value: "HIGH",
                    color: "#c30505",
                    bgText: "Висок",
                    key: "high",
                  },
                ].map(({ value, color, bgText, key }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  >
                    <input
                      type="radio"
                      value={value}
                      checked={formData.priority === value}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: value as any,
                        }))
                      }
                      style={{ accentColor: color }}
                      className="w-5 h-5 cursor-pointer"
                      name="priority"
                      disabled={isCompressing}
                    />
                    <span className="text-sm text-gray-700">
                      {t(`caseSubmission:caseSubmission.priority.${key}`) ||
                        bgText}{" "}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ОРИГИНАЛНИ КАТЕГОРИИ */}
          <div>
            <p className="text-sm font-medium mb-3 text-gray-700">
              {`Категории`} <span className="text-red-500">*</span>{" "}
              {`(максимум ${MAX_SELECTED_CATEGORIES})`}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => {
                      const isSelected = prev.categoryIds.includes(cat._id);
                      if (isSelected)
                        return {
                          ...prev,
                          categoryIds: prev.categoryIds.filter(
                            (id) => id !== cat._id,
                          ),
                        };
                      if (prev.categoryIds.length < MAX_SELECTED_CATEGORIES)
                        return {
                          ...prev,
                          categoryIds: [...prev.categoryIds, cat._id],
                        };
                      return prev;
                    });
                    onFormError(null);
                  }}
                  className={getCategoryClass(
                    cat._id,
                    formData.categoryIds,
                    formData.type,
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

      {/* ОРИГИНАЛЕН ФУТЪР */}
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
            disabled={
              isLoading || isCompressing || textLength < CASE_CONTENT.MIN
            }
            className={`${getSubmitButtonClass(
              formData.type,
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
