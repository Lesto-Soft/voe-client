// src/utils/contentDifferences.tsx
import React from "react";
import { diffWords } from "diff";
import { stripHtmlTags, isHtmlContent } from "./contentRenderer";

/**
 * Enhanced getDifferences function that handles both plain text and HTML content
 * Strips HTML tags for clean comparison while preserving meaningful formatting
 */
export const getDifferences = (oldText: string, newText: string) => {
  // Convert HTML content to plain text for comparison
  const oldPlainText = isHtmlContent(oldText)
    ? stripHtmlTags(oldText)
    : oldText;
  const newPlainText = isHtmlContent(newText)
    ? stripHtmlTags(newText)
    : newText;

  const diff = diffWords(oldPlainText, newPlainText);
  const significantThreshold =
    Math.min(oldPlainText.length, newPlainText.length) * 0.5; // 50% difference threshold

  // Check if the differences are too significant
  const totalRemoved = diff
    .filter((part) => part.removed)
    .reduce((sum, part) => sum + part.value.length, 0);
  const totalAdded = diff
    .filter((part) => part.added)
    .reduce((sum, part) => sum + part.value.length, 0);

  // If changes are too significant, show side-by-side comparison
  if (
    totalRemoved > significantThreshold ||
    totalAdded > significantThreshold
  ) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500 font-medium">
          Промяна на съдържанието:
        </div>
        <div className="bg-red-50 border-l-4 border-red-300 p-2 rounded">
          <div className="text-xs text-red-600 font-medium mb-1">Преди:</div>
          <div className="text-sm text-red-700 line-through">
            {oldPlainText.length > 100
              ? `${oldPlainText.substring(0, 100)}...`
              : oldPlainText}
          </div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-300 p-2 rounded">
          <div className="text-xs text-green-600 font-medium mb-1">След:</div>
          <div className="text-sm text-green-700 font-medium">
            {newPlainText.length > 100
              ? `${newPlainText.substring(0, 100)}...`
              : newPlainText}
          </div>
        </div>
      </div>
    );
  }

  // Handle regular differences with inline highlighting
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500 font-medium">
        Промени във форматирането:
      </div>
      <div className="text-sm">
        {diff.map((part, index) => {
          const className = part.added
            ? "bg-green-100 text-green-800 px-1 rounded font-medium" // Highlight added parts
            : part.removed
            ? "bg-red-100 text-red-800 px-1 rounded line-through" // Cross out removed parts
            : "text-gray-700"; // Unchanged parts

          return (
            <span key={index} className={className}>
              {part.value}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Simplified differences for smaller UI components
 * Shows a compact summary of changes
 */
export const getSimplifiedDifferences = (oldText: string, newText: string) => {
  const oldPlainText = isHtmlContent(oldText)
    ? stripHtmlTags(oldText)
    : oldText;
  const newPlainText = isHtmlContent(newText)
    ? stripHtmlTags(newText)
    : newText;

  if (oldPlainText === newPlainText) {
    return (
      <span className="text-gray-500 text-xs italic">
        Няма промени в съдържанието
      </span>
    );
  }

  const oldLength = oldPlainText.length;
  const newLength = newPlainText.length;
  const lengthDiff = newLength - oldLength;

  return (
    <div className="text-xs text-gray-600">
      <span className="font-medium">Съдържанието е променено</span>
      {lengthDiff !== 0 && (
        <span
          className={`ml-2 ${
            lengthDiff > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ({lengthDiff > 0 ? "+" : ""}
          {lengthDiff} символа)
        </span>
      )}
    </div>
  );
};

/**
 * Get a preview of what changed for history summaries
 */
export const getChangePreview = (oldText: string, newText: string): string => {
  const oldPlainText = isHtmlContent(oldText)
    ? stripHtmlTags(oldText)
    : oldText;
  const newPlainText = isHtmlContent(newText)
    ? stripHtmlTags(newText)
    : newText;

  if (oldPlainText === newPlainText) return "Няма промени";

  const maxLength = 50;
  const preview =
    newPlainText.length > maxLength
      ? `${newPlainText.substring(0, maxLength)}...`
      : newPlainText;

  return `Променено на: "${preview}"`;
};
