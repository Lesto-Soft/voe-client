import { diffWords } from "diff";
export const getDifferences = (oldText: string, newText: string) => {
  const diff = diffWords(oldText, newText);
  const significantThreshold = Math.min(oldText.length, newText.length) * 0.5; // 50% difference threshold

  // Check if the differences are too significant
  const totalRemoved = diff
    .filter((part) => part.removed)
    .reduce((sum, part) => sum + part.value.length, 0);
  const totalAdded = diff
    .filter((part) => part.added)
    .reduce((sum, part) => sum + part.value.length, 0);

  if (
    totalRemoved > significantThreshold ||
    totalAdded > significantThreshold
  ) {
    return (
      <>
        <span className="text-btnRedHover line-through block">{oldText}</span>
        <span className="text-btnGreenHover font-bold block">{newText}</span>
      </>
    );
  }

  // Handle regular differences
  return diff.map((part, index) => {
    const className = part.added
      ? "text-btnGreenHover font-bold" // Highlight added parts in green
      : part.removed
      ? "text-btnRedHover line-through" // Cross out removed parts
      : "text-gray-700"; // Unchanged parts

    return (
      <span key={index} className={className}>
        {part.value}
      </span>
    );
  });
};
