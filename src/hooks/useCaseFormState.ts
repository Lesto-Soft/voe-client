import { useState, useCallback, ChangeEvent } from "react";
import { CasePriority, AttachmentInput } from "../types/CaseSubmittionTypes"; // Adjust path
import {
  MAX_FILES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  MAX_SELECTED_CATEGORIES,
} from "../constants/caseSubmittionConstants"; // Adjust path

export const useCaseFormState = () => {
  // Input States
  const [content, setContent] = useState<string>("");
  const [priority, setPriority] = useState<CasePriority>("LOW");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [usernameInput, setUsernameInput] = useState<string>(""); // Username for lookup

  // Field-specific error states
  const [contentError, setContentError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null); // For submit validation

  // Function to clear field-specific errors (not general submission error)
  const clearFieldErrors = useCallback(() => {
    setContentError(null);
    setFileError(null);
    setUsernameError(null);
    // Note: notFoundUsername is managed by useUserLookupDebounced
  }, []);

  // Handlers - Using useCallback for potential memoization benefits if components get memoized
  const handleContentChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      clearFieldErrors(); // Example: clear errors when content changes
      // Or maybe only clear contentError: setContentError(null)
      setContent(event.target.value);
    },
    [clearFieldErrors]
  ); // Dependency on clearFieldErrors

  const handlePriorityChange = useCallback(
    (newPriority: CasePriority) => {
      clearFieldErrors(); // Example: clear errors when priority changes
      setPriority(newPriority);
    },
    [clearFieldErrors]
  );

  const handleUsernameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      clearFieldErrors(); // Example: clear errors when username changes
      setUsernameInput(event.target.value);
    },
    [clearFieldErrors]
  );

  const toggleCategory = useCallback(
    (categoryName: string) => {
      clearFieldErrors(); // Example: clear errors when category changes
      setSelectedCategories((prev) => {
        if (prev.includes(categoryName)) {
          return prev.filter((c) => c !== categoryName);
        } else if (prev.length < MAX_SELECTED_CATEGORIES) {
          return [...prev, categoryName];
        }
        return prev;
      });
    },
    [clearFieldErrors]
  ); // Dependency on clearFieldErrors

  const handleRemoveAttachment = useCallback(
    (fileNameToRemove: string) => {
      clearFieldErrors(); // Example: clear errors when attachment removed
      setAttachments((prev) =>
        prev.filter((file) => file.name !== fileNameToRemove)
      );
    },
    [clearFieldErrors]
  ); // Dependency on clearFieldErrors

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      clearFieldErrors(); // Clear errors on new file interaction
      const selectedFiles = event.target.files
        ? Array.from(event.target.files)
        : [];
      if (selectedFiles.length === 0) {
        if (event.target) event.target.value = "";
        return;
      }

      let processingError: string | null = null;

      setAttachments((prevAttachments) => {
        const currentCount = prevAttachments.length;
        const availableSlots = MAX_FILES - currentCount;

        if (availableSlots <= 0) {
          processingError = `Максималният брой файлове е ${MAX_FILES}.`;
          return prevAttachments;
        }

        let validFilesToAdd: File[] = [];
        const oversizedFiles: string[] = [];
        const duplicateFiles: string[] = [];
        const countLimitedFiles: string[] = [];
        const existingFileSignatures = new Set(
          prevAttachments.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
        );

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          if (file.size > MAX_FILE_SIZE_BYTES) {
            oversizedFiles.push(file.name);
            continue;
          }
          if (validFilesToAdd.length >= availableSlots) {
            countLimitedFiles.push(file.name);
            continue;
          }
          const signature = `${file.name}-${file.size}-${file.lastModified}`;
          if (existingFileSignatures.has(signature)) {
            duplicateFiles.push(file.name);
            continue;
          }
          validFilesToAdd.push(file);
        }

        // --- Set Feedback Messages ---
        if (oversizedFiles.length > 0) {
          processingError = `Файлове над ${MAX_FILE_SIZE_MB}MB бяха пропуснати: ${oversizedFiles.join(
            ", "
          )}`;
          if (countLimitedFiles.length > 0) {
            processingError += ` (достигнат лимит от ${MAX_FILES} файла).`;
          }
        } else if (countLimitedFiles.length > 0) {
          processingError = `Само първите ${availableSlots} файла бяха добавени (лимит от ${MAX_FILES}). Пропуснати: ${countLimitedFiles.join(
            ", "
          )}`;
        } else if (duplicateFiles.length > 0 && validFilesToAdd.length === 0) {
          processingError = `Избраните файлове вече са добавени: ${duplicateFiles.join(
            ", "
          )}`;
        } else if (duplicateFiles.length > 0) {
          console.warn(
            "Пропуснати дублирани файлове:",
            duplicateFiles.join(", ")
          );
        }

        if (validFilesToAdd.length > 0)
          return [...prevAttachments, ...validFilesToAdd];
        else return prevAttachments;
      });

      // Set the error state *after* the attachment state update is queued
      setFileError(processingError);

      if (event.target) event.target.value = ""; // Clear native input
    },
    [clearFieldErrors]
  ); // Dependency on clearFieldErrors

  return {
    // State values
    content,
    priority,
    selectedCategories,
    attachments,
    usernameInput,
    // Field errors
    contentError,
    fileError,
    usernameError, // For submit validation
    // Setters/Handlers (provide consistent way to update state)
    setContent, // Expose raw setter if needed
    handleContentChange, // Or specific handler
    setPriority, // Expose raw setter
    handlePriorityChange, // Or specific handler
    setSelectedCategories, // Expose raw setter
    toggleCategory, // Specific handler
    setAttachments, // Expose raw setter for clearing etc.
    handleFileChange, // Specific handler
    handleRemoveAttachment, // Specific handler
    setUsernameInput, // Expose raw setter
    handleUsernameChange, // Or specific handler
    // Error management
    setContentError, // Expose error setters if needed outside hook (less ideal)
    setFileError,
    setUsernameError,
    clearFieldErrors, // Function to clear only field errors
  };
};
