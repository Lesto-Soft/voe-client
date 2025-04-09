import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { ApolloError } from "@apollo/client";
import { useGetActiveCategories } from "../graphql/hooks/category";
import HelpModal from "../components/modals/HelpModal";

export type CaseType = "problem" | "suggestion";

interface Category {
  name: string;
  problem?: string;
  suggestion?: string;
}

interface GetActiveCategoriesQueryResult {
  getLeanActiveCategories?: Category[];
}

interface UseGetActiveCategoriesReturn {
  loading: boolean;
  error?: ApolloError | Error | any;
  categories?: GetActiveCategoriesQueryResult;
  refetch: () => Promise<any>;
}

// --- Component Implementation ---
const CaseSubmittion: React.FC = () => {
  // ===========================================================
  // 1. ALL HOOK CALLS MUST BE AT THE TOP, UNCONDITIONAL
  // ===========================================================
  const {
    categories: categoriesData,
    loading,
    error,
  }: // refetch
  UseGetActiveCategoriesReturn = useGetActiveCategories();

  const [priority, setPriority] = useState<string>("Low");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const { search } = useLocation();

  // ===========================================================
  // 2. DERIVE STATE / PREPARE VALUES (needed for hooks or logic)
  // These can rely on hook results but are not hooks themselves.
  // ===========================================================
  const queryParams = useMemo(() => new URLSearchParams(search), [search]); // useMemo is okay for derived values if needed
  const caseType = useMemo(
    () => queryParams.get("type") as CaseType | null,
    [queryParams]
  );
  const categoryList: Category[] = useMemo(
    () => categoriesData?.getLeanActiveCategories ?? [],
    [categoriesData]
  );

  // ===========================================================
  // 3. CALL THE REMAINING HOOKS (e.g., useMemo for modal content)
  // Now this runs on EVERY render, maintaining order.
  // ===========================================================
  const helpModalContent = useMemo<React.ReactNode>(() => {
    // Logic inside useMemo can handle potentially empty/null values from above

    if (!Array.isArray(categoryList)) {
      // Safety check still good
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
    // Filter logic... (safe even if categoryList is initially [])
    const relevantCategories = categoryList.filter((cat) =>
      selectedCategories.includes(cat.name)
    );

    if (relevantCategories.length === 0) {
      return <p>Не е намерена помощна информация за избраните категории.</p>;
    }
    // Determine descriptionKey (safe even if caseType is null, as filtering handles it)
    const descriptionKey: keyof Category =
      caseType === "problem" ? "problem" : "suggestion";

    return (
      <div className="space-y-3 text-sm max-h-60 overflow-y-auto pr-2">
        {relevantCategories.map((category) => {
          const description = category[descriptionKey];
          return (
            <div key={category.name}>
              {/* Category Name */}
              <strong className="font-semibold block mb-1">
                {category.name}:
              </strong>

              {/* Render the HTML description if it exists */}
              {description ? (
                // Use dangerouslySetInnerHTML to render the trusted HTML
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                // Fallback if description is missing
                <p className="text-gray-500 italic">
                  Няма налично описание за тази категория.
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
    // Dependencies: selectedCategories, categoryList (derived), caseType (derived)
  }, [selectedCategories, categoryList, caseType]);

  // ===========================================================
  // 4. CONDITIONAL RETURNS (Now allowed, after all hooks)
  // ===========================================================
  if (loading) return <div className="p-6">Loading categories...</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        Error loading categories: {error.message || "Unknown error"}
      </div>
    );
  // Check caseType validity for rendering the main content
  if (!caseType || (caseType !== "problem" && caseType !== "suggestion")) {
    return (
      <div className="p-6 text-red-600">
        Invalid case type specified in URL.
      </div>
    );
  }

  // ===========================================================
  // 5. EVENT HANDLERS and other component logic (Not Hooks)
  // ===========================================================
  const getCategoryClass = (categoryName: string): string => {
    /* ... as before ... */
    const isSelected = selectedCategories.includes(categoryName);
    const commonClasses =
      "px-3 py-1 border rounded-full text-sm transition-colors duration-200 cursor-pointer";
    const styles: Record<CaseType, { selected: string; unselected: string }> = {
      problem: {
        selected: `bg-red-500 text-white border-red-500 hover:bg-red-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:border-red-300`,
      },
      suggestion: {
        selected: `bg-green-500 text-white border-green-500 hover:bg-green-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-300`,
      },
    };
    // caseType is guaranteed to be valid here
    const state = isSelected ? "selected" : "unselected";
    return `${commonClasses} ${styles[caseType][state]}`; // Removed optional chaining as caseType is validated
  };

  const getSendButtonClass = (): string => {
    const commonClasses =
      "text-white py-2 px-4 rounded-md cursor-pointer transition-colors duration-200";
    const styles: Record<CaseType, string> = {
      problem: `bg-red-600 hover:bg-red-700`,
      suggestion: `bg-green-600 hover:bg-green-700`,
    };
    // caseType is guaranteed to be valid here
    return `${commonClasses} ${styles[caseType]}`;
  };

  const toggleCategory = (categoryName: string): void => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const openHelpModal = (): void => setIsHelpModalOpen(true);
  const closeHelpModal = (): void => setIsHelpModalOpen(false);

  // ===========================================================
  // 6. JSX RETURN (Final render)
  // ===========================================================
  return (
    <>
      <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200">
        {/* Header Row */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Подаване на сигнал
            </h2>
            <p className="text-sm text-gray-500">
              Моля, попълнете формуляра по-долу
            </p>
          </div>
          <div className="flex items-center space-x-2">
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
            <button
              type="submit"
              form="case-form"
              className={getSendButtonClass()}
            >
              Изпрати
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form
          id="case-form"
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Form submitted");
          }}
        >
          {/* Left Panel */}
          <div className="rounded-2xl shadow-md bg-white p-6">
            {/* ... inputs ... */}
            <div className="space-y-4">
              <input
                placeholder="Потребителско име..."
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                name="username"
              />
              <input
                placeholder="Име и фамилия..."
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                name="fullname"
              />
              <textarea
                placeholder="Описание..."
                className="w-full h-40 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                name="description"
              />
              <button
                type="button"
                className="w-full border border-gray-300 p-3 rounded-md text-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors duration-200 text-gray-600"
              >
                📎 Прикачи файлове
              </button>
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
                    { label: "Нисък", value: "Low", color: "#009b00" },
                    { label: "Среден", value: "Medium", color: "#ad8600" },
                    { label: "Висок", value: "High", color: "#c30505" },
                  ].map(({ label, value, color }) => (
                    <label
                      key={value}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={priority === value}
                        onChange={(e) => setPriority(e.target.value)}
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
                <h3 className="font-semibold mb-3 text-gray-700">
                  Отнася се за
                </h3>
                {categoryList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => toggleCategory(category.name)}
                        className={getCategoryClass(category.name)}
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
