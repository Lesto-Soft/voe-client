// src/contexts/UserContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { IMe } from "../db/interfaces";

interface UserContextType {
  currentUser: IMe;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode; value: IMe }> = ({
  children,
  value,
}) => {
  return (
    <UserContext.Provider value={{ currentUser: value }}>
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = (): IMe => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context.currentUser;
};
