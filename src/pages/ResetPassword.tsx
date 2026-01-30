import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useVerifyResetToken, useResetPassword } from "../graphql/hooks/user";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const ResetPassword = () => {
  // 1. Get the token from the URL and setup navigation
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // 2. State management for the form and UI status
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "verifying" | "valid" | "invalid" | "success"
  >("verifying");
  const [error, setError] = useState<string | null>(null);

  // 3. Use the custom hooks for server communication
  const { verifyToken } = useVerifyResetToken();
  const { resetPassword, loading: resetting } = useResetPassword();

  // 4. On component load, verify the token from the URL
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setStatus("invalid");
        setError("Липсва токен за възстановяване.");
        return;
      }
      try {
        await verifyToken(token);
        setStatus("valid");
      } catch (err: any) {
        setStatus("invalid");
        setError(err.message || "Токенът е невалиден или изтекъл.");
      }
    };
    checkToken();
  }, [token, verifyToken]);

  // 5. Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Паролите не съвпадат.");
      return;
    }
    if (password.length < 6) {
      // Basic password strength check
      setError("Паролата трябва да е поне 6 символа.");
      return;
    }
    if (!token) return;

    try {
      await resetPassword({ token, newPassword: password });
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "Възникна грешка при смяната на паролата.");
    }
  };

  // 6. Render different UI based on the current status
  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <p className="text-center text-gray-600">Проверка на връзката...</p>
        );

      case "invalid":
        return (
          <div className="text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Невалидна връзка
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-4 text-sm">
              Моля,{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                заявете нова връзка
              </Link>{" "}
              за смяна на парола.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Паролата е сменена
            </h2>
            <p className="mt-2 text-gray-600">
              Вече можете да влезете в профила си с новата парола.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Към страницата за вход
            </button>
          </div>
        );

      case "valid":
        return (
          <>
            <h2 className="text-center text-2xl font-bold text-gray-800">
              Въведете нова парола
            </h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="password-input" className="sr-only">
                  Нова парола
                </label>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Нова парола"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirm-password-input" className="sr-only">
                  Потвърди парола
                </label>
                <input
                  id="confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Потвърди парола"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && (
                <p className="text-sm text-center text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={resetting}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
              >
                {resetting ? "Смяна..." : "Смени паролата"}
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResetPassword;
