import React from "react";
import { CheckIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
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
  const usedColorMap = new Map(
    usedColors.map((item) => [item.color, item.categoryName])
  );

  return (
    <div className="grid grid-cols-10 gap-2 p-2 border border-gray-300 rounded-md bg-gray-50/50">
      <Tooltip.Provider delayDuration={100}>
        {PREDEFINED_CATEGORY_COLORS.map((color) => {
          const isSelected = color === selectedColor;
          const usedByCategory = usedColorMap.get(color);
          // add `!!` to ensure a strict boolean
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
  );
};

export default ColorPicker;
