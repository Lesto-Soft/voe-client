import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ApolloError, useLazyQuery } from "@apollo/client"; // Added gql and useLazyQuery
import { useTranslation } from "react-i18next";

// Assuming hooks/types are in these locations - adjust paths as necessary
import { useGetActiveCategories } from "../graphql/hooks/category";
import { useCreateCase, CreateCaseInput } from "../graphql/hooks/case"; // Your mutation hook
import HelpModal from "../components/modals/HelpModal";
import LoadingModal from "../components/modals/LoadingModal";
import { GET_USER_BY_USERNAME } from "../graphql/query/user";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 2MB in bytes
const MAX_SELECTED_CATEGORIES = 3;
// --- Interfaces & Types ---

// Shape of the user query data
interface UserQueryResult {
  getLeanUserByUsername: {
    _id: string;
    name: string;
  } | null; // User might not be found
}

// Variables type for the user query
interface UserQueryVars {
  username: string;
}

// Shape of attachment input for mutation
type AttachmentInput = {
  filename: string;
  file: string; // base64 string
};

// Shape of categories returned by useGetActiveCategories hook
interface Category {
  _id: string;
  name: string;
  problem?: string;
  suggestion?: string;
}

// Shape of the data structure returned by useGetActiveCategories
interface GetActiveCategoriesQueryResult {
  getLeanActiveCategories?: Category[];
}

// Return type definition for useGetActiveCategories hook
interface UseGetActiveCategoriesReturn {
  loading: boolean;
  error?: ApolloError | Error | any;
  categories?: GetActiveCategoriesQueryResult;
  refetch: () => Promise<any>;
}

// --- Helper Functions (Ensure these are defined or imported) ---

