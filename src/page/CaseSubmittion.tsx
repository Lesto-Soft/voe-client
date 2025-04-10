import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router"; // Assuming React Router v6+ for useNavigate
import { ApolloError } from "@apollo/client";
import { useGetActiveCategories } from "../graphql/hooks/category";
import { useCreateCase, CreateCaseInput } from "../graphql/hooks/case"; // Import the hook and type
import HelpModal from "../components/modals/HelpModal";
// --- Helper function for finding category IDs ---
const findCategoryIds = (
  selectedNames: string[],
  allCategories: Category[]
): string[] => {
  console.log("Finding IDs for names:", selectedNames);
  console.log("Using category list:", allCategories); // Check if _id is present here
  if (!allCategories) return [];
  const ids = allCategories
    .filter((cat) => selectedNames.includes(cat.name))
    .map((cat) => cat._id)
    .filter((id): id is string => !!id);
  console.log("Found IDs:", ids); // Check the result
  return ids;
};
// Assuming your Category type includes _id based on the fragment
interface Category {
  _id: string; // Added _id based on your GraphQL fragment
  name: string;
  problem?: string;
  suggestion?: string;
}
export type CaseType = "problem" | "suggestion"; // Keep this if used elsewhere

interface GetActiveCategoriesQueryResult {
  getLeanActiveCategories?: Category[];
}

interface UseGetActiveCategoriesReturn {
  loading: boolean;
  error?: ApolloError | Error | any;
  categories?: GetActiveCategoriesQueryResult;
  refetch: () => Promise<any>;
}
// --- Mock User ID (Replace with actual user context/auth) ---
// TODO: Replace this with your actual method of getting the logged-in user's ID
const MOCK_USER_ID = "630899dc48a9a14833398a7e"; // Example ID

