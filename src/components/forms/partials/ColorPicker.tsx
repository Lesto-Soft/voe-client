// src/components/forms/partials/ColorPicker.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  CheckIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { PREDEFINED_CATEGORY_COLORS } from "../../../utils/colors";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ColorPickerProps {
  usedColors: { color: string; categoryName: string }[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  usedColors,
  selectedColor,
  onSelectColor,
}) => {
  const [customColor, setCustomColor] = useState(selectedColor);

  useEffect(() => {
    // Sync local state if the parent component's state changes
    setCustomColor(selectedColor);
  }, [selectedColor]);

  const usedColorMap = useMemo(
    () =>
      new Map(
        usedColors.map((item) => [item.color.toUpperCase(), item.categoryName])
      ),
    [usedColors]
  );

  const duplicateWarning = useMemo(() => {
    const customUpper = customColor.toUpperCase();
    const isPredefined = PREDEFINED_CATEGORY_COLORS.some(
      (c) => c.toUpperCase() === customUpper
    );
    if (!isPredefined && usedColorMap.has(customUpper)) {
      return `Внимание: Този цвят се използва от "${usedColorMap.get(
        customUpper
      )}".`;
    }
    return null;
  }, [customColor, usedColorMap]);

  const handleCustomColorChange = (colorValue: string) => {
    const formattedColor = colorValue.toUpperCase();
    setCustomColor(formattedColor);
    onSelectColor(formattedColor);
  };

  return (
    <div className="p-2 border border-gray-300 rounded-md bg-gray-50/50">
      <div className="grid grid-cols-10 gap-2">
        <Tooltip.Provider delayDuration={100}>
          {PREDEFINED_CATEGORY_COLORS.map((color) => {
            const isSelected =
              color.toUpperCase() === selectedColor.toUpperCase();
            const usedByCategory = usedColorMap.get(color.toUpperCase());
            const isDisabled = !!(usedByCategory && !isSelected);
            const tooltipContent = isDisabled
              ? `Използван от: ${usedByCategory}`
              : color;

            return (
              <Tooltip.Root key={color}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectColor(color)}
                    disabled={isDisabled}
                    className={`relative w-full h-8 rounded-md border-2 transition-transform duration-150 flex items-center justify-center
                      ${
                        isSelected
                          ? "border-blue-500 scale-110 shadow-lg"
                          : "border-transparent"
                      }
                      ${
                        isDisabled
                          ? "opacity-30 cursor-not-allowed"
                          : "cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                      }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  >
                    {isSelected && (
                      <CheckIcon className="h-5 w-5 text-white mix-blend-difference" />
                    )}
                    {isDisabled && (
                      <NoSymbolIcon className="h-5 w-5 text-white mix-blend-difference absolute" />
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={5}
                    className="z-50 max-w-xs rounded-md bg-gray-800 px-2 py-1 text-sm text-white shadow-lg"
                  >
                    {tooltipContent}
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </Tooltip.Provider>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          или изберете персонализиран цвят:
        </label>
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-16">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="absolute top-0 left-0 w-full h-full p-0 border-none rounded-md cursor-pointer"
              title="Open color picker"
            />
          </div>
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            placeholder="#RRGGBB"
            maxLength={7}
            className="w-full max-w-xs rounded-md border border-gray-300 p-2 font-mono text-sm shadow-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        {duplicateWarning && (
          <div className="mt-2 flex items-center text-xs text-yellow-700">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>{duplicateWarning}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
