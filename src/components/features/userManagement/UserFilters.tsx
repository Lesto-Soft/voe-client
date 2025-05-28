// src/components/features/userManagement/UserFilters.tsx
import React from "react";
import UserSearchBar from "../../tables/UserSearchBar"; // Adjusted path based on your provided UserSearchBar path

interface UserFiltersProps {
  filterName: string;
  setFilterName: (value: string) => void;
  filterUsername: string;
  setFilterUsername: (value: string) => void;
  filterPosition: string;
  setFilterPosition: (value: string) => void;
  filterEmail: string;
  setFilterEmail: (value: string) => void;
  filterFinancial: boolean;
  setFilterFinancial: (value: boolean) => void;
  filterManager: boolean; // <-- ADDED
  setFilterManager: (value: boolean) => void; // <-- ADDED
}

const UserFilters: React.FC<UserFiltersProps> = (props) => {
  // Pass all props, including the new manager filter props, to UserSearchBar
  return <UserSearchBar {...props} />;
};

export default UserFilters;
