// src/components/global/EnvironmentLabel.tsx

import React from "react";

const EnvironmentLabel: React.FC = () => {
  // Компонентът се показва само ако променливата на средата е "development"
  if (import.meta.env.VITE_APP_ENV !== "development") {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-2/5 -translate-x-1/2 bg-blue-600 text-white text-md font-bold px-4 py-1 rounded-b-lg shadow-lg z-[9999]"
      title="Вие сте на версия, предвидена за тестване"
    >
      ТЕСТОВА СРЕДА
    </div>
  );
};

export default EnvironmentLabel;
