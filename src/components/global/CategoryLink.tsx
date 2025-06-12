import { Link } from "react-router";
import { ICategory } from "../../db/interfaces";

const CategoryLink = (category: ICategory) => {
  // URL-encode the category name to ensure it's safe for URL path
  const encodedCategoryName = encodeURIComponent(category.name);

  return (
    <Link
      to={`/category/${encodedCategoryName}`}
      className={
        "px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-colors duration-150 ease-in-out bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200 whitespace-nowrap" // <-- Class added here
      }
      title={category.name}
    >
      {category.name}
    </Link>
  );
};

export default CategoryLink;
