// src/components/features/userManagement/UserFilters.tsx
import React from "react";
import UserSearchBar from "../../tables/UserSearchBar"; // Adjust path to your existing component

interface UserFiltersProps {
  filterName: string;
  setFilterName: (value: string) => void;
  filterUsername: string;
  setFilterUsername: (value: string) => void;
  filterPosition: string;
  setFilterPosition: (value: string) => void;
  filterEmail: string;
  setFilterEmail: (value: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = (props) => {
  // Pass the props directly to your existing UserSearchBar
  return <UserSearchBar {...props} />;
};

export default UserFilters;
