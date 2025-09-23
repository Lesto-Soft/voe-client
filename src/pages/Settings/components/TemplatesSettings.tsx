import React, { useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/solid";
import { IndividualUserSettingsModal } from "../../../components/modals/IndividualUserSettingsModal"; // We will adapt this for templates
import { IUser } from "../../../db/interfaces";

// Mock data for existing templates
const mockTemplates = [
  { id: "t1", name: "Нов служител - Базов достъп", lastUpdated: "20.09.2025" },
  { id: "t2", name: "Мениджър на категория", lastUpdated: "15.08.2025" },
  { id: "t3", name: "Финансов Отговорник", lastUpdated: "01.07.2025" },
];

const TemplatesSettings: React.FC = () => {
  // State to control the modal for creating or editing a template
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  // State to hold the template being edited, or null if creating a new one
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreateNew = () => {
    setEditingTemplate(null); // Ensure we're in "create" mode
    setIsTemplateModalOpen(true);
  };

  const handleEdit = (template: { id: string; name: string }) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Шаблони с настройки
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Управлявайте и прилагайте предварително дефинирани конфигурации.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700"
        >
          Създай нов шаблон
        </button>
      </div>
      <hr className="my-4 border-gray-200" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 font-medium text-gray-600">Име на шаблон</th>
              <th className="p-3 font-medium text-gray-600">
                Последна промяна
              </th>
              <th className="p-3 font-medium text-gray-600 text-right">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">
                  {template.name}
                </td>
                <td className="p-3 text-gray-500">{template.lastUpdated}</td>
                <td className="p-3 space-x-2 text-right">
                  <button
                    onClick={() =>
                      alert("Functionality to apply template to users.")
                    }
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Приложи шаблон"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Редактирай"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Изтрий"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The same modal is used for both Creating and Editing */}
      {isTemplateModalOpen && (
        <IndividualUserSettingsModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          // When editing, pass mock user data; for creating, it could be a blank user object
          user={
            editingTemplate
              ? ({
                  name: editingTemplate.name,
                  username: "template-edit",
                } as IUser)
              : ({ name: "Нов шаблон", username: "new-template" } as IUser)
          }
          isTemplateMode={true} // A new prop to change the modal's behavior and title
        />
      )}
    </div>
  );
};

export default TemplatesSettings;
