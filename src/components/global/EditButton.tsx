import { PencilIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const EditButton = () => {
  const { t } = useTranslation("dashboard");
  return (
    <button
      className="mhover:cursor-pointer ml-2 flex items-center px-2 py-1 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
      type="button"
      title="Редактирай"
      // onClick={...} // Add your edit logic here
    >
      <PencilIcon className="h-4 w-4 mr-1" />
      <span className="hidden md:inline-block">{t("edit")}</span>
    </button>
  );
};

export default EditButton;
