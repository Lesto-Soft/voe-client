// src/components/global/EnvironmentLabel.tsx

import React from "react";
import { isDevelopment } from "../../db/config";

const EnvironmentLabel: React.FC = () => {
  if (!isDevelopment) {
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
