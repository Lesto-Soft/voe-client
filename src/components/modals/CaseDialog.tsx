// src/components/modals/CaseDialog.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
// ADDED: Icons for the new dynamic title and close button
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ExclamationCircleIcon, // ADDED: Icon for error display
} from "@heroicons/react/24/solid";
import { ICategory, IMe } from "../../db/interfaces";
import { CASE_PRIORITY, CASE_TYPE } from "../../utils/GLOBAL_PARAMETERS";
import { useTranslation } from "react-i18next";
import FileAttachmentBtn from "../global/FileAttachmentBtn";
import {
  AttachmentInput,
  UpdateCaseInput,
  useUpdateCase,
  useCreateCase,
  CreateCaseInput,
} from "../../graphql/hooks/case";
import { readFileAsBase64 } from "../../utils/attachment-handling";
import TextEditor from "../forms/partials/TextEditor";

// Define an interface for the form data
interface CaseFormData {
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "PROBLEM" | "SUGGESTION";
  categoryIds: string[];
}

// Define props for both Create and Edit scenarios
type CaseDialogProps = {
  me: IMe;
  availableCategories: ICategory[];
  children: React.ReactNode;
  onSuccess?: () => void; // Add callback for successful operations
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

// --- START: Style definitions ---
const MAX_SELECTED_CATEGORIES = 3;

const typeOptions = [
  {
    value: "PROBLEM",
    color: "#c30505", // Red
    bgText: "Проблем",
    Icon: ExclamationTriangleIcon,
  },
  {
    value: "SUGGESTION",
    color: "#009b00", // Green
    bgText: "Предложение",
    Icon: LightBulbIcon,
  },
];

const priorityOptions = [
  { labelKey: "priority.low", value: "LOW", color: "#009b00", bgText: "Нисък" },
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
];

const getCategoryClass = (
  categoryId: string,
  selectedCategoryIds: string[],
  caseType: "PROBLEM" | "SUGGESTION"
) => {
  const isSelected = selectedCategoryIds.includes(categoryId);
  const isMaxReached =
    selectedCategoryIds.length >= MAX_SELECTED_CATEGORIES && !isSelected;

  let baseClass =
    "px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (isSelected) {
    if (caseType === "SUGGESTION") {
      baseClass +=
        " bg-green-600 text-white border-green-700 focus:ring-green-500";
    } else {
      baseClass += " bg-red-600 text-white border-red-700 focus:ring-red-500";
    }
  } else {
    baseClass +=
      " bg-white text-gray-700 border-gray-300 hover:bg-gray-100 focus:ring-blue-500";
  }

  if (isMaxReached) {
    baseClass += " cursor-not-allowed opacity-50";
  }
  return baseClass;
};

