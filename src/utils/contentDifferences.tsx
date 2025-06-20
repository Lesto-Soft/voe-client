import React from "react";
import { diffWords } from "diff";
import {
  stripHtmlTags,
  isHtmlContent,
  renderContentSafely,
} from "./contentRenderer";

/**
 * Renders an inline, word-by-word diff for PLAIN TEXT content.
 */
const getInlineDifferences = (oldText: string, newText: string) => {
  const diff = diffWords(oldText, newText);
  return (
    <div className="space-y-1">
      <div className="text-md text-gray-500 font-medium">Съдържание:</div>
      <div className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
        {diff.map((part, index) => {
          const className = part.added
            ? "bg-green-100 text-green-800 px-1 rounded font-medium"
            : part.removed
            ? "bg-red-100 text-red-800 px-1 rounded line-through"
            : "text-gray-700";

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
 * Shows a stacked "Before" and "After" view,
 * primarily for comparing rich text (HTML) content.
 */
const getRichTextSideBySide = (oldText: string, newText: string) => {
  return (
    <div className="space-y-3">
      <div className="text-md text-gray-500 font-medium">Съдържание:</div>
      {/* "Before" State */}
      {oldText && (
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">Преди:</div>
          <div className="bg-gray-100 border border-gray-200 p-2 rounded max-h-60 overflow-y-auto">
            {renderContentSafely(oldText)}
          </div>
        </div>
      )}
      {/* "After" State */}
      <div>
        <div className="text-xs font-semibold text-gray-500 mb-1">След:</div>
        <div className="bg-green-50 border border-green-200 p-2 rounded max-h-60 overflow-y-auto">
          {renderContentSafely(newText)}
        </div>
      </div>
    </div>
  );
};

/**
 * Main function to get content differences.
 * It decides which visualization to use (inline vs. side-by-side) based on content type.
 */
export const getDifferences = (
  oldText: string | undefined,
  newText: string | undefined
) => {
  const oldContent = oldText || "";
  const newContent = newText || "";

  if (oldContent === newContent) {
    return null; // No change, no display.
  }

  const oldPlainText = stripHtmlTags(oldContent);
  const newPlainText = stripHtmlTags(newContent);
  const isRichTextChange =
    isHtmlContent(oldContent) || isHtmlContent(newContent);

  // Use the rich text side-by-side view if:
  // 1. Either the old or new content is HTML.
  // 2. Or the plain text is identical but the raw content is not (i.e., a formatting-only change).
  if (
    isRichTextChange ||
    (oldPlainText === newPlainText && oldContent !== newContent)
  ) {
    return getRichTextSideBySide(oldContent, newContent);
  }

  // Fallback to inline diff for plain text changes.
  return getInlineDifferences(oldPlainText, newPlainText);
};

/**
 * Simplified differences for smaller UI components
 * Shows a compact summary of changes, now smarter about formatting.
 */
export const getSimplifiedDifferences = (
  oldText: string | undefined,
  newText: string | undefined
) => {
  const oldContent = oldText || "";
  const newContent = newText || "";

  if (oldContent === newContent) {
    return null; // No changes
  }

  const oldPlainText = stripHtmlTags(oldContent);
  const newPlainText = stripHtmlTags(newContent);

  if (oldPlainText === newPlainText && oldContent !== newContent) {
    return (
      <div className="text-xs text-gray-600">
        <span className="font-medium">
          Променено форматиране на съдържанието
        </span>
      </div>
    );
  }

  if (oldPlainText !== newPlainText) {
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
  }

  return null; // Should not be reached, but as a fallback.
};

/**
 * Get a preview of what changed for history summaries
 */
export const getChangePreview = (
  oldText: string | undefined,
  newText: string | undefined
): string => {
  const oldContent = oldText || "";
  const newContent = newText || "";

  const oldPlainText = isHtmlContent(oldContent)
    ? stripHtmlTags(oldContent)
    : oldContent;
  const newPlainText = isHtmlContent(newContent)
    ? stripHtmlTags(newContent)
    : newContent;

  if (oldPlainText === newPlainText) return "Няма промени";

  const maxLength = 50;
  const preview =
    newPlainText.length > maxLength
      ? `${newPlainText.substring(0, maxLength)}...`
      : newPlainText;

  return `Променено на: "${preview}"`;
};
