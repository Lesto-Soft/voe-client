import React, { useState, useEffect, useRef, useCallback } from "react";
import { Role } from "../../page/UserManagementPage"; // Adjust path if needed
import UserAvatar from "../cards/UserAvatar";
import ImageCropModal from "../modals/ImageCropModal";

// Import your new hooks (adjust path as necessary)
import {
  useCountUsersByExactUsername,
  useCountUsersByExactEmail,
} from "../../graphql/hooks/user"; // Assuming they are in this path

// --- Interfaces (no change) ---
interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string; // Can be null or empty string
  role: Role | null;
  avatar?: string | null;
}
interface AvatarInputData {
  filename: string;
  file: string; // base64 string
}
interface CreateUserFormProps {
  onSubmit: (
    formData: any,
    editingUserId: string | null,
    avatarData: AvatarInputData | null | undefined
  ) => void;
  onClose: () => void;
  initialData: User | null;
  submitButtonText: string;
  roles: Role[];
  rolesLoading: boolean;
  rolesError: any;
}

// --- Helper Functions (no change)---
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string)?.split(",")[1];
      if (base64String) resolve(base64String);
      else reject(new Error("Не може да се прочете файла като base64."));
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Component ---
const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  submitButtonText = "Създай",
  roles = [],
  rolesLoading: propsRolesLoading = false,
  rolesError: propsRolesError = null,
}) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // Email is optional
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [role, setRoleId] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  // Store ApolloError objects from hooks
  const [usernameHookError, setUsernameHookError] = useState<any | null>(null);
  const [emailHookError, setEmailHookError] = useState<any | null>(null);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const debouncedUsername = useDebounce(username, 700);
  const debouncedEmail = useDebounce(email, 700);

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- Username Validation using useCountUsersByExactUsername ---
  const trimmedDebouncedUsername = debouncedUsername.trim();
  // Skip username check if: empty OR (in edit mode AND username is unchanged)
  const skipUsernameCheck =
    !trimmedDebouncedUsername ||
    (!!initialData && trimmedDebouncedUsername === initialData.username);

  const {
    count: usernameExactCount,
    loading: usernameExactCountLoading,
    error: rawUsernameExactCountError, // ApolloError from the hook
  } = useCountUsersByExactUsername(
    trimmedDebouncedUsername,
    // Assuming your hook handles fetchPolicy and its own internal skip for empty string
    { skip: skipUsernameCheck }
  );

  // --- Email Validation using useCountUsersByExactEmail ---
  const trimmedDebouncedEmail = debouncedEmail.trim();
  const isValidEmailFormat = (emailToTest: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);
  const isEmailFormatCurrentlyValid = isValidEmailFormat(trimmedDebouncedEmail);

  // Skip email check if: email empty OR format invalid OR (editing AND email is unchanged)
  const skipEmailCheck =
    !trimmedDebouncedEmail || // If email is empty, skip
    !isEmailFormatCurrentlyValid ||
    (!!initialData && trimmedDebouncedEmail === initialData.email);

  const {
    count: emailExactCount,
    loading: emailExactCountLoading,
    error: rawEmailExactCountError, // ApolloError from the hook
  } = useCountUsersByExactEmail(
    trimmedDebouncedEmail,
    // Assuming your hook handles fetchPolicy and its own internal skip for empty string
    { skip: skipEmailCheck }
  );

  // --- Effect for Initial Data (no change) ---
  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.name || "");
      setEmail(initialData.email || ""); // Email can be null/empty
      setPosition(initialData.position || "");
      setRoleId(initialData.role?._id || "");
      const currentAvatarUrl = initialData.avatar
        ? `${serverBaseUrl}/static/avatars/${initialData._id}/${initialData.avatar}`
        : null;
      setAvatarPreview(currentAvatarUrl);
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setPosition("");
      setRoleId("");
      setAvatarPreview(null);
    }
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setUsernameError(null);
    setEmailError(null);
    setUsernameHookError(null);
    setEmailHookError(null);
    setIsCheckingUsername(false);
    setIsCheckingEmail(false);
    setOriginalAvatarFile(null);
    setFinalCroppedBlob(null);
    setIsRemovingAvatar(false);
    setImageToCrop(null);
    setIsCropModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [initialData, serverBaseUrl]);

  // --- Effect for Username Validation ---
  useEffect(() => {
    // Set loading state based on hook's loading and if we are actually performing a check
    setIsCheckingUsername(usernameExactCountLoading && !skipUsernameCheck);

    if (skipUsernameCheck) {
      setUsernameError(null);
      setUsernameHookError(null);
      // If skipping, ensure loading indicator is off if hook isn't loading (e.g., due to its own internal skip)
      if (!usernameExactCountLoading) setIsCheckingUsername(false);
      return;
    }

    if (usernameExactCountLoading) {
      setUsernameError(null); // Clear previous validation errors while loading
      setUsernameHookError(null); // Clear previous hook errors
      return;
    }

    if (rawUsernameExactCountError) {
      setUsernameError(null); // Clear validation error if there's a hook/API error
      setUsernameHookError(rawUsernameExactCountError);
      console.error(
        "Username exact count hook error:",
        rawUsernameExactCountError
      );
      return;
    }
    setUsernameHookError(null); // Clear hook error if the query was successful

    // At this point, query is successful, not loading, and no hook error
    if (typeof usernameExactCount === "number") {
      if (initialData) {
        // Editing mode
        // Since skipUsernameCheck is false here, it means the username has been changed
        if (usernameExactCount > 0) {
          setUsernameError("Потребителското име вече е заето.");
        } else {
          setUsernameError(null); // New username is available
        }
      } else {
        // Create mode
        if (usernameExactCount > 0) {
          setUsernameError("Потребителското име вече е заето.");
        } else {
          setUsernameError(null); // Username is available
        }
      }
    } else if (!usernameExactCountLoading) {
      // This case should ideally not be reached if the hook initializes count to 0.
      // It's a fallback.
      setUsernameError("Невалиден отговор за проверка на потребителско име.");
    }
  }, [
    trimmedDebouncedUsername,
    usernameExactCount,
    usernameExactCountLoading,
    rawUsernameExactCountError,
    initialData,
    skipUsernameCheck,
  ]);

  // --- Effect for Email Validation ---
  useEffect(() => {
    // 1. Handle invalid format error separately and early if email is provided
    if (trimmedDebouncedEmail && !isEmailFormatCurrentlyValid) {
      setEmailError("Невалиден имейл формат.");
      setEmailHookError(null); // Clear any API error if format is the issue
      setIsCheckingEmail(false); // Not an API check, so stop loading indicator
      return;
    }
    // 2. If format becomes valid and the current error was specifically about format, clear it.
    if (
      isEmailFormatCurrentlyValid &&
      emailError === "Невалиден имейл формат."
    ) {
      setEmailError(null);
    }

    // 3. Set loading state for email check
    // Only show loading if email is provided, format is valid, and not skipped by other logic
    setIsCheckingEmail(
      emailExactCountLoading && !skipEmailCheck && !!trimmedDebouncedEmail
    );

    // 4. If check should be skipped (empty, invalid format handled above, or unchanged in edit mode)
    if (skipEmailCheck || !trimmedDebouncedEmail) {
      // Don't clear format error if that's the current issue
      if (emailError !== "Невалиден имейл формат.") {
        setEmailError(null);
      }
      setEmailHookError(null);
      if (!emailExactCountLoading) setIsCheckingEmail(false); // Ensure loading state is reset
      return;
    }

    // 5. Handle hook loading state
    if (emailExactCountLoading) {
      // Clear previous validation/API errors while loading new data, but not format error
      if (emailError !== "Невалиден имейл формат.") setEmailError(null);
      setEmailHookError(null);
      return;
    }

    // 6. Handle hook error state
    if (rawEmailExactCountError) {
      if (emailError !== "Невалиден имейл формат.") setEmailError(null); // Clear validation error
      setEmailHookError(rawEmailExactCountError);
      console.error("Email exact count hook error:", rawEmailExactCountError);
      return;
    }
    setEmailHookError(null); // Clear hook error if query was successful

    // 7. Process successful count
    if (typeof emailExactCount === "number") {
      // This logic applies if email is provided, format is valid,
      // and (it's create mode OR (edit mode AND email has changed from initialData.email))
      if (emailExactCount > 0) {
        setEmailError("Имейлът вече е регистриран.");
      } else {
        setEmailError(null); // Email available
      }
    } else if (!emailExactCountLoading) {
      // Fallback if count is not a number and not loading (should be rare)
      setEmailError("Невалиден отговор за проверка на имейл.");
    }
  }, [
    trimmedDebouncedEmail,
    emailExactCount,
    emailExactCountLoading,
    rawEmailExactCountError,
    initialData,
    isEmailFormatCurrentlyValid,
    skipEmailCheck,
    emailError, // Dependency to allow conditional clearing of format error
  ]);

  // --- Avatar State & Handlers (no changes) ---
  const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(
    null
  );
  const [finalCroppedBlob, setFinalCroppedBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalAvatarFile(file);
      setIsRemovingAvatar(false);
      setFinalCroppedBlob(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCropComplete = useCallback((croppedBlob: Blob | null) => {
    setImageToCrop(null);
    setIsCropModalOpen(false);
    if (croppedBlob) {
      setFinalCroppedBlob(croppedBlob);
      const blobUrl = URL.createObjectURL(croppedBlob);
      setAvatarPreview(blobUrl);
    } else {
      // Crop cancelled or failed
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      setOriginalAvatarFile(null); // Clear stored original file
      // Optionally revert avatarPreview to initialData state or previous state if needed
    }
  }, []); // Add dependencies if they are used inside and can change, e.g. initialData for reverting

  useEffect(() => {
    const currentPreview = avatarPreview;
    // Cleanup function to revoke object URL
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [avatarPreview]); // Re-run when avatarPreview changes

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleRemoveAvatar = () => {
    setOriginalAvatarFile(null);
    setFinalCroppedBlob(null);
    setAvatarPreview(null);
    setIsRemovingAvatar(true);
    setImageToCrop(null);
    setIsCropModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string)?.split(",")[1];
        if (base64String) resolve(base64String);
        else reject(new Error("Could not convert Blob to base64."));
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  // --- Form Submission ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let canSubmit = true;
    const finalTrimmedUsername = username.trim();
    const finalTrimmedEmail = email.trim(); // Email is optional

    // Username is always required
    if (!finalTrimmedUsername) {
      setUsernameError("Потребителското име е задължително.");
      canSubmit = false;
    }

    // If email is provided, it must be valid format
    if (finalTrimmedEmail && !isValidEmailFormat(finalTrimmedEmail)) {
      setEmailError("Невалиден имейл формат.");
      canSubmit = false;
    }

    // Check errors from hooks/effects based on current input values.
    // These errors should reflect the latest debounced state.
    if (usernameError || usernameHookError) {
      canSubmit = false;
    }
    // Only consider email errors if an email is actually provided and it's not just a format issue (already checked)
    if (
      finalTrimmedEmail &&
      isEmailFormatCurrentlyValid &&
      (emailError || emailHookError)
    ) {
      canSubmit = false;
    }

    // Check if any validation is still in progress for fields that have values
    if (isCheckingUsername && finalTrimmedUsername) {
      alert("Моля, изчакайте проверката на потребителско име да завърши.");
      canSubmit = false;
    }
    if (isCheckingEmail && finalTrimmedEmail && isEmailFormatCurrentlyValid) {
      alert("Моля, изчакайте проверката на имейл да завърши.");
      canSubmit = false;
    }

    if (!canSubmit) {
      alert("Моля, коригирайте грешките във формата.");
      return;
    }

    // Password validations
    if (!initialData && !password) {
      alert("Паролата е задължителна при създаване!");
      return;
    }
    if (!initialData && password !== confirmPassword) {
      alert("Паролите не съвпадат!");
      return;
    }
    if (initialData && newPassword && newPassword !== confirmNewPassword) {
      alert("Новите пароли не съвпадат!");
      return;
    }

    const formDataObject: any = {
      username: finalTrimmedUsername,
      name: fullName.trim(),
      email: finalTrimmedEmail || null, // Send null if email is empty
      position: position.trim() || null,
      role: role || null,
    };
    if (!initialData) formDataObject.password = password;
    else if (newPassword) formDataObject.password = newPassword;

    let avatarInputData: AvatarInputData | null | undefined = undefined;
    if (finalCroppedBlob) {
      try {
        const base64String = await blobToBase64(finalCroppedBlob);
        const filename = originalAvatarFile?.name
          ? `cropped_${originalAvatarFile.name.replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )}`
          : "cropped_avatar.png";
        avatarInputData = { filename, file: base64String };
      } catch (error) {
        alert(
          `Грешка при обработка на изрязания аватар: ${
            error instanceof Error ? error.message : "Неизвестна грешка"
          }`
        );
        return;
      }
    } else if (isRemovingAvatar && initialData?._id) {
      avatarInputData = null;
    }

    onSubmit(formDataObject, initialData?._id || null, avatarInputData);
  };

  if (propsRolesLoading)
    return <div className="p-4 text-center">Зареждане на роли...</div>;
  if (propsRolesError)
    return (
      <div className="p-4 text-center text-red-500">
        Грешка при зареждане на роли:{" "}
        {propsRolesError.message || "Неизвестна грешка"}
      </div>
    );

  // Determine overall loading state for disabling submit button
  const overallLoading =
    (isCheckingUsername && !!trimmedDebouncedUsername) ||
    (isCheckingEmail && !!trimmedDebouncedEmail && isEmailFormatCurrentlyValid);
  const errorPlaceholderClass = "mt-1 text-xs min-h-[1.2em]"; // For stable layout

  // --- Render ---
  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Username Input */}
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
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
                setUsernameHookError(null);
              }}
              required // Username is still required
              className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                usernameError || usernameHookError
                  ? "border-red-500"
                  : "border-gray-300"
              } ${
                isCheckingUsername && trimmedDebouncedUsername
                  ? "opacity-70 animate-pulse"
                  : ""
              }`}
            />
            <p
              className={`${errorPlaceholderClass} ${
                usernameError || usernameHookError
                  ? "text-red-500"
                  : "text-blue-500"
              }`}
            >
              {isCheckingUsername && trimmedDebouncedUsername ? (
                "Проверка на потребителско име..."
              ) : usernameError ? (
                usernameError
              ) : usernameHookError ? (
                usernameHookError.message ||
                "Грешка от сървъра при проверка на потребителско име."
              ) : (
                <>&nbsp;</>
              )}
            </p>
          </div>

          {/* Full Name Input */}
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
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>{" "}
            {/* Placeholder for alignment */}
          </div>

          {/* Email Input - Optional */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Имейл {/* No longer required, so no asterisk */}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
                setEmailHookError(null);
              }}
              // No 'required' attribute
              className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                emailError || emailHookError
                  ? "border-red-500"
                  : "border-gray-300"
              } ${
                isCheckingEmail &&
                trimmedDebouncedEmail &&
                isEmailFormatCurrentlyValid
                  ? "opacity-70 animate-pulse"
                  : ""
              }`}
            />
            <p
              className={`${errorPlaceholderClass} ${
                emailError || emailHookError ? "text-red-500" : "text-blue-500"
              }`}
            >
              {isCheckingEmail &&
              trimmedDebouncedEmail &&
              isEmailFormatCurrentlyValid ? (
                "Проверка на имейл..."
              ) : emailError ? (
                emailError
              ) : emailHookError ? (
                emailHookError.message ||
                "Грешка от сървъра при проверка на имейл."
              ) : (
                <>&nbsp;</>
              )}
            </p>
          </div>

          {/* Other fields with placeholders for alignment */}
          <div>
            {" "}
            {/* Position */}
            <label
              htmlFor="position"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {" "}
              Позиция{" "}
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>
          <div>
            {" "}
            {/* Role */}
            <label
              htmlFor="role"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {" "}
              Роля<span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRoleId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Изберете роля</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {" "}
                  {r.name.charAt(0).toUpperCase() + r.name.slice(1)}{" "}
                </option>
              ))}
            </select>
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>
          <div>
            {" "}
            {/* Avatar */}
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {" "}
              Аватар{" "}
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                name="avatarFile"
              />
              <div
                className="cursor-pointer flex-shrink-0"
                onClick={handleAvatarClick}
              >
                <UserAvatar
                  name={fullName || username || "?"}
                  imageUrl={avatarPreview}
                  size={64}
                />
              </div>
              <div className="flex flex-col gap-2 flex-grow sm:flex-grow-0">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="rounded bg-blue-500 px-3 py-1 text-xs text-white shadow-sm hover:bg-blue-600"
                >
                  {avatarPreview ? "Смени" : "Качи"} Аватар
                </button>
                {avatarPreview && !isRemovingAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 shadow-sm hover:bg-red-200"
                  >
                    Премахни Аватар
                  </button>
                )}
                {isRemovingAvatar && (
                  <span className="text-xs text-red-600">
                    {" "}
                    Аватарът ще бъде премахнат.{" "}
                  </span>
                )}
              </div>
            </div>
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>

          {/* Password Fields */}
          {!initialData ? (
            <>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {" "}
                  Парола<span className="text-red-500">*</span>{" "}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!initialData}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {" "}
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
                <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Нова парола{" "}
                  <span className="text-xs text-gray-500">
                    (оставете празно, ако не променяте)
                  </span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Нова парола"
                />
                <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
              </div>
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {" "}
                  Потвърди нова парола{" "}
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Потвърди нова парола"
                />
                <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={overallLoading}
            className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitButtonText}
          </button>
        </div>
      </form>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setImageToCrop(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setOriginalAvatarFile(null);
          handleCropComplete(null); // Call with null to indicate cancellation
        }}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default CreateUserForm;
