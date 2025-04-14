import axios from "axios";
import { useState } from "react";
import { dev_endpoint } from "../db/config";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/modals/LanguageSwitcher";
const CaseForm = ({
  setIsLogin,
}: {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t, i18n } = useTranslation();
  return (
    <>
      <LanguageSwitcher />
      <div className="text-center lg:text-left lg:w-full flex-1 space-y-6">
        <div className="">
          <h1 className="lg:text-5xl text-4xl font-extrabold font-main text-gray-800 uppercase w-full text-center lg:text-left drop-shadow-lg">
            {t("home.title")}
          </h1>
          <p className="italic text-lg my-3 text-gray-600 w-80 text-center lg:text-left">
            {t("home.subtitle")}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Link to={`/submit-case?type=problem`}>
              <button className="bg-btnRed hover:bg-red-200 text-white rounded-lg lg:w-88 w-72 py-3 px-5 uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300">
                {t("home.problem")}
              </button>
            </Link>
          </div>
          <div>
            <Link to="/submit-case?type=suggestion">
              <button className="bg-btnGreen hover:bg-green-200 text-white rounded-lg lg:w-88 w-72 py-3 px-5  uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300">
                {t("home.suggestion")}
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-6 w-80 text-center">
          <button
            className="text-blue-600 hover:text-blue-700 underline font-medium transition-all duration-300 hover:cursor-pointer"
            onClick={() => setIsLogin(true)}
          >
            {t("home.enterYourProfile")} &rarr;
          </button>
        </div>
      </div>
    </>
  );
};

const LoginForm = ({
  setIsLogin,
}: {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${dev_endpoint}/login`,
        {
          username,
          password,
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include cookies in the request
        }
      );

      setIsLoading(false);

      if (response.data.message === "Login successful") {
        window.location.href = "/dashboard"; // Redirect to a dashboard or another page
      }
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    }
  };

  return (
    <div className="text-center lg:text-left lg:w-full flex-1 space-y-6">
      <div className="">
        <h1 className="lg:text-5xl text-4xl font-extrabold font-main text-gray-800 uppercase w-full text-center lg:text-left drop-shadow-lg">
          {t("home.title")}
        </h1>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            id="username"
            placeholder="Потребител"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="lg:w-88 w-full py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" // Added w-full for consistency and disabled style
          />
        </div>

        <div>
          <input
            type="password"
            id="password"
            placeholder="Парола"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="lg:w-88 w-full py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" // Added w-full for consistency and disabled style
          />
        </div>

        {error && (
          <div className="mt-2 text-red-600 text-sm w-80 text-center lg:text-left">
            {error}
          </div>
        )}

        <div className="mt-6 w-80 text-center lg:text-left">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-400 hover:bg-blue-800 text-white rounded-lg lg:w-88 w-full py-3 px-5 uppercase font-bold shadow-xl lg:text-2xl transition-all duration-300 hover:cursor-pointer disabled:bg-blue-200 disabled:cursor-not-allowed"
          >
            {isLoading ? `${t("home.loggingIn")}` : `${t("home.login")}`}
          </button>
        </div>
      </form>

      <div className="mt-6 w-80 text-center lg:text-left">
        <button
          onClick={() => setIsLogin(false)}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-700 underline font-medium transition-all duration-300 hover:cursor-pointer disabled:opacity-50"
        >
          &larr; {t("home.submitCase")}
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div className="container mx-auto h-screen flex items-center">
      <div className="flex flex-col-reverse lg:flex-row justify-around items-center w-full p-6 lg:p-12">
        {isLogin ? (
          <LoginForm setIsLogin={setIsLogin} />
        ) : (
          <CaseForm setIsLogin={setIsLogin} />
        )}
        <div className="lg:w-1/2 flex-1 flex justify-center items-center ">
          <img
            src="/images/illustrations/voe2-bg.png"
            alt="VOE Image"
            className="h-60 w-60 lg:h-full lg:w-full "
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
