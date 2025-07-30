// src/components/global/EnvironmentLabel.tsx

import React from "react";

const EnvironmentLabel: React.FC = () => {
  // Компонентът се показва само ако променливата на средата е "development"
  if (import.meta.env.VITE_APP_ENV !== "development") {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-12 bg-blue-600 text-white text-sm font-bold px-2 py-0 rounded-b-lg shadow-lg z-[9999]"
      title="Вие сте на версия, предвидена за тестване"
    >
      ТЕСТОВА СРЕДА
    </div>
  );
};

export default EnvironmentLabel;
