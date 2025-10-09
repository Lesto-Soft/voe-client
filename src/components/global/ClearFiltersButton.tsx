import { XMarkIcon } from "@heroicons/react/24/outline";
interface ClearFiltersButtonProps {
  isActive: boolean;
  onClear: () => void;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({
  isActive,
  onClear,
}) => {
  return (
    <button
      type="button"
      onClick={onClear}
      disabled={!isActive}
      className={`w-full sm:w-auto flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-red-500 text-white hover:bg-red-600 ${
        !isActive ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"
      }`}
      title="Изчисти всички филтри"
    >
      <XMarkIcon className="h-5 w-5 mr-1" />
      Изчисти
    </button>
  );
};

export default ClearFiltersButton;
