import { useState } from "react";
import { Link } from "react-router";

const categories = [
  "БЕЗОПАСНОСТ",
  "ОКОЛНА СРЕДА",
  "ДОКУМЕНТИ",
  "СОФТУЕРНИ ПРОДУКТИ",
  "ДОСТАВКИ",
  "ОРГАНИЗАЦИЯ",
  "КАЧЕСТВО НА МАТЕРИАЛИ",
  "КАЧЕСТВО НА РАБОТА",
  "МАШИНИ И ИНСТРУМЕНТИ",
  "КАПАЦИТЕТ",
  "ТЕХНОЛОГИЯ",
  "МАТЕРИАЛИ",
  "РАБОТА В ЕКИП",
  "КВАЛИФИКАЦИЯ",
  "РАЗХОДИ",
  "ДРУГО",
];

const CaseSubmittion = () => {
  const [priority, setPriority] = useState("Low");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Title and subtitle on the left */}
        <div>
          <h2 className="text-xl font-semibold">Подаване на сигнал</h2>
          <p className="text-sm text-gray-500">
            Моля, попълнете формуляра по-долу
          </p>
        </div>

        {/* Buttons on the right */}
        <div className="flex items-center space-x-2">
          <button className="bg-transparent text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-200">
            ❓ Помощ
          </button>

          <Link to="/">
            <button className="bg-transparent text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-200">
              ← Назад
            </button>
          </Link>
          <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
            Изпрати
          </button>
        </div>
      </div>

      <div className="rounded-2xl shadow-md bg-white">
        <div className="space-y-4 p-6">
          <input
            placeholder="Потребителско име..."
            className="w-full border border-gray-300 p-3 rounded-md"
            required
          />
          <input
            placeholder="Име и фамилия..."
            className="w-full border border-gray-300 p-3 rounded-md"
            required
          />
          <textarea
            placeholder="Описание..."
            className="w-full h-40 border border-gray-300 p-3 rounded-md"
            required
          />
          <button className="w-full border border-gray-300 p-3 rounded-md text-center bg-gray-100">
            📎 Прикачи файлове
          </button>
        </div>
      </div>

      <div className="rounded-2xl shadow-md bg-white">
        <div className="space-y-4 p-6">
          <div>
            <h3 className="font-semibold mb-2">Приоритет</h3>
            <div className="flex gap-4">
              {[
                { label: "Нисък", value: "Low" },
                { label: "Среден", value: "Medium" },
                { label: "Висок", value: "High" },
              ].map(({ label, value }) => (
                <label key={value} className="flex items-center gap-1">
                  <input
                    type="radio"
                    value={value}
                    checked={priority === value}
                    onChange={() => setPriority(value)}
                    className={`accent-${
                      value === "Low"
                        ? "green"
                        : value === "Medium"
                        ? "yellow"
                        : "red"
                    }-500`}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Отнася се за</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((categ) => (
                <button
                  key={categ}
                  type="button"
                  onClick={() => toggleCategory(categ)}
                  className={`px-3 py-1 border rounded-full text-sm transition-colors duration-200 ${
                    selectedCategories.includes(categ)
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {categ}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseSubmittion;