const getSubmitButtonClass = (caseType: "PROBLEM" | "SUGGESTION") => {
  const baseClasses =
    "px-6 py-2 rounded-md border border-transparent text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors duration-200";

  if (caseType === "SUGGESTION") {
    return `${baseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400`;
  }
  return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400`;
};

const getBulgarianText = (key: string, t: any, fallback: string) => {
  const translated = t(key);
  return translated === key ? fallback : translated;
};

// --- END: Style definitions ---

const CaseDialog: React.FC<CaseDialogProps> = (props) => {
  const { me, availableCategories } = props;
  const { t } = useTranslation(["dashboard", "caseSubmission"]);

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // ADDED: Error state
  const [error, setError] = useState<string | null>(null);

  const { updateCase, loading: isUpdating } = useUpdateCase(
    props.mode === "edit" ? props.caseNumber : 0
  );
  const { createCase, loading: isCreating } = useCreateCase();

  useEffect(() => {
    if (props.mode === "edit" && props.initialData.attachments?.length > 0) {
      Promise.all(
        props.initialData.attachments.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          const filename = url.split("/").pop() || "attachment";
          return new File([blob], filename, { type: blob.type });
        })
      ).then(setAttachments);
    } else {
      setAttachments([]);
    }
  }, [isOpen, props]);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setError(null); // Clear error when opening modal
    }
  }, [isOpen, props]);

  // ADDED: Clear error when form data changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData, attachments]);

  const handlePriorityChange = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleTypeChange = (type: "PROBLEM" | "SUGGESTION") => {
    setFormData((prev) => ({ ...prev, type }));
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any existing errors

    // Basic validation
    if (!formData.content.trim()) {
      setError("Моля въведете съдържание на сигнала.");
      return;
    }

    if (formData.categoryIds.length === 0) {
      setError("Моля изберете поне една категория.");
      return;
    }

    let attachmentInputs: AttachmentInput[] = [];
    try {
      attachmentInputs = await Promise.all(
        attachments.map(async (file): Promise<AttachmentInput> => {
          const base64Data = await readFileAsBase64(file);
          return { filename: file.name, file: base64Data };
        })
      );
    } catch (fileReadError) {
      console.error("Client: Error reading files to base64:", fileReadError);
      setError(
        "Грешка при четене на прикачените файлове. Моля опитайте отново."
      );
      return;
    }

    try {
      if (props.mode === "edit") {
        const input: UpdateCaseInput = {
          content: formData.content,
          type: formData.type,
          priority: formData.priority,
          categories: formData.categoryIds,
          attachments: attachmentInputs,
        };
        await updateCase(props.caseId, me._id, input);
      } else {
        const input: CreateCaseInput = {
          creator: me._id,
          content: formData.content,
          type: formData.type,
          priority: formData.priority,
          categories: formData.categoryIds,
          attachments: attachmentInputs,
        };
        await createCase(input);

        // For case creation, reload the page to ensure all data is fresh
        window.location.reload();
        return; // Exit early since page will reload
      }

      // Call onSuccess callback after successful edit operation
      if (props.onSuccess) {
        props.onSuccess();
      }

      setIsOpen(false);
    } catch (err) {
      let errorMessage = "Възникна неочаквана грешка.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        // Handle GraphQL errors
        const graphQLError = (err as any).graphQLErrors?.[0]?.message;
        const networkError = (err as any).networkError?.message;
        errorMessage = graphQLError || networkError || errorMessage;
      }

      console.error(`Failed to ${props.mode} case:`, err);
      setError(
        `Грешка при ${
          props.mode === "edit" ? "редактиране" : "създаване"
        } на сигнала: ${errorMessage}`
      );
    }
  };

  const isLoading = isUpdating || isCreating;

  const renderTitle = () => {
    const isSuggestion = formData.type === "SUGGESTION";

    const icon = isSuggestion ? (
      <LightBulbIcon className="h-7 w-7 mr-3 text-green-500 inline-block" />
    ) : (
      <ExclamationTriangleIcon className="h-7 w-7 mr-3 text-red-500 inline-block" />
    );

    const modeText =
      props.mode === "edit"
        ? getBulgarianText("editCase", t, "Редактиране на сигнал")
        : getBulgarianText("createCase", t, "Създаване на сигнал");

    const typeText = isSuggestion
      ? getBulgarianText(CASE_TYPE.SUGGESTION, t, "Предложение")
      : getBulgarianText(CASE_TYPE.PROBLEM, t, "Проблем");

    return (
      <div className="flex items-center">
        {icon}
        <span className="flex-1">
          {modeText}: <span className="font-normal">{typeText}</span>
          {props.mode === "edit" && (
            <span className="font-mono text-gray-500 ml-2">
              #{props.caseNumber}
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{props.children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-stone-100 shadow-lg focus:outline-none max-h-[90vh] flex flex-col">
          {/* --- START: Sticky Header --- */}
          <div className="sticky top-0 bg-stone-100 z-10 border-b border-gray-300">
            <div className="p-6">
              <Dialog.Title className="text-2xl font-bold text-gray-800">
                {renderTitle()}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="absolute hover:cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-full p-1 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* ADDED: Error Display Area */}
            {error && (
              <div className="px-6 pb-4">
                <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-3 text-red-400 hover:text-red-600 focus:outline-none"
                    aria-label="Dismiss error"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* --- END: Sticky Header --- */}

          {/* --- START: Scrollable Form Content --- */}
          <div className="overflow-y-auto flex-grow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6 p-6 bg-white rounded-lg shadow">
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("content")}
                  </label>
                  <TextEditor
                    content={formData.content}
                    onUpdate={(html) =>
                      setFormData((prev) => ({ ...prev, content: html }))
                    }
                    placeholder={getBulgarianText(
                      "caseSubmission.content.placeholder",
                      t,
                      "Опишете вашия случай..."
                    )}
                    editable={true}
                    minHeight="120px"
                    maxHeight="300px"
                    wrapperClassName="w-full border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                  {props.mode === "edit" && (
                    <div>
                      <p className="text-sm font-medium mb-3 text-gray-700">
                        {getBulgarianText("type", t, "Тип на сигнала")}
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg items-center">
                        {typeOptions.map(({ value, color, bgText, Icon }) => (
                          <label
                            key={value}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                          >
                            <input
                              type="radio"
                              value={value}
                              checked={formData.type === value}
                              onChange={() =>
                                handleTypeChange(
                                  value as "PROBLEM" | "SUGGESTION"
                                )
                              }
                              style={{ accentColor: color }}
                              className="w-5 h-5 cursor-pointer"
                              name="type"
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
                      {getBulgarianText(
                        "caseSubmission:caseSubmission.priorityLabel",
                        t,
                        "Приоритет"
                      )}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-lg items-center">
                      {priorityOptions.map(({ value, color, bgText }) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                        >
                          <input
                            type="radio"
                            value={value}
                            checked={formData.priority === value}
                            onChange={() =>
                              handlePriorityChange(
                                value as "LOW" | "MEDIUM" | "HIGH"
                              )
                            }
                            style={{ accentColor: color }}
                            className="w-5 h-5 cursor-pointer"
                            name="priority"
                          />
                          <span className="text-sm text-gray-700">
                            {bgText}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3 text-gray-700">
                    {`Категории (максимум ${MAX_SELECTED_CATEGORIES})`}
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
                          !formData.categoryIds.includes(cat._id) &&
                          formData.categoryIds.length >= MAX_SELECTED_CATEGORIES
                        }
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FileAttachmentBtn
                    attachments={attachments}
                    setAttachments={setAttachments}
                  />
                </div>

                <div className="flex justify-center gap-3 pt-4 border-t border-gray-300 mt-6">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="px-6 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {getBulgarianText("cancel", t, "Отказ")}
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={getSubmitButtonClass(formData.type)}
                  >
                    {isLoading
                      ? getBulgarianText("saving", t, "Записване...")
                      : props.mode === "edit"
                      ? getBulgarianText("saveChanges", t, "Запази промените")
                      : getBulgarianText("submit", t, "Изпрати")}
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* --- END: Scrollable Form Content --- */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CaseDialog;
