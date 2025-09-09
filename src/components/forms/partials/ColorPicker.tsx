// src/components/forms/partials/ColorPicker.tsx
import React, { useMemo } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  CheckIcon,
  NoSymbolIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { IPaletteColor } from "../../../db/interfaces";

interface ColorPickerProps {
  usedColors: { color: string; categoryName: string }[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
  paletteColors: IPaletteColor[];
  canManageColors: boolean;
  onOpenManager: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  usedColors,
  selectedColor,
  onSelectColor,
  paletteColors,
  canManageColors,
  onOpenManager,
}) => {
  const usedColorMap = useMemo(
    () =>
      new Map(
        usedColors.map((item) => [item.color.toUpperCase(), item.categoryName])
      ),
    [usedColors]
  );

  return (
    <div className="rounded-md border border-gray-300 bg-gray-50/50 p-2">
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Изберете цвят от палитрата:
        </label>
        {canManageColors && (
          <button
            type="button"
            onClick={onOpenManager}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            Управление
          </button>
        )}
      </div>
      <div className="grid grid-cols-10 gap-2">
        <Tooltip.Provider delayDuration={100}>
          {paletteColors.map((color) => {
            const isSelected =
              color.hexCode.toUpperCase() === selectedColor.toUpperCase();
            const usedByCategory = usedColorMap.get(
              color.hexCode.toUpperCase()
            );
            const isDisabled = !!(usedByCategory && !isSelected);
            const tooltipContent = isDisabled
              ? `Използван от: ${usedByCategory}`
              : color.label || color.hexCode;

            return (
              <Tooltip.Root key={color._id}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectColor(color.hexCode)}
                    disabled={isDisabled}
                    className={`relative flex h-8 w-full items-center justify-center rounded-md border-2 transition-transform duration-150
                      ${
                        isSelected
                          ? "scale-110 border-blue-500 shadow-lg"
                          : "border-transparent"
                      }
                      ${
                        isDisabled
                          ? "cursor-not-allowed opacity-30"
                          : "cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      }`}
                    style={{ backgroundColor: color.hexCode }}
                    aria-label={`Select color ${color.label || color.hexCode}`}
                  >
                    {isSelected && (
                      <CheckIcon className="h-5 w-5 text-white mix-blend-difference" />
                    )}
                    {isDisabled && (
                      <NoSymbolIcon className="absolute h-5 w-5 text-white mix-blend-difference" />
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
    </div>
  );
};

export default ColorPicker;
