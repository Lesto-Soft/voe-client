import { ChangeEvent, Dispatch } from "react";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../db/config";

export const handleFileChange = (
  t: (key: string, options?: Record<string, any>) => string, // Updated type for t
  event: ChangeEvent<HTMLInputElement>,
  setAttachments: Dispatch<React.SetStateAction<File[]>>,
  setFileError: Dispatch<React.SetStateAction<string | null>>,
  existingAttachments: string[] = [] // Optional prop for existing attachments
) => {
  setFileError(null); // Clear previous errors (includes setFileError(null))
  const selectedFiles = event.target.files
    ? Array.from(event.target.files)
    : [];

  if (selectedFiles.length === 0) {
    if (event.target) event.target.value = ""; // Clear input value on cancel/empty select
    return; // No files selected, nothing to do
  }

  let processingError: string | null = null; // Store the first critical error encountered

  // Use setAttachments callback form to reliably access previous state
  setAttachments((prevAttachments: any) => {
    const currentCount = prevAttachments.length + existingAttachments.length;
    const availableSlots = MAX_UPLOAD_FILES - currentCount;

    // --- Check 1: Max file count ---
    if (availableSlots <= 0) {
      processingError = t("caseSubmission.errors.file.maxCountExceeded", {
        max: MAX_UPLOAD_FILES,
      });
      // Return previous state immediately, no need to process files
      return prevAttachments;
    }

    let validFilesToAdd: File[] = [];
    const oversizedFiles: string[] = [];
    const duplicateFiles: string[] = [];
    const countLimitedFiles: string[] = [];

    // Create signatures of existing files for duplicate check
    const existingFileNames = new Set([
      ...prevAttachments.map((f: File) => f.name),
      ...existingAttachments.map((url: string) => url.split("/").pop() || url),
    ]);

    // Process only as many selected files as there are available slots
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // --- Check 2: Individual file size ---
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        oversizedFiles.push(file.name);
        continue; // Skip this file
      }

      // --- Check 3: Is count limit reached during processing? ---
      if (validFilesToAdd.length >= availableSlots) {
        countLimitedFiles.push(file.name);
        continue; // Skip remaining files once slots are full
      }

      // --- Check 4: Duplicates ---
      if (existingFileNames.has(file.name)) {
        duplicateFiles.push(file.name);
        continue; // Skip this file
      }

      // If all checks pass, add to the list for this batch
      validFilesToAdd.push(file);
    }

    // --- Set Feedback Messages (Prioritized) ---
    if (oversizedFiles.length > 0) {
      processingError = t("caseSubmission.errors.file.oversized", {
        maxSize: MAX_UPLOAD_MB,
        fileList: oversizedFiles.join(", "),
      });
      // Optionally append count limit message if applicable
      if (countLimitedFiles.length > 0) {
        processingError += ` ${t(
          "caseSubmission.errors.file.oversizedAndMaxCount",
          { max: MAX_UPLOAD_FILES }
        )}`;
      }
    } else if (countLimitedFiles.length > 0) {
      // This message now implies files were skipped *only* due to the count limit
      processingError = t("caseSubmission.errors.file.maxCountReached", {
        max: MAX_UPLOAD_FILES,
        count: countLimitedFiles.length,
      });
    } else if (duplicateFiles.length > 0 && validFilesToAdd.length === 0) {
      // Only duplicates were selected (and no size/count errors)
      processingError = t("caseSubmission.errors.file.duplicatesSkipped", {
        fileList: duplicateFiles.join(", "),
      });
    } else if (duplicateFiles.length > 0) {
      // Some files were added, but some were duplicates (show as warning, not error)
      console.warn(
        t("caseSubmission.errors.file.duplicatesSomeSkipped", {
          fileList: duplicateFiles.join(", "),
        })
      );
    }

    // Set the primary file error state if any error occurred
    if (processingError) {
      setFileError(processingError);
    }
    // Return the new state array
    return [...prevAttachments, ...validFilesToAdd]; // Append valid files
  });

  // Clear the native file input value after processing in React state
  // This allows selecting the same file again if it was removed/rejected
  if (event.target) event.target.value = "";
};

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result?.indexOf(",");
      if (typeof result === "string" && commaIndex !== -1) {
        const base64String = result.substring(commaIndex + 1);
        resolve(base64String);
      } else {
        reject(new Error("Could not read file or extract base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
