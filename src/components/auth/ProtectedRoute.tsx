// src/components/auth/ProtectedRoute.js
import React from "react";
import { useCurrentUser } from "../../context/UserContext";
import ForbiddenPage from "../../pages/ErrorPages/ForbiddenPage";
import { IMe } from "../../db/interfaces";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * A component that wraps a route to protect it based on user roles.
 * @param {object} props
 * @param {React.ReactNode} props.children The component to render if the user is authorized.
 * @param {string[]} props.allowedRoles An array of roles that are allowed to access the route.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const currentUser: IMe | null = useCurrentUser();

  // If for some reason the context is not available, deny access.
  if (!currentUser) {
    return <ForbiddenPage />;
  }

  // Check if the user's role is included in the list of allowed roles.
  const isAuthorized = allowedRoles.includes(currentUser.role._id);

  // If authorized, render the child component (the actual page).
  // Otherwise, render the ForbiddenPage.
  return isAuthorized ? children : <ForbiddenPage />;
};

export default ProtectedRoute;
