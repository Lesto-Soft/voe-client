import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// Define an interface for the language options for better type safety
interface LanguageOption {
  code: string;
  label: string;
}

// --- Component Implementation ---

const LanguageSwitcher: React.FC = () => {
  // useTranslation hook provides the i18n instance
  const { i18n } = useTranslation();

  // State for managing dropdown visibility, explicitly typed as boolean
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Ref for the dropdown container, explicitly typed to refer to an HTMLDivElement
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current language, default to 'bg' if somehow undefined
  const currentLanguage: string = i18n.language || "bg";

  // --- Handlers ---
  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  // Explicitly type the 'lang' parameter as string
  const handleLanguageChange = (lang: string): void => {
    i18n.changeLanguage(lang);
    setIsOpen(false); // Close dropdown after selection
  };

  // --- Effect for Outside Click ---
  useEffect(() => {
    // Function to check if click is outside
    // Explicitly type the event as MouseEvent
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the ref is attached and if the click target is a Node and is outside the ref's current element
      // We use 'event.target as Node' for type assertion, assuming the target is a DOM Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false); // Close dropdown
      }
    };

    // Add event listener only when the dropdown is open
    if (isOpen) {
      // Use 'mousedown' event to catch the click before it might trigger something else
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Clean up the event listener when the dropdown is closed or component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove listener when component unmounts or isOpen changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Re-run effect if isOpen changes

  // --- Language Options - Use the LanguageOption interface ---
  const languageOptions: LanguageOption[] = [
    { code: "bg", label: "BG (Български)" },
    { code: "en", label: "EN (English)" },
    // Add more languages here if needed following the LanguageOption structure
  ];

  return (
    // Container with fixed positioning and z-index
    // Attach the ref here
    <div ref={dropdownRef} className="fixed top-4 left-4 z-50">
      {/* Button to trigger the dropdown */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen} // Indicate dropdown state for accessibility
      >
        {/* Display current language */}
        {currentLanguage.toUpperCase()}
        {/* Dropdown Icon (SVG remains the same) */}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu - Conditionally rendered */}
      {isOpen && (
        <div
          className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button" // For better accessibility, ensure the button above has id="language-menu-button"
        >
          <div className="py-1" role="none">
            {/* Map over the typed languageOptions array */}
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => handleLanguageChange(option.code)}
                // Apply different style if this option is the current language
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLanguage === option.code
                    ? "bg-gray-100 text-gray-900" // Style for selected language
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Style for other languages
                }`}
                role="menuitem"
                // Optionally disable the button for the current language
                // disabled={currentLanguage === option.code}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
