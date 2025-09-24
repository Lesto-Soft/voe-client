import React, { useState, useRef, useEffect } from "react";
import { PanelLayout, layoutOptions } from "../../types/layoutTypes";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

interface PanelLayoutSelectorProps {
  currentLayout: PanelLayout;
  onLayoutChange: (layout: PanelLayout) => void;
}

const PanelLayoutSelector: React.FC<PanelLayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption =
    layoutOptions.find((opt) => opt.key === currentLayout) || layoutOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (layout: PanelLayout) => {
    onLayoutChange(layout);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer inline-flex w-full justify-center items-center rounded-b-md bg-white px-1 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <activeOption.icon
            className="h-4 w-4 text-gray-500"
            title={activeOption.label}
          />
          {isOpen ? (
            <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          // MODIFIED: Added animation class
          className="absolute top-0 left-full ml-2 mt-1 z-10 w-auto origin-top-left rounded-md bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none animate-slideRightAndFadeIn"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-1 flex items-center space-x-1" role="none">
            {layoutOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSelect(option.key)}
                title={option.label}
                className={`${
                  currentLayout === option.key
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700"
                } group flex items-center justify-center rounded-md p-2 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer`}
                role="menuitem"
              >
                <option.icon className="h-5 w-5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelLayoutSelector;
