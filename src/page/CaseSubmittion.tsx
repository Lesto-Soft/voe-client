// src/page/CaseSubmittion.tsx
import React, {
  useState,
  useMemo,
  useEffect,
  FormEvent,
  ChangeEvent,
  useCallback,
} from "react"; // Added useCallback
import { Link, useLocation, useNavigate } from "react-router";
import { ApolloError } from "@apollo/client";

// Constants, Types, Helpers
import {
  MAX_FILES,
  MAX_FILE_SIZE_MB,
  MAX_SELECTED_CATEGORIES,
} from "../constants/caseSubmittionConstants"; // Adjust path
import {
  Category,
  CaseTypeParam,
  AttachmentInput,
  CasePriority,
} from "../types/CaseSubmittionTypes"; // Adjust path
import { readFileAsBase64, findCategoryIds } from "../utils/caseFormHelper"; // Adjust path

// GraphQL / Apollo Hooks
import { useGetActiveCategories } from "../graphql/hooks/category"; // Assuming correct return type
import { useCreateCase, CreateCaseInput } from "../graphql/hooks/case";
import { useUserLookupDebounced } from "../graphql/hooks/useUserLookupDebounced"; // Import the new hook

// Custom State Hook
import { useCaseFormState } from "../hooks/useCaseFormState"; // Import the new hook

// UI Components
import { CaseFormHeader } from "../components/case/CaseFormHeader"; // Adjust path
import { CaseFormLeftPanel } from "../components/case/CaseFormLeftPanel"; // Adjust path
import { CaseFormRightPanel } from "../components/case/CaseFormRightPanel"; // Adjust path
import HelpModal from "../components/modals/HelpModal"; // Existing

// --- Component ---

