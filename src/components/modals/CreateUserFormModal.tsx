import React, { useState, useEffect } from "react";

interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
}

interface CreateUserFormProps {
  onSubmit: (formData: any, editingUserId: string | null) => void;
  onClose: () => void;
  initialData?: User | null;
  submitButtonText?: string;
}

const CreateUserFormModal: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  submitButtonText = "Създай",
}) => {
  // --- Form State ---
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Effect to pre-fill form when initialData changes ---
  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.name || "");
      setEmail(initialData.email || "");
      setPosition(initialData.position || "");
      setPassword("");
      setConfirmPassword("");
    } else {
      // Reset form for creation
      setUsername("");
      setFullName("");
      setEmail("");
      setPosition("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [initialData]);

  // --- Handlers ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!initialData && !password) {
      alert("Паролата е задължителна при създаване на потребител!");
      return;
    }
    if (password && password !== confirmPassword) {
      alert("Паролите не съвпадат!");
      return;
    }

    const formData: any = {
      username,
      name: fullName,
      email,
      position,
    };

    if (!initialData && password) {
      formData.password = password;
    }

    console.log(
      "Form Data Submitted: ",
      formData,
      "Editing ID:",
      initialData ? initialData._id : null
    );
    onSubmit(formData, initialData ? initialData._id : null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Потребителско име<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={`w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              !!initialData ? "bg-gray-100" : ""
            }`}
          />
        </div>
        <div>
          <label
            htmlFor="fullName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Име и фамилия<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Имейл
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="position"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Позиция
          </label>
          <input
            type="text"
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {!initialData && (
          <>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Парола<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!initialData}
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Повтори парола<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!initialData}
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          type="submit"
          className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default CreateUserFormModal;
