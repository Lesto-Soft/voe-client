// src/components/modals/EditCaseDialog.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ICategory, IMe } from "../../db/interfaces"; // Assuming ICategory is here
import { CASE_PRIORITY, CASE_TYPE } from "../../utils/GLOBAL_PARAMETERS";
import { useTranslation } from "react-i18next";
import FileAttachmentBtn from "../global/FileAttachmentBtn";
import CategoryMultiSelect from "../global/CategoryMultiSelect";
import {
  AttachmentInput,
  UpdateCaseInput,
  useUpdateCase,
} from "../../graphql/hooks/case";
import { readFileAsBase64 } from "../../utils/attachment-handling";

// Define an interface for the data you want to edit
interface CaseEditFormData {
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "PROBLEM" | "SUGGESTION";
  // For categories, we'll manage an array of their IDs for simplicity in the form
  categoryIds: string[];
  // Attachments are more complex to "edit" directly in a simple form,
  // so we'll just log the existing ones for now.
  // True attachment editing would require upload/delete functionality.
}

interface EditCaseDialogProps {
  caseId: string;
  caseNumber: number;
  initialData: {
    content: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    type: "PROBLEM" | "SUGGESTION";
    categories: ICategory[];
    attachments: string[];
  };
  me: IMe;
}

const EditCaseDialog: React.FC<EditCaseDialogProps> = ({
  caseId,
  caseNumber,
  initialData,
  me,
}) => {
  const { t } = useTranslation("dashboard");
  const [formData, setFormData] = useState<CaseEditFormData>({
    content: initialData.content,
    type: initialData.type,
    priority: initialData.priority,
    categoryIds: initialData.categories.map((cat) => cat._id),
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const { updateCase, loading: isUpdating } = useUpdateCase(caseNumber);

  useEffect(() => {
    if (initialData.attachments && initialData.attachments.length > 0) {
      Promise.all(
        initialData.attachments.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          // Extract filename from URL or use a fallback
          const filename = url.split("/").pop() || "attachment";
          return new File([blob], filename, { type: blob.type });
        })
      ).then(setAttachments);
    } else {
      setAttachments([]);
    }
  }, [initialData.attachments]);

  // If initialData can change while the dialog is already mounted (e.g. due to refetch in parent),
  // you might need a useEffect to update formData, but typically a dialog remounts or takes stable initial props.
  useEffect(() => {
    setFormData({
      content: initialData.content,
      type: initialData.type,
      priority: initialData.priority,
      categoryIds: initialData.categories.map((cat) => cat._id),
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelectionChange = (newCategoryIds: string[]) => {
    setFormData((prev) => ({ ...prev, categoryIds: newCategoryIds }));
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
    const input: UpdateCaseInput = {
      content: formData.content,
      type: formData.type,
      priority: formData.priority,
      categories: formData.categoryIds,
      attachments: attachmentInputs,
    };

    try {
      await updateCase(caseId, me._id, input);
    } catch (err) {
      console.log(err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Failed to update case:", errorMessage);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          title="Edit case"
          className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <PencilSquareIcon className="h-5 w-5 text-gray-500" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg focus:outline-none max-h-[85vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold mb-4 border-b pb-2">
            Edit Case: <span className="font-mono text-2xl">{caseNumber}</span>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("content")}
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("type")}
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option key={CASE_TYPE.PROBLEM} value={CASE_TYPE.PROBLEM}>
                  {t(CASE_TYPE.PROBLEM)}
                </option>
                <option key={CASE_TYPE.SUGGESTION} value={CASE_TYPE.SUGGESTION}>
                  {t(CASE_TYPE.SUGGESTION)}
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("priority")}
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(CASE_PRIORITY).map((opt) => (
                  <option key={opt} value={opt}>
                    {t(opt)}
                  </option>
                ))}
              </select>
            </div>

            <CategoryMultiSelect
              label={t("categories", "Categories")}
              selectedCategoryIds={formData.categoryIds}
              onChange={handleCategorySelectionChange}
              t={t}
              placeholder={t("choose_categories", "Choose categories...")}
              dropdownZIndex="z-[51]" // Ensure it's above dialog content (z-50)
              initialCategoryObjects={initialData.categories} // Pass full category objects for initial display
            />

            <div>
              <FileAttachmentBtn
                attachments={attachments}
                setAttachments={setAttachments}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes (Log to Console)
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditCaseDialog;
