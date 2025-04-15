import React, { useState, useEffect } from "react";

// Assuming 'User' interface is available or defined here/imported
interface User {
  id: string;
  avatarInitial: string; // Will likely be derived, not directly edited in form
  username: string;
  name: string;
  position: string;
  email: string;
  isExpert: boolean;
  isAdmin: boolean;
}

interface CreateUserFormProps {
  onSubmit: (formData: any, editingUserId: string | null) => void; // Pass ID if editing
  onClose: () => void;
  initialData?: User | null; // Make initialData optional
  submitButtonText?: string; // Optional text for the button
}

const CreateUserFormModal: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onClose,
  initialData = null, // Default to null
  submitButtonText = "Създай", // Default button text
}) => {
  // --- Form State ---
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [isExpert, setIsExpert] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Effect to pre-fill form when initialData changes ---
  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.name || ""); // Map `name` from User to `fullName` in form
      setEmail(initialData.email || "");
      setPosition(initialData.position || "");
      setIsExpert(initialData.isExpert || false);
      setIsAdmin(initialData.isAdmin || false);
      // Reset passwords when editing - user should re-enter if they want to change it
      setPassword("");
      setConfirmPassword("");
    } else {
      // Reset form if initialData is null (for creation)
      setUsername("");
      setFullName("");
      setEmail("");
      setPosition("");
      setIsExpert(false);
      setIsAdmin(false);
      setPassword("");
      setConfirmPassword("");
    }
  }, [initialData]); // Re-run effect if initialData changes

  // --- Handlers ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Conditionally require password for creation, not necessarily for edit
    if (!initialData && !password) {
      alert("Паролата е задължителна при създаване на потребител!");
      return;
    }
    // Only check matching passwords if a new password is entered
    if (password && password !== confirmPassword) {
      alert("Паролите не съвпадат!");
      return;
    }

    const formData: any = {
      // Define a more specific type if needed
      username,
      name: fullName, // Map back from form state to User structure if needed
      email,
      position,
      isExpert,
      isAdmin,
    };

    // Only include password in submitted data if it's been entered
    if (password) {
      formData.password = password;
    }

    console.log("Form Data Submitted: ", formData);
    // Pass the ID of the user being edited (or null if creating)
    onSubmit(formData, initialData ? initialData.id : null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {/* Row 1 */}
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
            // Disable username editing if needed: readOnly={!!initialData}
            className={`w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              !!initialData ? "bg-gray-100" : ""
            }`} // Example: visual cue for read-only
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

        {/* Row 2 */}
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

        {/* Row 3 - Radios */}
        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-gray-700">
            Експерт
          </legend>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="expert-no"
                name="isExpert"
                type="radio"
                checked={!isExpert}
                onChange={() => setIsExpert(false)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="expert-no"
                className="ml-2 block text-sm text-gray-900"
              >
                Не
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="expert-yes"
                name="isExpert"
                type="radio"
                checked={isExpert}
                onChange={() => setIsExpert(true)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="expert-yes"
                className="ml-2 block text-sm text-gray-900"
              >
                Да
              </label>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-gray-700">
            Администратор
          </legend>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="admin-no"
                name="isAdmin"
                type="radio"
                checked={!isAdmin}
                onChange={() => setIsAdmin(false)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="admin-no"
                className="ml-2 block text-sm text-gray-900"
              >
                Не
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="admin-yes"
                name="isAdmin"
                type="radio"
                checked={isAdmin}
                onChange={() => setIsAdmin(true)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="admin-yes"
                className="ml-2 block text-sm text-gray-900"
              >
                Да
              </label>
            </div>
          </div>
        </fieldset>

        {/* Row 4 - Passwords */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Парола {!initialData && <span className="text-red-500">*</span>}
            {initialData && (
              <span className="text-xs text-gray-500">
                {" "}
                (оставете празно, ако не променяте)
              </span>
            )}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!initialData} // Only required when creating
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={initialData ? "Нова парола (опционално)" : ""}
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Повтори парола{" "}
            {!initialData && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required={!initialData || !!password} // Required if creating OR if new password entered
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={initialData ? "Потвърди нова парола" : ""}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          type="submit"
          className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {submitButtonText} {/* Use dynamic button text */}
        </button>
      </div>
    </form>
  );
};

export default CreateUserFormModal;
