import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ClearableInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  placeholder?: string;
}

const ClearableInput: React.FC<ClearableInputProps> = ({
  label,
  value,
  onChange,
  id,
  placeholder = "",
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder={placeholder}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            title="Изчисти"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClearableInput;
