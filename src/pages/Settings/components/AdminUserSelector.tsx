import React from "react";
import { IUser } from "../../../db/interfaces";
// In a real scenario, you would use a debounced search hook here.
// For this mock, we'll just use a placeholder.

interface AdminUserSelectorProps {
  onUserSelect: (user: IUser) => void;
}

const AdminUserSelector: React.FC<AdminUserSelectorProps> = ({
  onUserSelect,
}) => {
  // This would contain the logic for a dropdown user search,
  // similar to the one we implemented in CaseSearchBar.tsx.
  // For brevity, we will simulate the selection.

  const handleSimulateSelection = () => {
    // In a real app, this would come from the search result.
    const mockSelectedUser: IUser = {
      _id: "user-id-ivan",
      name: "Иван Иванов",
      username: "ivan.i",
      // ... other required IUser fields
    } as IUser;
    onUserSelect(mockSelectedUser);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Търсене на потребител за редакция..."
        className="w-64 p-2 border rounded-md text-sm"
        // In a real app, onChange would trigger the search
      />
      {/* This button is for mockup purposes to simulate selecting a user */}
      <button
        onClick={handleSimulateSelection}
        className="ml-2 text-sm p-2 bg-gray-200 rounded-md"
      >
        Избери (Тест)
      </button>
    </div>
  );
};

export default AdminUserSelector;
