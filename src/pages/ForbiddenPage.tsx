import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "../context/UserContext";

export default function ForbiddenPage() {
  const { t } = useTranslation("errors");
  const currentUser = useCurrentUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-9xl font-bold text-gray-800">403</h1>
      <p className="mt-4 text-2xl font-semibold text-gray-800">
        {t("forbiddenTitle", "Нямате необходимите права за достъп")}
      </p>
      <p className="mt-2 text-gray-600 text-center max-w-md">
        {t("forbiddenDescription", "Нямате достъп до тази страница.")}
      </p>
      <div className="mt-8">
        <Link to={currentUser ? "/dashboard" : "/"}>
          <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span className="mr-2 inline-block transform rotate-180">
              &rarr;
            </span>
            {t("goBackHome", "Към Начална")}
          </span>
        </Link>
      </div>
    </div>
  );
}
