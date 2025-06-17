// src/components/modals/CaseDialog.tsx
import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { ICategory, IMe } from "../../db/interfaces";
import { CASE_TYPE } from "../../utils/GLOBAL_PARAMETERS";
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
import SuccessConfirmationModal from "./SuccessConfirmationModal";

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
  onSuccess?: () => void;
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

// --- Style definitions remain the same ---
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
  const [initialFormState, setInitialFormState] = useState<CaseFormData>(
    getInitialFormData()
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [initialAttachments, setInitialAttachments] = useState<File[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const isMouseDownOnBackdrop = useRef(false);

  const { updateCase, loading: isUpdating } = useUpdateCase(
    props.mode === "edit" ? props.caseNumber : 0
  );
  const { createCase, loading: isCreating } = useCreateCase();

  const hasUnsavedChanges =
    JSON.stringify(formData) !== JSON.stringify(initialFormState) ||
    attachments.length !== initialAttachments.length ||
    attachments.some((file, index) => file !== initialAttachments[index]);

  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setInitialFormState(initialData);
      setError(null);
      setShowConfirmDialog(false);

      if (props.mode === "edit" && props.initialData.attachments?.length > 0) {
        Promise.all(
          props.initialData.attachments.map(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            const filename = url.split("/").pop() || "attachment";
            return new File([blob], filename, { type: blob.type });
          })
        ).then((files) => {
          setAttachments(files);
          setInitialAttachments(files);
        });
      } else {
        setAttachments([]);
        setInitialAttachments([]);
      }
    }
  }, [isOpen, props]);

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData, attachments]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      attemptClose();
    } else {
      setIsOpen(true);
    }
  };

  const attemptClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setIsOpen(false);
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      isMouseDownOnBackdrop.current = true;
    }
  };

  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDownOnBackdrop.current && e.target === e.currentTarget) {
      attemptClose();
    }
    isMouseDownOnBackdrop.current = false;
  };

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
    setError(null);

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
        setSuccessMessage(
          `Сигнал #${props.caseNumber} беше успешно редактиран.`
        );
        setShowSuccessModal(true);
        setIsOpen(false);
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
        const typeText =
          formData.type === "SUGGESTION"
            ? "Предложението беше успешно създадено."
            : "Проблемът беше успешно създаден.";
        setSuccessMessage(typeText);
        setShowSuccessModal(true);
        setIsOpen(false);
      }
      if (props.onSuccess) {
        props.onSuccess();
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
      setError(
        `Грешка при ${
          props.mode === "edit" ? "редактиране" : "създаване"
        } на сигнала: ${errorMessage}`
      );
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (props.mode === "create") {
      window.location.reload();
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
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>{props.children}</Dialog.Trigger>
        <Dialog.Portal>
          <AlertDialog.Root
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
            <Dialog.Overlay
              className="fixed inset-0 bg-black/40 z-40"
              onMouseDown={handleBackdropMouseDown}
              onMouseUp={handleBackdropMouseUp}
            />
            <Dialog.Content
              onMouseDown={(e) => e.stopPropagation()}
              className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-stone-100 shadow-lg focus:outline-none max-h-[90vh] flex flex-col"
            >
              <div className="sticky top-0 bg-stone-100 z-10 border-b border-gray-300">
                <div className="p-6">
                  <Dialog.Title className="text-2xl font-bold text-gray-800">
                    {renderTitle()}
                  </Dialog.Title>
                  <button
                    onClick={attemptClose}
                    className="absolute hover:cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-full p-1 transition-colors"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
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
                    {/* ... form fields remain the same */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                      {props.mode === "edit" && (
                        <div>
                          <p className="text-sm font-medium mb-3 text-gray-700">
                            {getBulgarianText("type", t, "Тип на сигнала")}
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
                              formData.categoryIds.length >=
                                MAX_SELECTED_CATEGORIES
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
                      <button
                        type="button"
                        onClick={attemptClose}
                        className="px-6 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {getBulgarianText("cancel", t, "Отказ")}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={getSubmitButtonClass(formData.type)}
                      >
                        {isLoading
                          ? getBulgarianText("saving", t, "Записване...")
                          : props.mode === "edit"
                          ? getBulgarianText(
                              "saveChanges",
                              t,
                              "Запази промените"
                            )
                          : getBulgarianText("submit", t, "Изпрати")}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </Dialog.Content>

            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
              <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
                <AlertDialog.Title className="mb-2 text-lg font-semibold text-gray-900">
                  Потвърждение
                </AlertDialog.Title>
                <AlertDialog.Description className="mb-5 text-sm text-gray-600">
                  Сигурни ли сте, че искате да излезете? Всички незапазени
                  промени ще бъдат загубени.
                </AlertDialog.Description>
                <div className="flex justify-end gap-4">
                  <AlertDialog.Cancel asChild>
                    <button
                      onClick={handleCancelClose}
                      className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                    >
                      Отказ
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      onClick={handleConfirmClose}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      Излез
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </Dialog.Portal>
      </Dialog.Root>

      <SuccessConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Успех!"
        message={successMessage}
        autoCloseDuration={2000}
      />
    </>
  );
};

export default CaseDialog;
