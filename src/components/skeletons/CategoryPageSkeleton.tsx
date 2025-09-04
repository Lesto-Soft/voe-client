import React from "react";

const CategoryInfoPanelSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="h-7 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
    <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
    <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
    <div className="h-40 bg-gray-200 rounded w-full"></div>
  </div>
);

const CategoryCasesListSkeleton = () => (
  <>
    <div className="p-4 border-b border-gray-200">
      <div className="flex space-x-2 justify-between sm:space-x-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-md w-24"></div>
        ))}
        <div
          key="date-range-custom"
          className="h-8 bg-gray-200 rounded-md w-8 ml-40"
        ></div>
      </div>
    </div>
    <div className="overflow-y-auto flex-1 p-4 custom-scrollbar-xs">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="p-4 mb-3 bg-gray-50 rounded shadow">
          <div className="flex items-start space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-8 bg-gray-200 rounded w-full mt-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);

const CategoryStatisticsPanelSkeleton = () => (
  <div className="p-6 space-y-3">
    <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
    <div className="h-9 bg-gray-200 rounded w-full mb-4"></div>
    <div className="h-28 bg-gray-200 rounded w-full mb-3"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="flex justify-center mb-3">
      <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between px-2">
          <div className="flex items-center w-3/5">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200 mr-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/5"></div>
        </div>
      ))}
    </div>
  </div>
);

const CategoryPageSkeleton: React.FC = () => {
  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <CategoryInfoPanelSkeleton />
        </aside>
        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <CategoryCasesListSkeleton />
        </main>
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <CategoryStatisticsPanelSkeleton />
        </aside>
      </div>
    </div>
  );
};

export default CategoryPageSkeleton;
