// src/components/global/CategoryLink.tsx
import React from "react"; // Import React for FC type
import { Link } from "react-router"; // Assuming react-router-dom v5/v6, adjust if using older react-router
import { ICategory } from "../../db/interfaces"; // Adjust path as needed

// Define props interface for type safety and clarity
interface CategoryLinkProps {
  category: ICategory;
  // You can add other optional props here if needed, e.g., custom classNames
  // className?: string;
}

const CategoryLink: React.FC<CategoryLinkProps> = ({
  category /*, className: customClassName */,
}) => {
  if (!category || !category.name) {
    // Handle cases where category or category.name might be missing, though ICategory defines name as required
    console.warn("CategoryLink received invalid category prop:", category);
    return null; // Or some fallback UI
  }

  // URL-encode the category name to ensure it's safe for URL path
  const encodedCategoryName = encodeURIComponent(category.name);

  // const defaultClasses = "px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors duration-150 ease-in-out bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200";
  // const combinedClasses = customClassName ? `${defaultClasses} ${customClassName}` : defaultClasses;

  return (
    <Link
      to={`/category/${encodedCategoryName}`}
      className={
        "px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors duration-150 ease-in-out bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200"
      }
      // className={combinedClasses} // If you add customClassName prop
      title={`View category: ${category.name}`} // Added title for accessibility
    >
      {category.name}
    </Link>
  );
};

export default CategoryLink;
