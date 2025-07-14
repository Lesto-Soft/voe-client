import React from "react";

const RatingMetricInfoPanelSkeleton = () => (
  <div className="p-1 space-y-4">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-5"></div>
    <div className="h-20 bg-gray-200 rounded w-full"></div>
    <hr className="my-4 border-gray-200" />
    <div className="flex items-center space-x-3">
      <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const MetricScoreListSkeleton = () => (
  <>
    <div className="p-4 border-b border-gray-200">
      <div className="flex space-x-2 justify-between sm:space-x-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-md w-24"></div>
        ))}
        <div
          key="date-range-custom"
          className="h-8 bg-gray-200 rounded-md w-8 ml-45"
        ></div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="h-12 bg-gray-100 rounded"></div>
      ))}
    </div>
  </>
);

const RatingMetricStatsPanelSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="h-7 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-5 bg-gray-200 rounded-md w-full"></div>
    <div className="h-5 bg-gray-200 rounded-md w-4/5"></div>
    <hr className="my-4 border-gray-200" />
    <div className="h-9 bg-gray-200 rounded-md w-full"></div>
    <div className="flex justify-center mt-4">
      <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const RatingMetricPageSkeleton: React.FC = () => {
  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 animate-pulse">
          <RatingMetricInfoPanelSkeleton />
        </aside>
        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <MetricScoreListSkeleton />
        </main>
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <RatingMetricStatsPanelSkeleton />
        </aside>
      </div>
    </div>
  );
};

export default RatingMetricPageSkeleton;
