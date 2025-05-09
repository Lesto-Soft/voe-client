// src/components/shared/TruncatedListWithDialog.tsx
import React, { useState } from "react";
import { Link } from "react-router"; // Ensure this is the correct import
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/solid"; // Using Heroicon for close

export interface ListItem {
  _id: string;
  name: string;
}

interface TruncatedListWithDialogProps<T extends ListItem> {
  items: T[];
  itemTypeLabel: string; // e.g., "Expert", "Manager"
  itemTypeLabelPlural?: string; // Optional: override plural (e.g., "Experts")
  parentContextName?: string; // e.g., Category name for dialog title
  baseLinkPath: string; // e.g., "/user-data/"
  isContextInactive?: boolean; // To style tags/links differently
  // maxTagWidthClass is removed, using max-w-[50%] internally
  // maxVisibleInline is removed, logic is now fixed (3 max, 2 if truncated)
}

// Constants for visibility logic
const MAX_ITEMS_BEFORE_TRUNCATION = 4;
const ITEMS_TO_SHOW_WHEN_TRUNCATED = 2;

// Basic Tailwind classes for Radix Dialog (customize as needed)
const overlayClass =
  "fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow";
const contentClass =
  "fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-contentShow focus:outline-none border border-gray-300";
const titleClass = "text-lg font-semibold text-gray-800 mb-2";
const descriptionClass = "mb-5 text-sm text-gray-600";
const closeButtonClass =
  "absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-colors";
const listContainerClass =
  "space-y-2.5 max-h-[60vh] overflow-y-auto pr-3 -mr-1";

// --- Helper Function ---
function getPlural(count: number, singular: string, plural?: string): string {
  const effectivePlural = plural ?? `${singular}s`; // Basic English pluralization default
  return count === 1 ? singular : effectivePlural;
}

function TruncatedListWithDialog<T extends ListItem>({
  items,
  itemTypeLabel,
  itemTypeLabelPlural,
  parentContextName,
  baseLinkPath,
  isContextInactive = false,
}: TruncatedListWithDialogProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalItems = items.length;
  // Determine if truncation is needed based on the rule (more than 3 items)
  const needsTruncation = totalItems > MAX_ITEMS_BEFORE_TRUNCATION;

  // Determine which items to display inline based on the truncation state
  const itemsToDisplayInline = needsTruncation
    ? items.slice(0, ITEMS_TO_SHOW_WHEN_TRUNCATED) // Show first 2 if truncated
    : items.slice(0, MAX_ITEMS_BEFORE_TRUNCATION); // Show up to 3 otherwise

  const effectivePluralLabel = getPlural(
    totalItems,
    itemTypeLabel,
    itemTypeLabelPlural
  );

  const dialogTitle = parentContextName
    ? `All ${effectivePluralLabel} for ${parentContextName}`
    : `All ${effectivePluralLabel}`;

  // --- Render Helper for Item Tag ---
  const renderItemTag = (item: T, isInline: boolean) => {
    // Apply max-w-[50%] and ensure it doesn't break layout
    const tagWrapperClasses = `inline-block max-w-[45%] align-top`; // Use align-top with inline-block

    const tagClasses = `
      block px-2 py-0.5 rounded-md font-medium w-full  // Make span take full width of wrapper
      transition-colors duration-150 ease-in-out text-left truncate
      ${
        isContextInactive
          ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
          : `bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200 ${
              isInline ? "hover:cursor-pointer" : ""
            }`
      }
    `;

    const linkContent = (
      <span className={tagClasses} title={item.name}>
        {item.name}
      </span>
    );

    const key = isInline ? item._id : `dialog-${item._id}`;

    if (isContextInactive || !isInline) {
      // Render non-interactive wrapper if inactive or inside the dialog
      return (
        <div key={key} className={isInline ? tagWrapperClasses : undefined}>
          {linkContent}
        </div>
      );
    } else {
      // Render as Link if active and inline
      return (
        <div key={key} className={tagWrapperClasses}>
          {" "}
          {/* Wrapper div for width control */}
          <Link
            to={`${baseLinkPath}${item._id}`}
            // IMPORTANT: Prevent the click on the link itself from triggering the dialog via the parent div
            onClick={(e) => e.stopPropagation()}
            className="block w-full" // Link takes full width of wrapper
          >
            {linkContent}
          </Link>
        </div>
      );
    }
  };

  // --- Main Render ---

  if (totalItems === 0) {
    // Using Bulgarian directly as per original CategoryTable example
    const itemLabelLower = itemTypeLabel.toLowerCase();
    const noItemsText =
      itemLabelLower === "expert"
        ? "експерти"
        : itemLabelLower === "manager"
        ? "мениджъри"
        : itemTypeLabelPlural || `${itemLabelLower}s`; // Fallback
    return <span className="text-sm text-gray-500">Няма {noItemsText}</span>;
  }

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/*
        Conditionally wrap with Dialog.Trigger ONLY if truncation is needed.
        If not truncated, the component is just a list of tags, not clickable to open a dialog.
      */}
      {needsTruncation ? (
        <Dialog.Trigger asChild>
          {/* This outer div becomes the clickable trigger area when truncated */}
          <div
            className={`relative ${
              isContextInactive ? "cursor-default" : "cursor-pointer"
            }`}
            // No onClick needed here when using asChild, Radix handles it.
            // Add title to indicate clickability
            title={`View all ${totalItems} ${effectivePluralLabel}`}
            aria-label={`View all ${totalItems} ${effectivePluralLabel}`}
          >
            {/* Flex container for the inline tags */}
            <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
              {" "}
              {/* Use items-start for align-top */}
              {itemsToDisplayInline.map((item) => renderItemTag(item, true))}
            </div>
            {/* "View All" text appears below the tags when truncated */}
            <div
              className={`mt-1 text-sm font-medium text-purple-600 ${
                isContextInactive
                  ? "opacity-75"
                  : "hover:text-purple-800 group-hover:underline"
              }`} // Use group-hover if needed
            >
              View all {totalItems}...
            </div>
          </div>
        </Dialog.Trigger>
      ) : (
        // Render only the tags without a trigger wrapper if not truncated
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          {itemsToDisplayInline.map((item) => renderItemTag(item, true))}
        </div>
      )}

      {/* Dialog Portal remains the same */}
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content className={contentClass}>
          <Dialog.Title className={titleClass}>{dialogTitle}</Dialog.Title>
          <Dialog.Description className={descriptionClass}>
            Click on a name to view details.
          </Dialog.Description>
          <div className={listContainerClass}>
            {items.map((item) => (
              <Link
                key={`dialog-${item._id}`}
                to={`${baseLinkPath}${item._id}`}
                onClick={(e) => {
                  if (isContextInactive) {
                    e.preventDefault();
                  } else {
                    setIsDialogOpen(false); // Close dialog on click
                  }
                }}
                className={`block text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded px-2 py-1 text-sm transition-colors ${
                  isContextInactive
                    ? "opacity-60 text-gray-600 pointer-events-none cursor-not-allowed hover:bg-transparent"
                    : "hover:underline"
                }`}
                aria-disabled={isContextInactive}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <Dialog.Close asChild>
            <button className={closeButtonClass} aria-label="Close">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default TruncatedListWithDialog;
