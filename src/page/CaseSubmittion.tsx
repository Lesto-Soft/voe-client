import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useGetActiveCategories } from "../graphql/hooks/category";

export type CaseType = "problem" | "suggestion";

const CaseSubmittion = () => {
  const { categories, loading, error } = useGetActiveCategories(); // Assuming the hook returns { data, loading, error }
  const [priority, setPriority] = useState("Low");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { search } = useLocation();

  console.log("Categories:", categories);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  const queryParams = new URLSearchParams(search);
  const caseType = queryParams.get("type") as CaseType | null;

  if (!caseType || (caseType !== "problem" && caseType !== "suggestion")) {
    return <div>Invalid case type</div>;
  }

  const getCategoryClass = (categoryName: string) => {
    const isSelected = selectedCategories.includes(categoryName);

    // Define all possible full class strings
    const commonClasses =
      "px-3 py-1 border rounded-full text-sm transition-colors duration-200 cursor-pointer";

    const styles = {
      problem: {
        selected: `bg-red-500 text-white border-red-500 hover:bg-red-600`, // Use text-white for contrast
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:border-red-100`, // Use lighter hover bg
      },
      suggestion: {
        selected: `bg-green-500 text-white border-green-500 hover:bg-green-600`, // Use text-white for contrast
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-100`, // Use lighter hover bg
      },
    };

    const state = isSelected ? "selected" : "unselected";
    // Return the common classes plus the specific state classes
    // Ensure caseType is valid before accessing styles[caseType]
    return `${commonClasses} ${styles[caseType]?.[state] ?? ""}`;
  };

  const getSendButtonClass = () => {
    // Define all possible full class strings
    const commonClasses =
      "text-white py-2 px-4 rounded-md cursor-pointer transition-colors duration-200";

    const styles = {
      problem: `bg-red-600 hover:bg-red-700`,
      suggestion: `bg-green-600 hover:bg-green-700`,
    };
    // Return the common classes plus the specific state classes
    // Ensure caseType is valid before accessing styles[caseType]
    return `${commonClasses} ${
      styles[caseType] ?? "bg-gray-600 hover:bg-gray-700"
    }`; // Add a fallback
  };

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
        {/* Title and subtitle */}
        <div>
          <h2 className="text-xl font-semibold">Подаване на сигнал</h2>
          <p className="text-sm text-gray-500">
            Моля, попълнете формуляра по-долу
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          <button className="bg-transparent text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-200">
            ❓ Помощ
          </button>

          <Link to="/">
            <button className="bg-transparent text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-200">
              ← Назад
            </button>
          </Link>
          {/* Apply the result of the function */}
          <button className={getSendButtonClass()}>Изпрати</button>
        </div>
      </div>

      {/* Left Panel: Inputs */}
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

      {/* Right Panel: Priority & Categories */}
      <div className="rounded-2xl shadow-md bg-white">
        <div className="space-y-4 p-6">
          {/* Priority */}
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
                    style={{ accentColor: color }}
                    className="w-4 h-4"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-2">Отнася се за</h3>
            <div className="flex flex-wrap gap-2">
              {/* Check if categories is an array before mapping */}
              {Array.isArray(categories.getLeanActiveCategories) &&
                categories.getLeanActiveCategories.map(
                  (category: { name: string }) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => toggleCategory(category.name)}
                      // Apply the result of the function directly
                      className={getCategoryClass(category.name)}
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
