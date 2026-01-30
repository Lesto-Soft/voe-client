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
  // --- REMOVED: The heading div ---
  return (
    <div
      className="text-sm"
      style={{ whiteSpace: "pre-line", overflowWrap: "break-word" }}
    >
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
  );
};

/**
 * Shows a stacked "Before" and "After" view,
 * primarily for comparing rich text (HTML) content.
 */
const getRichTextSideBySide = (oldText: string, newText: string) => {
  // --- REMOVED: The heading div ---
  return (
    <div className="space-y-3">
      {/* "Before" State */}
      {oldText && (
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">Преди:</div>
          <div className="bg-gray-100 border border-gray-200 p-2 rounded max-h-60 overflow-y-auto mx-4">
            {renderContentSafely(oldText)}
          </div>
        </div>
      )}
      {/* "After" State */}
      <div>
        <div className="text-xs font-semibold text-gray-500 mb-1">След:</div>
        <div className="bg-green-50 border border-green-200 p-2 rounded max-h-60 overflow-y-auto mx-4">
          {renderContentSafely(newText)}
        </div>
      </div>
    </div>
  );
};

// --- The rest of the file (getDifferences, etc.) remains unchanged ---
export const getDifferences = (
  oldText: string | undefined,
  newText: string | undefined,
  mode: "auto" | "content" | "formatting" = "auto"
) => {
  // ... logic is the same
  const oldContent = oldText || "";
  const newContent = newText || "";
  if (oldContent === newContent) {
    return null; // No change, no display.
  }
  const oldPlainText = stripHtmlTags(oldContent);
  const newPlainText = stripHtmlTags(newContent);
  if (mode === "content") {
    return getInlineDifferences(oldPlainText, newPlainText);
  }
  if (mode === "formatting") {
    return getRichTextSideBySide(oldContent, newContent);
  }
  const isRichTextChange =
    isHtmlContent(oldContent) || isHtmlContent(newContent);

  if (
    isRichTextChange ||
    (oldPlainText === newPlainText && oldContent !== newContent)
  ) {
    return getRichTextSideBySide(oldContent, newContent);
  }
  return getInlineDifferences(oldPlainText, newPlainText);
};

export const getSimplifiedDifferences = (
  // ... logic is the same
  oldText: string | undefined,
  newText: string | undefined
) => {
  const oldContent = oldText || "";
  const newContent = newText || "";
  if (oldContent === newContent) {
    return null;
  }
  const oldPlainText = stripHtmlTags(oldContent);
  const newPlainText = stripHtmlTags(newContent);

  if (oldPlainText === newPlainText) {
    return (
      <div className="text-xs text-gray-600">
        <span className="font-bold underline">
          Променено форматиране на съдържанието
        </span>
      </div>
    );
  }

  const oldLength = oldPlainText.length;
  const newLength = newPlainText.length;
  const lengthDiff = newLength - oldLength;
  return (
    <div className="text-xs text-gray-600">
      <span className="font-bold underline">Съдържанието е променено</span>
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
