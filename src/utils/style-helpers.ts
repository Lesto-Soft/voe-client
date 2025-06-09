// Status
export const getStatusStyle = (status: string) => {
  switch (status) {
    case "OPEN":
      return { dotBgColor: "bg-green-500", textColor: "text-green-800" };
    case "CLOSED":
      return { dotBgColor: "bg-gray-400", textColor: "text-gray-500" };
    case "IN_PROGRESS":
      return { dotBgColor: "bg-yellow-500", textColor: "text-yellow-800" };
    case "AWAITING_FINANCE":
      return { dotBgColor: "bg-blue-500", textColor: "text-blue-800" };
    default:
      return { dotBgColor: "bg-gray-400", textColor: "text-gray-500" };
  }
};

// Priority
export const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "text-btnGreenHover";
    case "HIGH":
      return "text-btnRedHover";
    case "MEDIUM":
      return "text-yellow-600";
    default:
      return "text-gray-500";
  }
};

// Type badge
export const getTypeBadgeStyle = (type: string) => {
  switch (type) {
    case "PROBLEM":
      return "bg-red-100 text-btnRedHover";
    case "SUGGESTION":
      return "bg-green-100 text-btnGreenHover";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const customInputStyles = `
  .custom-number-input,
  .custom-number-input::-webkit-inner-spin-button,
  .custom-number-input::-webkit-outer-spin-button {
    cursor: pointer;
  }

  .custom-date-input,
  .custom-date-input::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;
