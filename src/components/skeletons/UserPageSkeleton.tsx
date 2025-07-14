import React from "react";

const UserInformationPanelSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex flex-col items-center space-y-3">
      <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    <hr className="my-4 border-gray-200" />
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
    <hr className="my-4 border-gray-200" />
    <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-24 bg-gray-200 rounded w-full"></div>
  </div>
);

const UserActivityListSkeleton = () => (
  <>
    <div className="p-4 border-b border-gray-200">
      <div className="flex space-x-2 justify-between sm:space-x-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-md w-24"></div>
        ))}
        <div
          key="partial-menu"
          className="h-8 bg-gray-200 rounded-l-md w-12"
        ></div>
        <div
          key="date-range-custom"
          className="h-8 bg-gray-200 rounded-md w-8 ml-10"
        ></div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-4 bg-gray-100 rounded">
          <div className="flex items-start space-x-3">
            <div className="h-6 w-6 bg-gray-200 rounded-md flex-shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);

const UserStatisticsPanelSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="h-7 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-200 rounded-md"></div>
      <div className="h-5 bg-gray-200 rounded-md"></div>
      <div className="h-5 bg-gray-200 rounded-md"></div>
      <div className="h-5 bg-gray-200 rounded-md"></div>
    </div>
    <div className="h-9 bg-gray-200 rounded-md w-full mt-4"></div>
    <div className="flex justify-center mt-6">
      <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const UserPageSkeleton: React.FC = () => {
  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <UserInformationPanelSkeleton />
        </aside>
        <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <UserActivityListSkeleton />
        </main>
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden animate-pulse">
          <UserStatisticsPanelSkeleton />
        </aside>
      </div>
    </div>
  );
};

export default UserPageSkeleton;
