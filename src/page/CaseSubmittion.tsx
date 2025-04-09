import { useState } from "react";
import { Link } from "react-router";
import { useLocation } from "react-router";
import { useGetActiveCategories } from "../graphql/hooks/category";

export type CaseType = "problem" | "suggestion";

const CaseSubmittion = () => {
  const { categories, loading, error } = useGetActiveCategories(); // Assuming the hook returns { data, loading, error }
  const [priority, setPriority] = useState("Low");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const caseType = queryParams.get("type") as CaseType | null;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  // console.log(caseType);

  if (!caseType || (caseType !== "problem" && caseType !== "suggestion")) {
    return <div>Invalid case type</div>;
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200">
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
          <button className="bg-transparent text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-200">
            ❓ Помощ
          </button>

          <Link to="/">
            <button className="bg-transparent text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-200">
              ← Назад
            </button>
          </Link>
          <button className="bg-green-600 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-green-700 transition-colors duration-200">
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
          <button className="w-full border border-gray-300 p-3 rounded-md text-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors duration-200">
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
                { label: "Нисък", value: "Low", color: "#009b00" },
                { label: "Среден", value: "Medium", color: "#ad8600" },
                { label: "Висок", value: "High", color: "#c30505" },
              ].map(({ label, value, color }) => (
                <label
                  key={value}
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                >
                  <input
                    type="radio"
                    value={value}
                    checked={priority === value}
                    onChange={() => setPriority(value)}
                    style={{ accentColor: color }} // Custom accent color via inline style
                    className="w-4 h-4"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Отнася се за</h3>
            <div className="flex flex-wrap gap-2">
              {categories.getLeanActiveCategories.map(
                (category: { name: string }) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className={`px-3 py-1 border rounded-full text-sm transition-colors duration-200 cursor-pointer ${
                      selectedCategories.includes(category.name)
                        ? "bg-gray-400 text-white hover:bg-gray-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseSubmittion;
