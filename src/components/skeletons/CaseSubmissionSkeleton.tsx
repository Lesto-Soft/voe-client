// src/components/skeletons/CaseSubmissionSkeleton.tsx
import React from "react";

const CaseSubmissionSkeleton: React.FC = () => {
  const categoryWidths = [
    "w-32",
    "w-28",
    "w-24",
    "w-28",
    "w-20",
    "w-36",
    "w-40",
    "w-24",
    "w-44",
    "w-32",
    "w-24",
    "w-40",
  ];

  return (
    <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 animate-pulse">
      {/* --- Header Skeleton --- */}
      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between md:items-center gap-4 -mt-2">
        {/* ---- TINKER HINT ----
         * To raise or lower the entire header, adjust the negative top margin '-mt-4' on the line above.
         * For example, '-mt-6' will raise it more, and '-mt-2' will raise it less.
         */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-gray-200 rounded-md"></div>
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-56 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-28 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-25 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* --- Spacer Skeleton --- */}
      <div className="col-span-1 md:col-span-2 h-8"></div>

      {/* --- Left Panel Skeleton --- */}
      <div className="rounded-2xl shadow-md bg-white p-6">
        {/* This top section for Username/Full Name remains in place */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-100 rounded-md"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-100 rounded-md"></div>
          </div>
        </div>

        {/* ---- TINKER HINT ----
         * This new container groups the two sections below it.
         * Adjust the margin-top class 'mt-6' to add more or less space below the username fields.
         * (e.g., mt-4, mt-8, etc.)
         */}
        <div className="mt-12 space-y-4">
          {/* Description Section */}
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-44 bg-gray-100 rounded-md"></div>
          </div>

          {/* File Attachments Section */}
          <div className="space-y-2">
            <div className="h-4 w-2/5 bg-gray-200 rounded"></div>
            <div className="h-11 bg-gray-100 rounded-md"></div>
            <div className="h-20 bg-transparent rounded-md mt-2"></div>
          </div>
        </div>
      </div>

      {/* --- Right Panel Skeleton --- */}
      <div className="rounded-2xl shadow-md bg-white p-6 space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="flex items-center gap-x-4 pt-1">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="flex flex-wrap gap-2 pt-1">
            {categoryWidths.map((width, i) => (
              <div
                key={i}
                className={`h-9 ${width} bg-gray-100 rounded-md`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseSubmissionSkeleton;
