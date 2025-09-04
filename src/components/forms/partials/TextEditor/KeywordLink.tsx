import React from "react";
import { Link } from "react-router"; // Assumes you are using React Router

interface KeywordLinkProps {
  keyword: string; // This will be the username
  label: string; // This will be the display text, e.g., "@John Doe"
}

export const KeywordLink: React.FC<KeywordLinkProps> = ({ keyword, label }) => {
  return (
    <Link
      to={`/user/${keyword}`} // Creates a link like /user/johndoe
      className="text-blue-600 hover:underline font-semibold"
      target="_blank" // Optional: opens the link in a new tab
      rel="noopener noreferrer"
    >
      {label}
    </Link>
  );
};
