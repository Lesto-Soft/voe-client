import axios from "axios";
import { useState } from "react";
import { dev_endpoint } from "../db/config";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/modals/LanguageSwitcher";

const FormHeader = ({ subtitleKey }: { subtitleKey: string }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-6 w-full text-center">
      {" "}
      <h1 className="lg:text-5xl text-4xl font-extrabold text-gray-800 uppercase w-full drop-shadow-lg">
        {" "}
        {t("home.title")}
      </h1>
      <p className="italic text-lg my-3 text-gray-600 max-w-md mx-auto">
        {" "}
        {t(subtitleKey)}
      </p>
    </div>
  );
};

const CaseForm = ({
  setIsLogin,
}: {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const FORM_SECTION_MIN_HEIGHT = "min-h-55";
  const { t } = useTranslation("home");
  return (
    <div className={`text-center lg:w-full space-y-6`}>
      <div
        className={`flex flex-col justify-center items-stretch space-y-4 ${FORM_SECTION_MIN_HEIGHT}`}
      >
        <div>
          <Link to={`/submit-case?type=problem`}>
            <button className="bg-btnRed hover:bg-red-800 active:bg-red-500 hover:cursor-pointer  text-white rounded-lg w-full py-3 px-5 uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300">
              {t("home.problem")}
            </button>
          </Link>
        </div>
        <div>
          <Link to="/submit-case?type=suggestion">
            <button className="bg-btnGreen hover:bg-green-700 active:bg-green-500 hover:cursor-pointer  text-white rounded-lg w-full py-3 px-5 uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300">
              {t("home.suggestion")}
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-6 w-full text-center">
        <button
          className="text-gray-600 hover:text-gray-700 font-medium transition-all duration-300 hover:cursor-pointer"
          onClick={() => setIsLogin(true)}
        >
          {t("home.enterYourProfile")} &rarr;
        </button>
      </div>
    </div>
  );
};

const LoginForm = ({
  setIsLogin,
}: {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const FORM_SECTION_MIN_HEIGHT = "min-h-55";

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${dev_endpoint}/login`,
        { username, password },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setIsLoading(false);
      if (response.data.message === "Login successful") {
        window.location.href = "/dashboard";
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      if ((err as any)?.response?.status === 403) {
        setError(
          "Този потребител е напуснал. Моля, използвайте друг акаунт или се свържете с администратора."
        );
        return;
      }
      setError(
        (err as any)?.response?.data?.message ||
          (err instanceof Error ? err.message : "An unknown error occurred.")
      );
    }
  };

  return (
    <div className={`text-center lg:w-full space-y-6`}>
      <form
        onSubmit={handleLoginSubmit}
        className={`flex flex-col justify-center items-center space-y-4 ${FORM_SECTION_MIN_HEIGHT}`}
      >
        <div>
          <input
            type="text"
            id="username"
            placeholder={t("login.usernamePlaceholder", "Потребител")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="lg:w-88 w-full py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            placeholder={t("login.passwordPlaceholder", "Парола")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="lg:w-88 w-full py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-sm w-full text-center">
            {error}
          </div>
        )}
        <div className="mt-6 w-full text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-400 hover:bg-blue-800 active:bg-blue-500 text-white rounded-lg w-full py-3 px-5 uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300 hover:cursor-pointer disabled:bg-blue-200 disabled:cursor-not-allowed" // Already w-full
          >
            {isLoading ? t("home.loggingIn") : t("home.login")}
          </button>
        </div>
      </form>
      <div className="mt-6 w-full text-center">
        <button
          onClick={() => setIsLogin(false)}
          disabled={isLoading}
          className="text-gray-600 hover:text-gray-700 font-medium transition-all duration-300 hover:cursor-pointer disabled:opacity-50"
        >
          &larr; {t("home.submitCase")}
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [isLogin, setIsLogin] = useState(false);
  const subtitleKey = isLogin ? "home.enterYourProfile" : "home.subtitle";

  return (
    <div className="container mx-auto h-screen flex items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col-reverse lg:flex-row justify-around items-start w-full max-w-6xl p-6 lg:p-12">
        <div className="w-full lg:w-1/2 flex flex-col items-center mt-8 lg:mt-0">
          <FormHeader subtitleKey={subtitleKey} />

          <div className="w-full max-w-sm">
            {isLogin ? (
              <LoginForm setIsLogin={setIsLogin} />
            ) : (
              <CaseForm setIsLogin={setIsLogin} />
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <img
            src="/images/illustrations/voe_visual.png"
            alt="VOE Image"
            className="h-48 w-48 md:h-64 md:w-64 lg:h-auto lg:w-full max-w-sm lg:max-w-md"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
