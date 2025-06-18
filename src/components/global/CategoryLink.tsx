import { Link } from "react-router";
import { ICategory } from "../../db/interfaces";
import { useCurrentUser } from "../../context/UserContext";
import { canViewCategory } from "../../utils/rightUtils";

const CategoryLink = (category: ICategory) => {
  // URL-encode the category name to ensure it's safe for URL path

  const currentUser = useCurrentUser();
  // TODO fetch category.experts / category.managers
  if (!category || !currentUser) {
    return null;
  }
  console.log(category);
  const isAllowed = canViewCategory(currentUser, category);
  const baseClasses =
    "inline-block max-w-full truncate whitespace-nowrap px-2 py-0.5 rounded-md text-xs font-bold transition-colors duration-150 ease-in-out bg-sky-100 text-sky-800 border border-sky-200";
  const disabledClasses = "opacity-75 cursor-not-allowed";
  const title = isAllowed
    ? category.name
    : "Нямате права за достъп до тази категория";

  if (isAllowed) {
    const encodedCategoryName = encodeURIComponent(category.name);
    return (
      <Link
        to={`/category/${encodedCategoryName}`}
        className={`${baseClasses} cursor-pointer hover:bg-sky-200`}
        title={title}
      >
        {category.name}
      </Link>
    );
  }

  return (
    <span className={`${baseClasses} ${disabledClasses}`} title={title}>
      {category.name}
    </span>
  );
};

export default CategoryLink;
