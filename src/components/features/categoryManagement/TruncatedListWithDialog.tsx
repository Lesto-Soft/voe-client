// src/components/shared/TruncatedListWithDialog.tsx
import { useState } from "react";
// Removed: import { Link } from "react-router"; // Original Link
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Import UserLink (ensure path is correct)
import UserLink from "../../global/UserLink";
import { IUser } from "../../../db/interfaces"; // Assuming IUser is available

// ListItem should ideally be IUser or compatible for passing to UserLink
export interface ListItem extends Pick<IUser, "_id" | "name"> {
  // Allow other IUser props if needed, or make T directly IUser
  [key: string]: any;
}

interface TruncatedListWithDialogProps {
  items: IUser[];
  itemTypeLabel: string;
  itemTypeLabelPlural?: string;
  parentContextName?: string;
  baseLinkPath: string; // Not directly used by UserLink if its path is fixed
  isContextInactive?: boolean;
}

const MAX_ITEMS_BEFORE_TRUNCATION = 4;
const ITEMS_TO_SHOW_WHEN_TRUNCATED = 2;

const overlayClass =
  "fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow";
const contentClass =
  "fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-contentShow focus:outline-none border border-gray-300";
const titleClass = "text-lg font-semibold text-gray-800 mb-2";
const closeButtonClass =
  "absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-colors";
const listContainerClass =
  "space-y-2.5 space-x-1.5 max-h-[60vh] overflow-y-auto pr-3 mr-1";

function getPlural(count: number, singular: string, plural?: string): string {
  const effectivePlural = plural ?? `${singular}и`;
  return count === 1 ? singular : effectivePlural;
}

function TruncatedListWithDialog({
  items,
  itemTypeLabel,
  itemTypeLabelPlural,
  parentContextName,
  // baseLinkPath,
  isContextInactive = false,
}: TruncatedListWithDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalItems = items.length;
  const needsTruncation = totalItems > MAX_ITEMS_BEFORE_TRUNCATION;
  const itemsToDisplayInline = needsTruncation
    ? items.slice(0, ITEMS_TO_SHOW_WHEN_TRUNCATED)
    : items.slice(0, MAX_ITEMS_BEFORE_TRUNCATION);

  const effectivePluralLabel = getPlural(
    totalItems,
    itemTypeLabel,
    itemTypeLabelPlural
  );
  const dialogTitle = parentContextName
    ? `Всички ${effectivePluralLabel} за ${parentContextName}`
    : `Всички ${effectivePluralLabel}`;

  const renderItemTag = (item: IUser, isInline: boolean) => {
    const userItem = item;
    const key = isInline ? item._id : `dialog-${item._id}`;
    const tagWrapperClasses = `inline-block max-w-[45%] align-top`; // Keep this for width control

    // Original styling for the content SPAN, some parts may be overridden by UserLink's fixed styles
    // const originalTagSpanClasses = `
    //   block px-2 py-0.5 rounded-md font-medium w-full
    //   transition-colors duration-150 ease-in-out text-left truncate
    // `;

    if (isContextInactive) {
      // For inactive context, UserLink will still render with its active (purple) style.
      // The original grayed-out style from 'tagClasses' will be lost.
      // We render UserLink because it's a link, but it won't look "inactive" visually.
      // The parent div might have 'cursor-not-allowed' from Dialog.Trigger's wrapper.
      return (
        <div key={key} className={isInline ? tagWrapperClasses : undefined}>
          {/*
            LIMITATION: UserLink will appear active (purple) even if isContextInactive is true.
            No onClick prop means we can't easily make it non-interactive here without more complex wrappers.
          */}
          <UserLink user={userItem} />
        </div>
      );
    }

    // Active context
    if (isInline) {
      return (
        <div key={key} className={tagWrapperClasses}>
          {/*
            LIMITATION with verbatim UserLink:
            1. No e.stopPropagation(): Clicking UserLink will navigate AND may trigger the dialog.
            2. Styling is fixed by UserLink.
          */}
          <UserLink user={userItem} />
        </div>
      );
    } else {
      // This case was for non-interactive items inside renderItemTag (e.g., when !isInline in original code)
      // If these are also meant to be links now via UserLink:
      return (
        <div key={key}>
          <UserLink user={userItem} />
        </div>
      );
    }
  };

  if (totalItems === 0) {
    const itemLabelLower = itemTypeLabel.toLowerCase();
    const noItemsText =
      itemLabelLower === "expert"
        ? "експерти"
        : itemLabelLower === "manager"
        ? "мениджъри"
        : itemTypeLabelPlural || `${itemLabelLower}и`;
    return <span className="text-sm text-gray-500">Няма {noItemsText}</span>;
  }

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {needsTruncation ? (
        <Dialog.Trigger asChild>
          <div
            className={`relative ${
              isContextInactive ? "cursor-default" : "cursor-pointer"
            }`}
            title={`Вижте всички ${totalItems} ${effectivePluralLabel}`}
            aria-label={`Вижте всички ${totalItems} ${effectivePluralLabel}`}
          >
            <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
              {itemsToDisplayInline.map((item) => renderItemTag(item, true))}
            </div>
            <div
              className={`mt-1 ml-1 text-sm font-normal ${
                isContextInactive
                  ? "opacity-75 text-gray-600"
                  : "text-purple-600 hover:text-purple-800 group-hover:underline"
              }`}
            >
              Вижте всички {totalItems}...
            </div>
          </div>
        </Dialog.Trigger>
      ) : (
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          {itemsToDisplayInline.map((item) => renderItemTag(item, true))}
        </div>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content className={contentClass}>
          <Dialog.Title className={titleClass}>{dialogTitle}</Dialog.Title>
          {/* <Dialog.Description className={descriptionClass}>
            Click on a name to view details.
          </Dialog.Description> */}
          <div className={listContainerClass}>
            {items.map((item) => {
              const userItem = item;
              // LIMITATION: UserLink doesn't take onClick. Dialog won't close on item click.
              // Also, isContextInactive style (grayed out, pointer-events-none) on link is lost.
              // UserLink will navigate but dialog remains open.
              return (
                <UserLink
                  key={`dialog-${userItem._id}`}
                  user={userItem}
                  // Or "case" if more appropriate for list view
                />
              );
            })}
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
