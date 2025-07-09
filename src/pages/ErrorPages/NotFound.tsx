import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "../../context/UserContext";

export default function NotFoundPage() {
  const { t } = useTranslation("menu");
  const currentUser = useCurrentUser();

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-xl text-gray-600">{t("title")}</p>
      <p className="mt-2 text-gray-500 text-center max-w-md">
        {t("description")}
      </p>
      <Link to={currentUser ? "/dashboard" : "/"}>
        <a className="mt-6 inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className="mr-2 inline-block transform rotate-180">&rarr;</span>
          {t("back")}
        </a>
      </Link>
    </div>
  );
}