const CaseSubmittion: React.FC = () => {
  // ===========================================================
  // 1. HOOKS (Routing, Data Fetching, State Management)
  // ===========================================================
  const navigate = useNavigate();
  const { search } = useLocation();

  // Initial data fetching
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetActiveCategories();

  // Mutation hook
  const {
    createCase: executeCreateCase,
    loading: createCaseLoading,
    error: createCaseError,
  } = useCreateCase();

  // Custom hook for form state & field errors
  const {
    content,
    setContent,
    priority,
    setPriority,
    selectedCategories,
    setSelectedCategories,
    attachments,
    setAttachments,
    usernameInput,
    setUsernameInput,
    contentError,
    fileError,
    usernameError, // Field errors
    handleContentChange,
    handlePriorityChange, // Specific handlers if defined in hook
    toggleCategory,
    handleFileChange,
    handleRemoveAttachment,
    handleUsernameChange, // Handlers from hook
    clearFieldErrors,
    setUsernameError,
    setContentError, // Error setters/clearer from hook
  } = useCaseFormState();

  // Custom hook for user lookup logic
  const {
    userLoading,
    userError,
    notFoundUsername,
    fetchedName,
    fetchedCreatorId,
  } = useUserLookupDebounced(usernameInput);

  // Page-level state (submission, modal)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null); // For general/category errors
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // ===========================================================
  // 2. DERIVED STATE / MEMOIZED VALUES
  // ===========================================================
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const caseTypeParam: CaseTypeParam = useMemo(() => {
    const type = queryParams.get("type")?.toUpperCase();
    return type === "PROBLEM" || type === "SUGGESTION" ? type : null;
  }, [queryParams]);

  const categoryList: Category[] | undefined = useMemo(
    () => categoriesData?.getLeanActiveCategories,
    [categoriesData]
  );

  const helpModalContent = useMemo<React.ReactNode>(() => {
    // ... (Your complex modal logic using categoryList, selectedCategories, caseTypeParam) ...
    if (!categoryList) return <p>Зареждане на категории...</p>;
    if (selectedCategories.length === 0) {
      return <p>Моля, изберете категории...</p>;
    }
    // Placeholder:
    return <p>Help content based on selected categories and case type.</p>;
  }, [selectedCategories, categoryList, caseTypeParam]);

  // ===========================================================
  // 3. EFFECTS (Rarely needed in orchestrator if hooks handle side effects)
  // ===========================================================
  // Side effects related to user lookup and form state are now in their respective hooks

  // ===========================================================
  // 4. UTILITY / HELPER FUNCTIONS (Specific to this page)
  // ===========================================================

  // Centralized error clearing
  const clearAllErrors = useCallback(() => {
    clearFieldErrors(); // Clear errors managed by the state hook
    setSubmissionError(null); // Clear general submission error managed here
    // notFoundUsername is managed within useUserLookupDebounced hook
  }, [clearFieldErrors]);

  // --- Input Handlers that need access to clearAllErrors ---
  // Wrap handlers from hook if they need to call clearAllErrors, or modify hook itself
  // For simplicity, let's assume the hook's handlers already call clearFieldErrors.
  // We just need to ensure clearAllErrors is called for general submission errors if needed.
  // We'll add clearAllErrors at the START of handleSubmit instead.

  // --- Dynamic Class Helpers ---
  const getSendButtonClass = useCallback((): string => {
    const commonClasses =
      "text-white py-2 px-4 rounded-md transition-colors duration-200"; // Removed cursor-pointer as disabled handles it
    const styles = {
      PROBLEM: `bg-red-600 hover:bg-red-700`,
      SUGGESTION: `bg-green-600 hover:bg-green-700`,
    };
    const typeKey = caseTypeParam || "PROBLEM"; // Default needed if used before guard clause
    // Disable button visually if submitting or if creator isn't identified yet
    const disabledClass =
      isSubmitting || createCaseLoading || !fetchedCreatorId
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer";
    return `${commonClasses} ${styles[typeKey]} ${disabledClass}`;
  }, [caseTypeParam, isSubmitting, createCaseLoading, fetchedCreatorId]);

  // ===========================================================
  // 5. EVENT HANDLERS (Form Submit, Modal Toggle)
  // ===========================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAllErrors(); // Clear previous errors before attempting submission

    // --- Validation ---
    let isValid = true;
    if (!content.trim()) {
      setContentError(
        "Описанието е задължително и не може да съдържа само интервали."
      );
      isValid = false;
    }
    if (!fetchedCreatorId) {
      setUsernameError(
        "Моля, въведете валидно потребителско име и изчакайте проверката."
      );
      isValid = false;
    }
    if (selectedCategories.length === 0) {
      setSubmissionError("Моля, изберете поне една категория.");
      isValid = false;
    }
    if (!caseTypeParam) {
      setSubmissionError("Грешка: Невалиден тип на случая.");
      isValid = false;
    } // Should not happen

    if (!isValid) return;

    setIsSubmitting(true);

    // --- Prepare Attachments ---
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
      setSubmissionError("Грешка при обработка на прикачени файлове.");
      setIsSubmitting(false);
      return;
    }

    // --- Find Category IDs ---
    const categoryIds = findCategoryIds(selectedCategories, categoryList);
    if (
      categoryIds.length !== selectedCategories.length &&
      selectedCategories.length > 0
    ) {
      // Check if mapping failed for selected cats
      setSubmissionError("Грешка при обработката на избраните категории.");
      setIsSubmitting(false);
      return;
    }

    // --- Prepare Final Input Object for Mutation ---
    const input: CreateCaseInput = {
      content: content.trim(),
      type: caseTypeParam!, // <-- Added '!' assertion
      priority: priority,
      categories: categoryIds,
      creator: fetchedCreatorId!, // <-- Added '!' assertion
      attachments: attachmentInputs,
    };

    console.log("------ Client: Sending Input for CreateCase ------");
    console.log(
      "Input:",
      JSON.stringify(
        { ...input, attachments: input.attachments?.map((a) => a.filename) },
        null,
        2
      )
    );
    console.log("-----------------------------------------------");

    // --- Execute Mutation ---
    try {
      const newCase = await executeCreateCase(input); // Pass variables correctly
      console.log("Case created successfully:", newCase);
      alert("Сигналът е изпратен успешно!");

      // --- Post-submission actions ---
      setContent("");
      setPriority("LOW");
      setSelectedCategories([]);
      setAttachments([]);
      setUsernameInput(""); // Clear username input state managed by hook
      // Fetched name/ID cleared by lookup hook on username clear
      navigate("/");
    } catch (err) {
      console.error("Submission catch block:", err);
      const errorMsg =
        createCaseError?.message ||
        (err instanceof Error
          ? err.message
          : "An unexpected error occurred during submission.");
      setSubmissionError(`Failed to create case: ${errorMsg}`); // Use general error for mutation failure
    } finally {
      setIsSubmitting(false);
    }
  }; // End of handleSubmit

  const openHelpModal = () => setIsHelpModalOpen(true);
  const closeHelpModal = () => setIsHelpModalOpen(false);

  // ===========================================================
  // 6. CONDITIONAL RETURNS (Loading/Error for initial data)
  // ===========================================================
  if (categoriesLoading)
    return <div className="p-6">Loading categories...</div>;
  if (categoriesError)
    return (
      <div className="p-6 text-red-600">
        Error loading categories: {categoriesError.message}
      </div>
    );
  if (!caseTypeParam)
    return (
      <div className="p-6 text-red-600">
        Invalid or missing case type in URL (?type=problem or ?type=suggestion).
      </div>
    );

  // ===========================================================
  // 7. JSX RENDER (Composition)
  // ===========================================================
  const formId = "case-form"; // ID to link submit button

  return (
    <>
      <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200">
        <CaseFormHeader
          caseTypeParam={caseTypeParam}
          isSubmitDisabled={!fetchedCreatorId} // Pass flag based on creator ID
          isLoading={isSubmitting || createCaseLoading} // Combine loading states
          formId={formId}
          onHelpClick={openHelpModal}
          getSendButtonClass={getSendButtonClass} // Pass style function
        />

        {/* Submission Error Display */}
        <div
          className={`col-span-1 md:col-span-2 p-3 rounded-md border transition-opacity duration-300 ${
            submissionError
              ? "bg-red-100 border-red-400 text-red-700 opacity-100"
              : "border-transparent opacity-0"
          }`}
          aria-live="polite"
        >
          {submissionError || "\u00A0"}
        </div>

        {/* Form Content */}
        <form id={formId} className="contents" onSubmit={handleSubmit}>
          <CaseFormLeftPanel
            // User lookup state/handlers
            usernameInput={usernameInput}
            handleUsernameChange={(e) => {
              clearAllErrors();
              setUsernameInput(e.target.value);
            }} // Clear errors + call setter from hook
            userLoading={userLoading}
            userError={userError}
            usernameError={usernameError} // Submit validation error
            notFoundUsername={notFoundUsername} // User not found feedback
            fetchedName={fetchedName}
            // Content state/handler/error
            content={content}
            // handleContentChange={(e) => { clearAllErrors(); setContent(e.target.value); }} // Pass combined handler
            handleContentChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              // Pass specific handler
              clearAllErrors();
              setContent(e.target.value);
            }}
            contentError={contentError}
            // Attachments state/handlers/error
            attachments={attachments}
            handleFileChange={(e) => {
              clearAllErrors();
              handleFileChange(e);
            }} // Clear errors + call handler from hook
            handleRemoveAttachment={(name) => {
              clearAllErrors();
              handleRemoveAttachment(name);
            }} // Clear errors + call handler from hook
            fileError={fileError}
            // Constants
            maxFiles={MAX_FILES}
            maxFileSizeMB={MAX_FILE_SIZE_MB}
          />

          <CaseFormRightPanel
            priority={priority}
            // handlePriorityChange={(e) => { clearAllErrors(); setPriority(e.target.value as CasePriority); }} // Pass combined handler
            handlePriorityChange={(e: ChangeEvent<HTMLInputElement>) => {
              // Pass specific handler
              clearAllErrors();
              setPriority(e.target.value as CasePriority);
            }}
            selectedCategories={selectedCategories}
            toggleCategory={(name) => {
              clearAllErrors();
              toggleCategory(name);
            }} // Clear errors + call handler from hook
            categoryList={categoryList || []} // Pass category data
            maxSelectedCategories={MAX_SELECTED_CATEGORIES}
            caseTypeParam={caseTypeParam}
          />
        </form>
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={closeHelpModal}
        title="Помощна Информация"
      >
        {helpModalContent}
      </HelpModal>
    </>
  );
};

export default CaseSubmittion;
