import React from "react";

const TemplatesSettings: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Шаблони с настройки
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Управлявайте и прилагайте предварително дефинирани конфигурации с
            настройки за потребителите.
          </p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700">
          Създай нов шаблон
        </button>
      </div>
      <hr className="my-4 border-gray-200" />

      {/* Mockup of a table to display templates */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 font-medium text-gray-600">Име на шаблон</th>
              <th className="p-3 font-medium text-gray-600">Създаден на</th>
              <th className="p-3 font-medium text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="p-3">Нов служител - Базов достъп</td>
              <td className="p-3 text-gray-500">20.09.2025</td>
              <td className="p-3 space-x-2">
                <button className="text-blue-600 hover:underline">
                  Редактирай
                </button>
                <button className="text-red-600 hover:underline">Изтрий</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3">Мениджър на категория</td>
              <td className="p-3 text-gray-500">15.08.2025</td>
              <td className="p-3 space-x-2">
                <button className="text-blue-600 hover:underline">
                  Редактирай
                </button>
                <button className="text-red-600 hover:underline">Изтрий</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-500 italic">
        <p>
          Забележка: Прилагането на шаблони и масовата редакция се извършват от
          страницата "Управление на потребители".
        </p>
      </div>
    </div>
  );
};

export default TemplatesSettings;
