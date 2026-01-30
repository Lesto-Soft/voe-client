import React, { useState, useRef, useEffect } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

interface ActionMenuProps {
  children: React.ReactNode;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is outside the menuRef (the popover)...
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // ...close the popover.
        setIsOpen(false);
      }
    };

    // Add event listener when the menu is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 active:ring-2 active:ring-offset-1 active:ring-blue-400 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open options menu"
        title="Редакция/Изтриване"
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {/* Use CSS to hide/show instead of conditional rendering. This keeps children mounted. */}
      <div
        className={`absolute top-full right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 z-30 ${
          isOpen ? "block" : "hidden"
        }`}
        role="menu"
      >
        {/* This wrapper now safely closes the popover when an action is clicked, without unmounting the modal. */}
        <div className="flex flex-col p-1" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ActionMenu;
