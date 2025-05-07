import { Link } from "react-router";
import { ICategory } from "../../db/interfaces";

const CategoryLink = (category: ICategory) => {
  return (
    <Link
      to={`/category/${category._id}`}
      className={
        "px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors duration-150 ease-in-out bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200"
      }
    >
      {category.name}
    </Link>
  );
};

export default CategoryLink;
