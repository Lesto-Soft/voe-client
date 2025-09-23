import { LockClosedIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { endpoint } from "../../db/config";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation("home");
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
        `${endpoint}/login`,
        { username, password },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setIsLoading(false);
      if (response.data.message === "Login successful") {
        onLoginSuccess();
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setIsLoading(false);
      const errorResponse = (err as any)?.response;
      if (errorResponse?.status === 500 || errorResponse?.status === 401) {
        setError(t("home.errors.wrong_credentials"));
        return;
      }

      if (errorResponse?.status === 403) {
        setError(t("home.errors.user_left"));
        return;
      }
      setError(
        (err as any)?.response?.data?.message ||
          (err instanceof Error ? err.message : "An unknown error occurred.")
      );
    }
  };

  return (
    <div className="flex flex-col items-center text-center w-full">
      <div className="mb-4 rounded-full bg-indigo-100 p-3">
        <LockClosedIcon
          className="h-6 w-6 text-indigo-600"
          aria-hidden="true"
        />
      </div>

      <h2 className="text-xl font-semibold text-gray-900">Сесията е изтекла</h2>
      <p className="mt-2 text-sm text-gray-500 mb-6">
        Моля, влезте отново, за да продължите.
      </p>

      <form
        onSubmit={handleLoginSubmit}
        className="w-full flex flex-col justify-center items-center space-y-4"
      >
        <div>
          <input
            type="text"
            id="modal_username"
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
            id="modal_password"
            placeholder={t("login.passwordPlaceholder", "Парола")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="lg:w-88 w-full py-3 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm w-full text-center pt-1">
            {error}
          </div>
        )}
        <div className="lg:w-88 w-full pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-400 hover:bg-blue-800 active:bg-blue-500 text-white rounded-lg w-full py-3 px-5 uppercase font-bold shadow-xl text-xl transition-all duration-300 hover:cursor-pointer disabled:bg-blue-200 disabled:cursor-not-allowed"
          >
            {isLoading ? t("home.loggingIn") : t("home.login")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