// Reads a File object and returns a Promise resolving with base64 string
const readFileAsBase64 = (file: File): Promise<string> => {
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

// Finds category IDs based on selected names
const findCategoryIds = (
  selectedNames: string[],
  allCategories: Category[]
): string[] => {
  if (!allCategories) return [];
  return allCategories
    .filter((cat) => selectedNames.includes(cat.name))
    .map((cat) => cat._id)
    .filter((id): id is string => !!id); // Type guard to ensure only strings
};

// --- Component Implementation ---

const CaseSubmittion: React.FC = () => {
  // ===========================================================
  // 1. HOOKS (Apollo Queries/Mutations, Router, State)
  // ===========================================================

  // Translation hook
  const { t } = useTranslation("caseSubmission");
  // --- Hooks for data fetching and navigation ---
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  }: UseGetActiveCategoriesReturn = useGetActiveCategories();

  const {
    createCase: executeCreateCase,
    loading: createCaseLoading,
    error: createCaseError,
  } = useCreateCase(); // Hook for submitting the case

  // Using useLazyQuery directly for user lookup
  const [
    getUserByUsername, // Function to call the query
    { loading: userLoading, error: userError, data: userData }, // Query status/result
  ] = useLazyQuery<UserQueryResult, UserQueryVars>(GET_USER_BY_USERNAME);

  const { search } = useLocation();
  const navigate = useNavigate();

  // --- Component State ---
  const [content, setContent] = useState<string>("");
  const [priority, setPriority] = useState<CreateCaseInput["priority"]>("LOW");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]); // Holds selected File objects

  // State for User Input/Lookup
  const [usernameInput, setUsernameInput] = useState<string>(""); // Input for username lookup
  const [fetchedName, setFetchedName] = useState<string>(""); // Displayed, disabled name
  const [fetchedCreatorId, setFetchedCreatorId] = useState<string | null>(null); // Store the ID for submission
  const [notFoundUsername, setNotFoundUsername] = useState<string | null>(null);
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);

  // State for submission status and errors
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null); // File-specific error state

  // State for help modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Ref for debounce timer
  const debounceTimerRef = useRef<number | null>(null);
  const DEBOUNCE_DELAY = 500; // 0.5 seconds

  // ===========================================================
  // 2. DERIVED STATE / VALUES / MEMOIZED CALCULATIONS
  // ===========================================================

  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  // Get case type from URL, default to null if not present or invalid
  const caseTypeParam = useMemo(() => {
    const type = queryParams.get("type")?.toUpperCase();
    if (type === "PROBLEM" || type === "SUGGESTION") {
      return type;
    }
    return null;
  }, [queryParams]);

  const categoryList: Category[] = useMemo(
    () => categoriesData?.getLeanActiveCategories ?? [],
    [categoriesData]
  );

  const helpModalContent = useMemo<React.ReactNode>(() => {
    if (!Array.isArray(categoryList)) {
      console.error("Category list is not an array:", categoryList);
      return <p>{t("caseSubmission.helpModal.categoryProcessingError")}</p>;
    }
    if (selectedCategories.length === 0) {
      return <p>{t("caseSubmission.helpModal.selectCategoriesPrompt")}</p>;
    }
    const relevantCategories = categoryList.filter((cat) =>
      selectedCategories.includes(cat.name)
    );

    if (relevantCategories.length === 0) {
      return <p>{t("caseSubmission.helpModal.noInfoFound")}</p>;
    }
    // Use caseTypeParam directly here, ensuring it's handled if null
    const descriptionKey: keyof Category | null =
      caseTypeParam === "PROBLEM"
        ? "problem"
        : caseTypeParam === "SUGGESTION"
        ? "suggestion"
        : null;

    if (!descriptionKey) {
      return <p>{t("caseSubmission.helpModal.invalidCaseType")}</p>; // Handle null caseTypeParam
    }

    // *** IMPORTANT: Category Descriptions ***
    // If category.problem/category.suggestion ALSO need translation,
    // your API needs to return localized descriptions based on the current language (i18n.language).
    // Or, you could try mapping keys if the descriptions are simple, e.g., category.descriptionKey_en, category.descriptionKey_bg
    // For now, assuming the description itself is language-agnostic or already correct.

    return (
      <div className="space-y-3 text-sm max-h-60 overflow-y-auto pr-2">
        {relevantCategories.map((category) => {
          const description = category[descriptionKey];
          return (
            <div key={category._id}>
              {" "}
              {/* Use _id for key */}
              <strong className="font-semibold block mb-1">
                {category.name}:{" "}
                {/* Category name might also need translation if it comes from DB in one language */}
              </strong>
              {description ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p className="text-gray-500 italic">
                  {t("caseSubmission.helpModal.noDescriptionAvailable")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [selectedCategories, categoryList, caseTypeParam]);

  // ===========================================================
  // 3. EFFECTS (Side Effects, Data Fetching Triggers)
  // ===========================================================

  // --- Effect for Debouncing Username Input ---
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const trimmedUsername = usernameInput.trim();
    // Clear results if input is empty
    if (!trimmedUsername) {
      setFetchedName("");
      setFetchedCreatorId(null);
      setNotFoundUsername(null);
      setSearchedUsername(null); // Clear searched username too
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      console.log(`Debounced: Fetching user for username: ${trimmedUsername}`);
      setSearchedUsername(trimmedUsername); // <-- STORE the username being queried
      getUserByUsername({ variables: { username: trimmedUsername } });
    }, DEBOUNCE_DELAY);

    return () => {
      // Cleanup
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [usernameInput, getUserByUsername]); // This effect *should* depend on usernameInput

  // --- Effect for Handling User Query Result ---
  useEffect(() => {
    // Don't process stale data if loading is true for a *new* search
    if (userLoading) {
      // Optional: You could clear the notFoundUsername here when loading starts
      // setNotFoundUsername(null);
      return;
    }

    // Handle network or GraphQL errors after loading finishes
    if (userError) {
      console.error("User query error:", userError);
      setFetchedName("");
      setFetchedCreatorId(null);
      setNotFoundUsername(null); // Clear "not found" message on network error
      return;
    }

    // Only process if query finished without network/GraphQL error (userData might be null/undefined)
    // Check typeof to handle initial undefined state vs explicit null result
    if (typeof userData !== "undefined") {
      if (userData && userData.getLeanUserByUsername) {
        // SUCCESS Case
        setFetchedName(userData.getLeanUserByUsername.name);
        setFetchedCreatorId(userData.getLeanUserByUsername._id);
        setNotFoundUsername(null); // ** Clear "not found" message on success **
      } else {
        // FAILURE Case ("Not Found" response from server)
        setFetchedName("");
        setFetchedCreatorId(null);
        // Set "not found" message only if a search was actually performed
        // and the result corresponds to that search
        if (searchedUsername) {
          setNotFoundUsername(searchedUsername); // ** Use the searched username **
        } else {
          setNotFoundUsername(null); // Should already be null if searchedUsername is null
        }
      }
    }
    // No else needed - initial state or state after clearing is handled
  }, [userData, userLoading, userError, searchedUsername]); // ** REMOVED usernameInput dependency **

  // ===========================================================
  // 4. CONDITIONAL RETURNS (Loading/Error States)
  // ===========================================================

  if (categoriesLoading)
    return <div className="p-6">Loading categories...</div>;
  if (categoriesError)
    return (
      <div className="p-6 text-red-600">
        {t("caseSubmission.loadingCategoriesError", {
          message: categoriesError.message,
        })}
      </div>
    );
  if (!caseTypeParam)
    return (
      <div className="p-6 text-red-600">{t("caseSubmission.invalidType")}</div>
    );

  // ===========================================================
  // 5. EVENT HANDLERS & LOGIC HELPERS
  // ===========================================================

  // --- Helper to clear all validation/feedback states ---
  const clearAllErrors = () => {
    setSubmissionError(null); // General submission error (e.g., for category)
    setFileError(null); // Specific file error (e.g., size limit)
    // We don't clear userError (network/GraphQL errors) here, as they might persist
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNotFoundUsername(null); // Specific "user not found" feedback from search
    setUsernameInput(event.target.value);
  };
  // Updated handler to check limits BEFORE adding files
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearAllErrors(); // Clear previous errors (includes setFileError(null))
    const selectedFiles = event.target.files
      ? Array.from(event.target.files)
      : [];

    if (selectedFiles.length === 0) {
      if (event.target) event.target.value = ""; // Clear input value on cancel/empty select
      return; // No files selected, nothing to do
    }

    let processingError: string | null = null; // Store the first critical error encountered

    // Use setAttachments callback form to reliably access previous state
    setAttachments((prevAttachments) => {
      const currentCount = prevAttachments.length;
      const availableSlots = MAX_FILES - currentCount;

      // --- Check 1: Max file count ---
      if (availableSlots <= 0) {
        processingError = t("caseSubmission.errors.file.maxCountExceeded", {
          max: MAX_FILES,
        });
        // Return previous state immediately, no need to process files
        return prevAttachments;
      }

      let validFilesToAdd: File[] = [];
      const oversizedFiles: string[] = [];
      const duplicateFiles: string[] = [];
      const countLimitedFiles: string[] = [];

      // Create signatures of existing files for duplicate check
      const existingFileSignatures = new Set(
        prevAttachments.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );

      // Process only as many selected files as there are available slots
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const signature = `${file.name}-${file.size}-${file.lastModified}`;

        // --- Check 2: Individual file size ---
        if (file.size > MAX_FILE_SIZE_BYTES) {
          oversizedFiles.push(file.name);
          continue; // Skip this file
        }

        // --- Check 3: Is count limit reached during processing? ---
        if (validFilesToAdd.length >= availableSlots) {
          countLimitedFiles.push(file.name);
          continue; // Skip remaining files once slots are full
        }

        // --- Check 4: Duplicates ---
        if (existingFileSignatures.has(signature)) {
          duplicateFiles.push(file.name);
          continue; // Skip this file
        }

        // If all checks pass, add to the list for this batch
        validFilesToAdd.push(file);
      }

      // --- Set Feedback Messages (Prioritized) ---
      if (oversizedFiles.length > 0) {
        processingError = t("caseSubmission.errors.file.oversized", {
          maxSize: MAX_FILE_SIZE_MB,
          fileList: oversizedFiles.join(", "),
        });
        // Optionally append count limit message if applicable
        if (countLimitedFiles.length > 0) {
          processingError += ` ${t(
            "caseSubmission.errors.file.oversizedAndMaxCount",
            { max: MAX_FILES }
          )}`;
        }
      } else if (countLimitedFiles.length > 0) {
        // This message now implies files were skipped *only* due to the count limit
        processingError = t("caseSubmission.errors.file.maxCountReached", {
          max: MAX_FILES,
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
  const handleRemoveAttachment = (fileNameToRemove: string) => {
    setFileError(null);
    setAttachments((prevAttachments) =>
      // Create a new array excluding the file with the matching name
      prevAttachments.filter((file) => file.name !== fileNameToRemove)
    );
    // Note: Programmatically clearing the <input type="file"> value is
    // unreliable across browsers and often not necessary. The user can
    // always click "Choose Files" again to re-select.
  };

  const toggleCategory = (categoryName: string): void => {
    clearAllErrors(); // Clear errors when category changes
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((c) => c !== categoryName); // unselect
      } else if (prev.length < MAX_SELECTED_CATEGORIES) {
        return [...prev, categoryName]; // select new
      } else {
        return prev; // ignore if already 3 selected
      }
    });
  };

  // --- Dynamic Class Helpers ---
  const getCategoryClass = (categoryName: string): string => {
    const isSelected = selectedCategories.includes(categoryName);
    const isDisabled =
      !isSelected && selectedCategories.length >= MAX_SELECTED_CATEGORIES;
    const commonClasses =
      "px-3 py-1 border rounded-full text-sm transition-colors duration-200 cursor-pointer";
    const styles = {
      /* ... (your existing PROBLEM/SUGGESTION styles object) ... */
      PROBLEM: {
        selected: `bg-red-500 text-white border-red-500 hover:bg-red-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:border-red-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`,
      },
      SUGGESTION: {
        selected: `bg-green-500 text-white border-green-500 hover:bg-green-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`,
      },
    };
    const state = isSelected
      ? "selected"
      : isDisabled
      ? "disabled"
      : "unselected";
    return `${commonClasses} ${styles[caseTypeParam][state]}`; // caseTypeParam is guaranteed non-null here
  };

  const getSendButtonClass = (): string => {
    const commonClasses =
      "text-white py-2 px-4 rounded-md cursor-pointer transition-colors duration-200";
    const styles = {
      PROBLEM: `bg-red-600 hover:bg-red-700`,
      SUGGESTION: `bg-green-600 hover:bg-green-700`,
    };
    // Disable button visually if submitting //or if creator isn't identified yet
    const disabledClass =
      isSubmitting || createCaseLoading //|| !fetchedCreatorId
        ? "opacity-50 cursor-not-allowed"
        : "";
    return `${commonClasses} ${styles[caseTypeParam]} ${disabledClass}`; // caseTypeParam is guaranteed non-null here
  };

  // --- Modal Handlers ---
  const openHelpModal = (): void => setIsHelpModalOpen(true);
  const closeHelpModal = (): void => setIsHelpModalOpen(false);

  // --- Form Submission Handler ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(null);

    // --- Validation ---
    if (!fetchedCreatorId) {
      setSubmissionError(t("caseSubmission.errors.submission.missingUsername"));
      return;
    }
    if (!content.trim()) {
      setSubmissionError(
        t("caseSubmission.errors.submission.missingDescription")
      );
      return;
    }
    if (selectedCategories.length === 0) {
      setSubmissionError(t("caseSubmission.errors.submission.missingCategory"));
      return;
    }
    // caseTypeParam already validated for page render

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
      setSubmissionError(
        t("caseSubmission.errors.submission.fileProcessingError")
      );
      setIsSubmitting(false);
      return;
    }

    // --- Find Category IDs ---
    const categoryIds = findCategoryIds(selectedCategories, categoryList);
    if (categoryIds.length !== selectedCategories.length) {
      setSubmissionError(
        t("caseSubmission.errors.submission.categoryProcessingError")
      );
      setIsSubmitting(false);
      return;
    }

    // --- Prepare Final Input Object for Mutation ---
    const input: CreateCaseInput = {
      content: content.trim(),
      type: caseTypeParam, // Non-null due to page check
      priority: priority,
      categories: categoryIds,
      creator: fetchedCreatorId, // Use the ID fetched via username lookup
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
    ); // Log without full base64
    console.log("-----------------------------------------------");

    // --- Execute Mutation ---
    try {
      const newCase = await executeCreateCase(input);
      console.log("Case created successfully:", newCase);
      alert("Сигналът е изпратен успешно!");

      // --- Post-submission actions ---
      setContent("");
      setPriority("LOW");
      setSelectedCategories([]);
      setAttachments([]);
      setUsernameInput(""); // Clear username input
      setFetchedName(""); // Clear derived name
      setFetchedCreatorId(null); // Clear creator ID
      navigate("/"); // Navigate away
    } catch (err) {
      console.error("Submission catch block:", err);
      const errorMsg =
        createCaseError?.message ||
        (err instanceof Error
          ? err.message
          : t("caseSubmission.errors.submission.unexpectedError"));
      setSubmissionError(
        t("caseSubmission.errors.submission.generalSubmissionError", {
          message: errorMsg,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===========================================================
  // 6. JSX RENDER
  // ===========================================================
  const showLoadingModal =
    categoriesLoading || isSubmitting || createCaseLoading;

  return (
    <>
      <LoadingModal
        isOpen={showLoadingModal} // Use the declared variable
        message={
          categoriesLoading
            ? t("caseSubmission.loadingForm") // Message during initial load
            : t("caseSubmission.submittingCase") // Message during submission
        }
      />
      <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200">
        {/* Header Row */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {t("caseSubmission.title", {
                type: t(
                  `caseSubmission.caseType.${caseTypeParam.toLowerCase()}`
                ), // e.g. caseType.problem or caseType.suggestion
              })}
            </h2>
            <p className="text-sm text-gray-500">
              {t("caseSubmission.subtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openHelpModal}
              className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-200 active:bg-gray-300"
            >
              {t("caseSubmission.helpButton")}
            </button>
            <Link to="/">
              <button className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-200 active:bg-gray-300">
                {t("caseSubmission.backButton")}
              </button>
            </Link>
            <button
              type="submit"
              form="case-form"
              className={getSendButtonClass()}
              disabled={isSubmitting || createCaseLoading} // Disable if submitting ( || !fetchedCreatorIdor creator not found)
            >
              {isSubmitting || createCaseLoading
                ? t("caseSubmission.submittingButton")
                : t("caseSubmission.submitButton")}
            </button>
          </div>
        </div>

        {/* Submission Error Display - Always rendered, uses opacity */}
        <div
          className={`
          col-span-1 md:col-span-2 p-3 rounded-md border
          transition-opacity duration-300
          ${
            submissionError
              ? "bg-red-100 border-red-400 text-red-700 opacity-100" // Visible styles
              : "border-transparent text-transparent opacity-0" // Hidden: Make border & text transparent, opacity 0
          }
        `}
          aria-live="polite"
        >
          {/* Display error or non-breaking space to maintain height */}
          {submissionError || "\u00A0"}
        </div>

        {/* Form Content */}
        <form id="case-form" className="contents" onSubmit={handleSubmit}>
          {/* Left Panel */}
          <div className="rounded-2xl shadow-md bg-white p-6 min-h-96">
            {/* Removed the outer space-y-4 here, will apply spacing individually */}
            <div className="space-y-4">
              {" "}
              {/* Re-added space-y-4 for overall spacing */}
              {/* --- Row for Username and Name --- */}
              <div className="flex flex-col md:flex-row md:gap-x-4 space-y-4 md:space-y-0">
                {" "}
                {/* Flex container for row */}
                {/* Username Input Column (includes feedback) */}
                <div className="flex-1">
                  {" "}
                  {/* Takes available space */}
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("caseSubmission.usernameLabel")}
                  </label>
                  <input
                    type="text" // Ensure type="text"
                    id="username" // Add id for label
                    placeholder="emp___"
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    name="username"
                    aria-label={t("caseSubmission.usernameLabel")}
                    value={usernameInput}
                    onChange={handleUsernameChange} // Clears notFoundUsername state too
                  />
                  {/* Feedback Area below username input */}
                  <div className="h-5 mt-1">
                    {" "}
                    {/* Fixed height container for feedback
                    {userLoading && (
                      <p className="text-sm text-gray-500 animate-pulse">
                        Търсене...
                      </p>
                    )} */}
                    {userError && (
                      <p className="text-sm text-red-500">
                        {t("caseSubmission.userSearchLoading")}
                      </p>
                    )}
                    <p
                      className={`text-sm text-orange-500 transition-opacity duration-200 ${
                        notFoundUsername ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {notFoundUsername
                        ? t("caseSubmission.userNotFoundError", {
                            username: notFoundUsername,
                          })
                        : "\u00A0"}
                    </p>
                  </div>
                </div>
                {/* Name Input Column */}
                <div className="flex-1">
                  {" "}
                  {/* Takes available space */}
                  <label
                    htmlFor="fullname"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("caseSubmission.fullNameLabel")}
                  </label>
                  <input
                    type="text" // Ensure type="text"
                    id="fullname" // Add id for label
                    placeholder={t("caseSubmission.fullNamePlaceholder")}
                    className="w-full border border-gray-300 p-3 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-0" // Adjusted disabled style
                    name="fullname"
                    aria-label={t("caseSubmission.fullNameLabel")}
                    value={fetchedName}
                    disabled // Keep disabled
                    readOnly // Good practice
                  />
                  {/* Optional: Add empty div for height consistency if needed */}
                  <div className="h-5 mt-1"></div>
                </div>
              </div>
              {/* Description Textarea */}
              <div>
                {" "}
                {/* Added wrapper for spacing consistency */}
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("caseSubmission.descriptionLabel")}
                </label>
                <textarea
                  id="description"
                  placeholder={t("caseSubmission.descriptionPlaceholder")}
                  className="w-full h-40 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  // required
                  name="description"
                  value={content}
                  onChange={(e) => {
                    clearAllErrors();
                    setContent(e.target.value);
                  }}
                  maxLength={500}
                  aria-label={t("caseSubmission.descriptionLabel")}
                />
              </div>
              {/* File Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {/* Update label to show current count vs max */}
                  {t("caseSubmission.attachmentsLabel", {
                    count: attachments.length,
                    max: MAX_FILES,
                    maxSize: MAX_FILE_SIZE_MB,
                  })}
                </label>
                {/* Styled Label acting as Button - Disable visually if max files reached */}
                <label
                  htmlFor="file-upload-input"
                  className={`w-full text-center inline-block rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ${
                    attachments.length >= MAX_FILES
                      ? "opacity-75 cursor-not-allowed" // Disabled style
                      : "cursor-pointer hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" // Enabled style
                  }`}
                  // Prevent triggering input if disabled (CSS should suffice, but JS backup)
                  onClick={(e) => {
                    if (attachments.length >= MAX_FILES) e.preventDefault();
                  }}
                >
                  {t("caseSubmission.selectFilesButton")}
                </label>
                {/* Hidden Actual File Input - Disable if max files reached */}
                <input
                  id="file-upload-input"
                  name="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={attachments.length >= MAX_FILES} // HTML disabled attribute
                  // Optional: Add accept attribute for client-side hint (doesn't enforce size)
                  // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                />

                {/* Display File Errors */}
                <div className="h-5 mt-1">
                  {" "}
                  {/* Reserve space */}
                  <p
                    className={`text-sm text-red-500 transition-opacity duration-200 ${
                      fileError ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {fileError || "\u00A0"}
                  </p>
                </div>

                {/* Container for Selected Files List - Reserves space */}
                <div className="mt-2 min-h-[3rem]">
                  {" "}
                  {/* Keeps minimum space */}
                  {/* Conditionally render the list container *inside* */}
                  <div
                    className={`text-sm text-gray-600 space-y-1 h-20 overflow-y-auto rounded p-2 ${
                      attachments.length === 0
                        ? ""
                        : "border border-gray-200 bg-gray-50"
                    }`} // Added max-h, overflow, border, padding, bg
                  >
                    {attachments.length > 0 && (
                      // Apply max-height and overflow to this inner div
                      <ul className="list-none pl-1 space-y-1">
                        {attachments.map((file) => (
                          <li
                            key={file.name + "-" + file.lastModified}
                            className="flex justify-between items-center group p-1 rounded hover:bg-gray-200" // Hover effect on item
                          >
                            <span
                              className="truncate pr-2 group-hover:underline"
                              title={file.name}
                            >
                              {file.name}{" "}
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(file.name)}
                              className="ml-2 px-1.5 py-0.5 text-red-500 hover:text-red-700 text-lg font-bold leading-none rounded focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                              aria-label={`Remove ${file.name}`}
                            >
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* End Container for Selected Files List */}
              </div>
              {/* --- End File Input Section --- */}
            </div>{" "}
            {/* End space-y-4 */}
          </div>
          {/* End Left Panel */}

          {/* Right Panel */}
          <div className="rounded-2xl shadow-md bg-white p-6 min-h-96">
            <div className="space-y-6">
              {/* Priority */}
              <div>
                <p className="text-sm font-medium mb-3 text-gray-700">
                  {t("caseSubmission.priorityLabel")}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    {
                      label: `${t("caseSubmission.priority.low")}`,
                      value: "LOW",
                      color: "#009b00",
                    },
                    {
                      label: `${t("caseSubmission.priority.medium")}`,
                      value: "MEDIUM",
                      color: "#ad8600",
                    },
                    {
                      label: `${t("caseSubmission.priority.high")}`,
                      value: "HIGH",
                      color: "#c30505",
                    },
                  ].map(({ label, value, color }) => (
                    <label
                      key={value}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={priority === value}
                        onChange={(e) => {
                          clearAllErrors();
                          setPriority(
                            e.target.value as CreateCaseInput["priority"]
                          );
                        }}
                        style={{ accentColor: color }}
                        className="w-4 h-4 cursor-pointer"
                        name="priority"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Categories */}
              <div>
                <p className="text-sm font-medium mb-3 text-gray-700">
                  {t("caseSubmission.categoriesLabel", {
                    maxSelect: MAX_SELECTED_CATEGORIES,
                  })}
                </p>
                {categoryList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map((category) => (
                      <button
                        key={category._id}
                        type="button"
                        onClick={() => toggleCategory(category.name)}
                        className={`uppercase ${getCategoryClass(
                          category.name
                        )}`}
                        disabled={
                          !selectedCategories.includes(category.name) &&
                          selectedCategories.length >= MAX_SELECTED_CATEGORIES
                        }
                        aria-pressed={selectedCategories.includes(
                          category.name
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {t("caseSubmission.categoryNoneFound")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal Component Rendering */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={closeHelpModal}
        title={t("caseSubmission.helpModal.title")}
      >
        {helpModalContent}
      </HelpModal>
    </>
  );
};

export default CaseSubmittion;
