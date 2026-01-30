// src/pages/LoadingTestPage.tsx
import React from "react";
import LoadingModal from "../components/modals/LoadingModal"; // Adjust the import path based on your project structure

const LoadingTestPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-10">
      {/* Background Content */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-3 text-3xl font-bold text-gray-800">
          Loading Modal Test Page
        </h1>
        <p className="text-gray-600">
          This page continuously displays the Loading Modal component for
          testing purposes. The modal should overlay this content.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded bg-white p-4 shadow">Content Box 1</div>
        <div className="rounded bg-white p-4 shadow">Content Box 2</div>
        <div className="rounded bg-white p-4 shadow">Content Box 3</div>
        <div className="rounded bg-white p-4 shadow">Content Box 4</div>
      </div>

      {/* --- Loading Modal --- */}
      {/* Render the modal and explicitly set isOpen to true */}
      <LoadingModal
        message="Modal is permanently open for testing..." // Optional: Customize the message
      />
    </div>
  );
};

export default LoadingTestPage;