// --- Component Implementation ---
const CaseSubmittion: React.FC = () => {
  // ===========================================================
  // 1. ALL HOOK CALLS MUST BE AT THE TOP, UNCONDITIONAL
  // ===========================================================
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  }: UseGetActiveCategoriesReturn = useGetActiveCategories();

  // --- State for form inputs ---
  const [content, setContent] = useState<string>("");
  // TODO: Remove username/fullname if creator ID comes from auth
  const [username, setUsername] = useState<string>(""); // Likely temporary if using auth
  const [fullname, setFullname] = useState<string>(""); // Likely temporary
  const [priority, setPriority] = useState<CreateCaseInput["priority"]>("LOW"); // Use type from input
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // State holds category *names*
  const [attachments, setAttachments] = useState<File[]>([]); // State to hold File objects
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Track submission state
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Store submission errors

  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const { search } = useLocation();
  const navigate = useNavigate(); // Hook for navigation after submission

  // --- Hook for the createCase mutation ---
  const {
    createCase: executeCreateCase, // Renamed to avoid conflict
    loading: createCaseLoading,
    error: createCaseError,
  } = useCreateCase();

  // ===========================================================
  // 2. DERIVE STATE / PREPARE VALUES
  // ===========================================================
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const caseTypeParam = useMemo(
    () =>
      queryParams.get("type")?.toUpperCase() as "PROBLEM" | "SUGGESTION" | null,
    [queryParams]
  );
  const categoryList: Category[] = useMemo(
    () => categoriesData?.getLeanActiveCategories ?? [],
    [categoriesData]
  );

  // ===========================================================
  // 3. REMAINING HOOKS (e.g., useEffect for error display, useMemo for modal)
  // ===========================================================
  useEffect(() => {
    if (createCaseError) {
      setSubmissionError(`Failed to create case: ${createCaseError.message}`);
      setIsSubmitting(false); // Reset submitting state on error
    }
  }, [createCaseError]);

  const helpModalContent = useMemo<React.ReactNode>(() => {
    // ... (your existing helpModalContent logic - seems fine)
    if (!Array.isArray(categoryList)) {
      console.error("Category list is not an array:", categoryList);
      return <p>Грешка при обработка на категориите.</p>;
    }
    if (selectedCategories.length === 0) {
      return (
        <p>
          Моля, изберете категории, за да видите подходяща помощна информация.
        </p>
      );
    }
    const relevantCategories = categoryList.filter((cat) =>
      selectedCategories.includes(cat.name)
    );

    if (relevantCategories.length === 0) {
      return <p>Не е намерена помощна информация за избраните категории.</p>;
    }
    // Use caseTypeParam directly here, ensuring it's handled if null
    const descriptionKey: keyof Category | null =
      caseTypeParam === "PROBLEM"
        ? "problem"
        : caseTypeParam === "SUGGESTION"
        ? "suggestion"
        : null;

    if (!descriptionKey) {
      return <p>Невалиден тип на случая за показване на помощ.</p>; // Handle null caseTypeParam
    }

    return (
      <div className="space-y-3 text-sm max-h-60 overflow-y-auto pr-2">
        {relevantCategories.map((category) => {
          const description = category[descriptionKey];
          return (
            <div key={category._id}>
              {" "}
              {/* Use _id for key */}
              <strong className="font-semibold block mb-1">
                {category.name}:
              </strong>
              {description ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p className="text-gray-500 italic">
                  Няма налично описание за тази категория.
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [selectedCategories, categoryList, caseTypeParam]);

  // ===========================================================
  // 4. CONDITIONAL RETURNS (Loading/Error for categories)
  // ===========================================================
  if (categoriesLoading)
    return <div className="p-6">Loading categories...</div>;
  if (categoriesError)
    return (
      <div className="p-6 text-red-600">
        Error loading categories: {categoriesError.message || "Unknown error"}
      </div>
    );
  // Check caseTypeParam validity for rendering the main content
  if (!caseTypeParam) {
    return (
      <div className="p-6 text-red-600">
        Invalid or missing case type specified in URL (?type=problem or
        ?type=suggestion).
      </div>
    );
  }

  // ===========================================================
  // 5. EVENT HANDLERS and other component logic
  // ===========================================================

  // --- Handle File Input Change ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Convert FileList to Array and append to existing files
      setAttachments((prev) => [...prev, ...Array.from(event.target.files!)]);
      // TODO: Add validation for file types, size limits, number of files etc.
      console.log(
        "Files selected:",
        Array.from(event.target.files).map((f) => f.name)
      );
    }
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(null); // Clear previous errors
    setIsSubmitting(true);

    // --- Basic Frontend Validation ---
    if (!content.trim()) {
      setSubmissionError("Описанието е задължително.");
      setIsSubmitting(false);
      return;
    }
    if (selectedCategories.length === 0) {
      setSubmissionError("Моля, изберете поне една категория.");
      setIsSubmitting(false);
      return;
    }
    if (!MOCK_USER_ID) {
      // TODO: Implement proper user ID check
      setSubmissionError(
        "Не може да се идентифицира потребител. Моля, влезте отново."
      );
      setIsSubmitting(false);
      return;
    }

    // --- Map selected category names to their IDs ---
    const categoryIds = findCategoryIds(selectedCategories, categoryList);
    if (categoryIds.length !== selectedCategories.length) {
      console.error("Mismatch finding category IDs", {
        selectedNames: selectedCategories,
        foundIds: categoryIds,
        list: categoryList,
      });
      setSubmissionError(
        "Грешка при обработката на избраните категории. Опитайте отново."
      );
      setIsSubmitting(false);
      return;
    }

    // --- Prepare Input for Mutation ---
    // TODO: Implement actual file upload logic here.
    // This example assumes `uploadAttachmentFiles` returns string identifiers (like URLs or IDs)
    // For now, we'll pass empty array or file names as placeholders.
    // You'll need to upload `attachments` (File objects) first.
    const attachmentIdentifiers: string[] = attachments.map(
      (file) => file.name
    ); // Placeholder

    // Inside handleSubmit, right before the try block:
    const input: CreateCaseInput = {
      content: content.trim(),
      // date: ..., // Removed as likely set server-side
      type: caseTypeParam, // Make sure this is "PROBLEM" or "SUGGESTION"
      priority: priority, // Make sure this is "LOW", "MEDIUM", or "HIGH"
      categories: categoryIds, // The result from findCategoryIds
      creator: MOCK_USER_ID, // Or the actual user ID
      attachments: attachmentIdentifiers, // Result from upload logic/placeholders
    };

    console.log("------ Client: Sending Input ------");
    console.log("Type:", input.type, "(Expected: PROBLEM | SUGGESTION)");
    console.log("Priority:", input.priority, "(Expected: LOW | MEDIUM | HIGH)");
    console.log("Creator:", input.creator, "(Expected: Non-null ID string)");
    console.log(
      "Categories:",
      JSON.stringify(input.categories),
      "(Expected: Array of ID strings, e.g., [])"
    );
    console.log("Content Length:", input.content.length);
    console.log("Attachments:", JSON.stringify(input.attachments));
    console.log("Full Input Object:", JSON.stringify(input, null, 2));
    console.log("---------------------------------");

    try {
      setIsSubmitting(true); // Move this here maybe?
      const response = await executeCreateCase(input); // The actual call
      console.log("Case created successfully:", response);
      alert("Сигналът е изпратен успешно!"); // Simple feedback

      // --- Post-submission actions ---
      // 1. Clear the form
      setContent("");
      setPriority("LOW");
      setSelectedCategories([]);
      setAttachments([]);
      // setUsername(""); // Clear temporary fields if used
      // setFullname("");

      // 2. Optionally navigate away (e.g., to a success page or dashboard)
      // navigate("/"); // Navigate to home page after success
    } catch (err) {
      // Error handling is mostly done by the useEffect hook watching createCaseError
      console.error("Submission catch block:", err);
      // If the error wasn't automatically caught by ApolloError, set it manually
      if (!createCaseError) {
        setSubmissionError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during submission."
        );
      }
    } finally {
      setIsSubmitting(false); // Ensure submitting state is reset
    }
  };

  const getCategoryClass = (categoryName: string): string => {
    // ... (your existing getCategoryClass logic - needs caseTypeParam)
    const isSelected = selectedCategories.includes(categoryName);
    const isDisabled = !isSelected && selectedCategories.length >= 3;
    const commonClasses =
      "px-3 py-1 border rounded-full text-sm transition-colors duration-200 cursor-pointer";

    const styles: Record<
      "PROBLEM" | "SUGGESTION",
      { selected: string; unselected: string; disabled: string }
    > = {
      PROBLEM: {
        selected: `bg-red-500 text-white border-red-500 hover:bg-red-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:border-red-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`, // Added cursor/opacity for disabled
      },
      SUGGESTION: {
        selected: `bg-green-500 text-white border-green-500 hover:bg-green-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`, // Added cursor/opacity for disabled (consistent)
      },
    };
    const typeKey = caseTypeParam === "PROBLEM" ? "PROBLEM" : "SUGGESTION"; // Default to suggestion if needed, but should be valid
    const state = isSelected
      ? "selected"
      : isDisabled
      ? "disabled"
      : "unselected";
    return `${commonClasses} ${styles[typeKey][state]}`;
  };

  const getSendButtonClass = (): string => {
    // ... (your existing getSendButtonClass logic - needs caseTypeParam)
    const commonClasses =
      "text-white py-2 px-4 rounded-md cursor-pointer transition-colors duration-200";
    const styles: Record<"PROBLEM" | "SUGGESTION", string> = {
      PROBLEM: `bg-red-600 hover:bg-red-700`,
      SUGGESTION: `bg-green-600 hover:bg-green-700`,
    };
    const typeKey = caseTypeParam === "PROBLEM" ? "PROBLEM" : "SUGGESTION";
    return `${commonClasses} ${styles[typeKey]} ${
      isSubmitting || createCaseLoading ? "opacity-50 cursor-not-allowed" : ""
    }`;
  };

  const MAX_SELECTED_CATEGORIES = 3;
  const toggleCategory = (categoryName: string): void => {
    // ... (your existing toggleCategory logic)
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

  const openHelpModal = (): void => setIsHelpModalOpen(true);
  const closeHelpModal = (): void => setIsHelpModalOpen(false);

  // ===========================================================
  // 6. JSX RETURN
  // ===========================================================
  return (
    <>
      <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200">
        {/* Header Row */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* ... (Header content: Title, Help, Back) ... */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Подаване на{" "}
              {caseTypeParam === "PROBLEM" ? "проблем" : "предложение"}{" "}
              {/* Dynamic title */}
            </h2>
            <p className="text-sm text-gray-500">
              Моля, попълнете формуляра по-долу
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* ... Help, Back buttons ... */}
            <button
              onClick={openHelpModal}
              className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            >
              ❓ Помощ
            </button>
            <Link to="/">
              <button className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                ← Назад
              </button>
            </Link>
            {/* Submit Button (points to form) */}
            <button
              type="submit"
              form="case-form" // Links button to the form
              className={getSendButtonClass()}
              disabled={isSubmitting || createCaseLoading} // Disable while submitting
            >
              {isSubmitting || createCaseLoading ? "Изпращане..." : "Изпрати"}
            </button>
          </div>
        </div>

        {/* Submission Error Display */}
        {submissionError && (
          <div className="col-span-1 md:col-span-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {submissionError}
          </div>
        )}

        {/* Form Content */}
        <form
          id="case-form"
          className="contents"
          onSubmit={handleSubmit} // Use the handler
        >
          {/* Left Panel */}
          <div className="rounded-2xl shadow-md bg-white p-6">
            <div className="space-y-4">
              {/* TODO: Remove username/fullname inputs if creator ID is handled by authentication */}
              <input
                placeholder="Потребителско име (Временно)..."
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                // required // Remove if using auth
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Потребителско име"
              />
              <input
                placeholder="Име и фамилия (Временно)..."
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                // required // Remove if using auth
                name="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                aria-label="Име и фамилия"
              />
              <textarea
                placeholder="Описание..."
                className="w-full h-40 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                name="description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500} // Match schema
                aria-label="Описание на сигнала"
              />
              {/* File Input */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Прикачени файлове (по избор)
                </label>
                <input
                  id="file-upload"
                  name="attachments"
                  type="file"
                  multiple // Allow multiple files
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  aria-describedby="file_input_help"
                />
                <p className="mt-1 text-xs text-gray-500" id="file_input_help">
                  Макс. размер/брой файлове?
                </p>{" "}
                {/* Add help text */}
                {/* Display selected file names */}
                {attachments.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p className="font-medium">Избрани файлове:</p>
                    <ul className="list-disc list-inside">
                      {attachments.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Old Button - Replaced by styled input */}
              {/* <button
                type="button"
                className="w-full border border-gray-300 p-3 rounded-md text-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors duration-200 text-gray-600"
              >
                📎 Прикачи файлове
              </button> */}
            </div>
          </div>

          {/* Right Panel */}
          <div className="rounded-2xl shadow-md bg-white p-6">
            <div className="space-y-6">
              {/* Priority */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Приоритет</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    // Use correct enum values
                    { label: "Нисък", value: "LOW", color: "#009b00" },
                    { label: "Среден", value: "MEDIUM", color: "#ad8600" },
                    { label: "Висок", value: "HIGH", color: "#c30505" },
                  ].map(({ label, value, color }) => (
                    <label
                      key={value}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={priority === value}
                        onChange={(e) =>
                          setPriority(
                            e.target.value as CreateCaseInput["priority"]
                          )
                        } // Cast type
                        style={{ accentColor: color }}
                        className="w-4 h-4 cursor-pointer"
                        name="priority" // Name ensures only one radio is selected
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">
                  Отнася се за (макс. {MAX_SELECTED_CATEGORIES})
                </h3>
                {categoryList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map((category) => (
                      <button
                        key={category._id} // Use _id for key
                        type="button" // Important: prevent form submission
                        onClick={() => toggleCategory(category.name)}
                        className={getCategoryClass(category.name)}
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
                    Няма налични категории.
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
        title="Помощна Информация"
      >
        {helpModalContent}
      </HelpModal>
    </>
  );
};

export default CaseSubmittion;
