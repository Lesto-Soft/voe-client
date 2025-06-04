// src/pages/Category.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useGetCategoryByName } from "../graphql/hooks/category"; // Adjust path
// import { ICategory } from "../db/interfaces"; // Adjust path

// Hooks
import useCategorySignalStats from "../hooks/useCategorySignalStats"; // Adjust path
import useCategoryScrollPersistence from "../hooks/useCategoryScrollPersistence"; // Adjust path

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay"; // Adjust path
import CategoryHeader from "../components/features/categoryAnalytics/CategoryHeader"; // Adjust path
import PersonnelInfoPanel from "../components/features/categoryAnalytics/PersonnelInfoPanel"; // Adjust path
import CategoryCasesList from "../components/features/categoryAnalytics/CategoryCasesList"; // Adjust path
import CategoryStatisticsPanel from "../components/features/categoryAnalytics/CategoryStatisticsPanel"; // Adjust path

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();

  const {
    loading: categoryLoading,
    error: categoryError,
    category,
  } = useGetCategoryByName(categoryNameFromParams);

  // Determine if data is ready for display and scroll restoration
  const isDataReady = !categoryLoading && !categoryError && !!category;

  const { visibleCasesCount, scrollableCasesListRef, handleLoadMoreCases } =
    useCategoryScrollPersistence(categoryNameFromParams, isDataReady);

  const signalStats = useCategorySignalStats(category);

  const [activeStatsView, setActiveStatsView] = useState<
    "status" | "type" | "resolution"
  >("status");
  const [activePersonnelTab, setActivePersonnelTab] = useState<
    "experts" | "managers"
  >("managers");
  const [activeInfoTab, setActiveInfoTab] = useState<"suggestion" | "problem">(
    "suggestion"
  );

  // Reset tab states when category changes to provide a fresh view
  useEffect(() => {
    setActiveStatsView("status");
    setActivePersonnelTab("managers");
    setActiveInfoTab("suggestion");
  }, [categoryNameFromParams]);

  // Get server base URL for images
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // Original error logging effect (optional, as PageStatusDisplay also shows errors)
  useEffect(() => {
    if (!categoryLoading && categoryNameFromParams && categoryError) {
      console.error(
        "CategoryPage - Error from useGetCategoryByName hook:",
        categoryError
      );
    }
  }, [categoryLoading, categoryNameFromParams, categoryError]);

  // ---- Page Status Handling ----
  if (categoryLoading && !category) {
    // Initial load scenario
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на данните за категорията..."
      />
    );
  }

  if (categoryError) {
    return (
      <PageStatusDisplay
        error={{ message: categoryError.message }}
        message={`Грешка при зареждане на категория '${
          categoryNameFromParams || ""
        }'.`}
      />
    );
  }

  if (!category) {
    return (
      <PageStatusDisplay
        notFound
        categoryName={categoryNameFromParams}
        message={`Категорията '${
          categoryNameFromParams || "не е посочено име"
        }' не можа да бъде намерена или нямате достъп.`}
      />
    );
  }

  // ---- Main Content Rendering ----
  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <CategoryHeader
        isArchived={category.archived}
        categoryName={category.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <PersonnelInfoPanel
          category={category}
          activePersonnelTab={activePersonnelTab}
          setActivePersonnelTab={setActivePersonnelTab}
          activeInfoTab={activeInfoTab}
          setActiveInfoTab={setActiveInfoTab}
        />

        <CategoryCasesList
          allCases={category.cases}
          visibleCasesCount={visibleCasesCount}
          handleLoadMoreCases={handleLoadMoreCases}
          scrollableRef={scrollableCasesListRef}
          serverBaseUrl={serverBaseUrl}
          isLoading={categoryLoading && !!category} // Show list loading if category is present but still fetching updates
          categoryName={category.name}
        />

        <CategoryStatisticsPanel
          signalStats={signalStats}
          activeStatsView={activeStatsView}
          setActiveStatsView={setActiveStatsView}
          isLoading={categoryLoading && !!category} // Show panel loading if category is present but still fetching updates
        />
      </div>
    </div>
  );
};

// In your main router, if you referred to this component as 'Category',
// you might want to export it as such if the filename is CategoryPage.tsx
// For example: export { CategoryPage as Category };
// Or, if you renamed the file to CategoryPage.tsx, just export default CategoryPage.
// If you kept the filename as Category.tsx, then:
export default Category; // or export default Category if you rename CategoryPage to Category
