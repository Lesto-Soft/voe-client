import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  EnvelopeIcon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useRequestPasswordReset } from "../../graphql/hooks/user";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation(["home", "login", "forgotPassword"]);
  const [view, setView] = useState<"email" | "no-email">("email");
  const [submitted, setSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { requestReset, loading } = useRequestPasswordReset();

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView("email");
        setSubmitted(false);
        setInputValue("");
        setFormError(null); // Reset error on close
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const variables =
      view === "email" ? { email: inputValue } : { username: inputValue };

    try {
      await requestReset(variables);
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || "Възникна неочаквана грешка.");
    }
  };

  const renderContent = () => {
    if (submitted) {
      return (
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <Dialog.Title className="mt-4 text-lg font-semibold text-gray-900">
            {view === "email"
              ? t("forgotPassword.success.email.title")
              : t("forgotPassword.success.noEmail.title")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            {view === "email"
              ? t("forgotPassword.success.email.description")
              : t("forgotPassword.success.noEmail.description")}
          </Dialog.Description>
          <div className="mt-6 flex justify-center">
            <Dialog.Close asChild>
              <button className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                {t("forgotPassword.close")}
              </button>
            </Dialog.Close>
          </div>
        </div>
      );
    }

    const commonFormUI = (
      <>
        {/* Display the error if it exists */}
        {formError && (
          <p className="text-center text-sm text-red-600 mb-3">{formError}</p>
        )}
      </>
    );

    if (view === "email") {
      return (
        <>
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {t("forgotPassword.title")}
          </Dialog.Title>
          <Dialog.Description className="mt-1 mb-5 text-sm text-gray-600">
            {t("forgotPassword.email.description")}
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t("forgotPassword.email.placeholder")}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("forgotPassword.email.placeholder")!}
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
            {commonFormUI}
            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Изпращане..."
                  : t("forgotPassword.email.submitButton")}
              </button>
              <button
                type="button"
                onClick={() => setView("no-email")}
                disabled={loading}
                className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("forgotPassword.email.switchToNoEmail")}
              </button>
            </div>
          </form>
        </>
      );
    }

    if (view === "no-email") {
      return (
        <>
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {t("forgotPassword.noEmail.title")}
          </Dialog.Title>
          <Dialog.Description className="mt-1 mb-5 text-sm text-gray-600">
            {t("forgotPassword.noEmail.description")}
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                {t("forgotPassword.noEmail.placeholder")}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("forgotPassword.noEmail.placeholder")!}
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
            {commonFormUI}
            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Изпращане..."
                  : t("forgotPassword.noEmail.submitButton")}
              </button>
              <button
                type="button"
                onClick={() => setView("email")}
                disabled={loading}
                className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("forgotPassword.noEmail.switchToEmail")}
              </button>
            </div>
          </form>
        </>
      );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <button
                className="cursor-pointer absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={t("forgotPassword.close")!}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {renderContent()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ForgotPasswordModal;
