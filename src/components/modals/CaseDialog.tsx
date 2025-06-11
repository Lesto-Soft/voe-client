// src/components/modals/CaseDialog.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
// ADDED: Icons for the new dynamic title
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
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

// CHANGED: getCategoryClass now accepts a `caseType` to apply conditional coloring.
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
    // Apply green for Suggestion, red for Problem
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

// Bulgarian text fallbacks
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
    }
  }, [isOpen, props]);

  const handlePriorityChange = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    setFormData((prev) => ({ ...prev, priority }));
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
      }
      setIsOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error(`Failed to ${props.mode} case:`, errorMessage);
    }
  };

  const isLoading = isUpdating || isCreating;

  // ADDED: Helper function to render the dynamic title with icon
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
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-stone-100 p-6 shadow-lg focus:outline-none max-h-[90vh] overflow-y-auto">
          {/* CHANGED: Title now uses the renderTitle helper */}
          <Dialog.Title className="text-2xl font-bold mb-4 border-b border-gray-300 pb-3 text-gray-800">
            {renderTitle()}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 p-6 bg-white rounded-lg shadow">
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {getBulgarianText("content", t, "Съдържание")}
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e.target.value }))
                  }
                  rows={8}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getBulgarianText(
                    "caseSubmission:caseSubmission.descriptionPlaceholder",
                    t,
                    "Опишете вашия проблем или предложение..."
                  )}
                />
              </div>

              {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {getBulgarianText("type", t, "Тип")}
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        type: e.target.value as "PROBLEM" | "SUGGESTION",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                    disabled
                  >
                    <option value={CASE_TYPE.PROBLEM}>
                      {getBulgarianText(CASE_TYPE.PROBLEM, t, "Проблем")}
                    </option>
                    <option value={CASE_TYPE.SUGGESTION}>
                      {getBulgarianText(CASE_TYPE.SUGGESTION, t, "Предложение")}
                    </option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3 text-gray-700">
                    {getBulgarianText(
                      "caseSubmission:caseSubmission.priorityLabel",
                      t,
                      "Приоритет"
                    )}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {priorityOptions.map(
                      ({ labelKey, value, color, bgText }) => (
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
                      )
                    )}
                  </div>
                </div>
              </div> */}

              <div>
                <p className="text-sm font-medium mb-3 text-gray-700">
                  {/* {getBulgarianText(
                    "caseSubmission:caseSubmission.categoriesLabel",
                    t,
                    `Категории (максимум ${MAX_SELECTED_CATEGORIES})`
                  )} */}
                  {`Категории (максимум ${MAX_SELECTED_CATEGORIES})`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat._id)}
                      // CHANGED: Pass formData.type to get the correct color
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
                  className="px-6 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CaseDialog;
