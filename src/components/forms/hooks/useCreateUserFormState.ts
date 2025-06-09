// src/components/forms/hooks/useCreateUserFormState.ts
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../../../hooks/useDebounce"; // Adjust path if needed
import {
  useCountUsersByExactUsername,
  useCountUsersByExactEmail,
} from "../../../graphql/hooks/user"; // Adjust path
import { Role, User } from "../../../types/userManagementTypes"; // Adjust path
import { IUser } from "../../../db/interfaces";

// Helper function
const isValidEmailFormat = (emailToTest: string): boolean =>
  emailToTest === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);

interface UseCreateUserFormStateProps {
  initialData: IUser | null;
  serverBaseUrl: string;
}

export function useCreateUserFormState({
  initialData,
  serverBaseUrl,
}: UseCreateUserFormStateProps) {
  // --- Form Field State ---
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [financialApprover, setFinancialApprover] = useState<boolean>(false); // Added state

  // --- Validation State ---
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameHookError, setUsernameHookError] = useState<any | null>(null);
  const [emailHookError, setEmailHookError] = useState<any | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // --- Avatar State ---
  const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(
    null
  );
  const [finalCroppedBlob, setFinalCroppedBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  // --- Debounced Values ---
  const debouncedUsername = useDebounce(username, 700);
  const debouncedEmail = useDebounce(email, 700);

  // --- Validation Hooks ---
  const trimmedDebouncedUsername = debouncedUsername.trim();
  const skipUsernameCheck =
    !trimmedDebouncedUsername ||
    (!!initialData && trimmedDebouncedUsername === initialData.username);
  const {
    count: usernameExactCount,
    loading: usernameExactCountLoading,
    error: rawUsernameExactCountError,
  } = useCountUsersByExactUsername(trimmedDebouncedUsername, {
    skip: skipUsernameCheck,
  });

  const trimmedDebouncedEmail = debouncedEmail.trim();
  const isEmailFormatCurrentlyValid = isValidEmailFormat(trimmedDebouncedEmail);
  const skipEmailCheck =
    !trimmedDebouncedEmail ||
    !isEmailFormatCurrentlyValid ||
    (!!initialData && trimmedDebouncedEmail === initialData.email);
  const {
    count: emailExactCount,
    loading: emailExactCountLoading,
    error: rawEmailExactCountError,
  } = useCountUsersByExactEmail(trimmedDebouncedEmail, {
    skip: skipEmailCheck,
  });

  // --- Effect for Initial Data ---
  useEffect(() => {
    console.log(
      "[Hook] InitialData Effect: initialData changed or serverBaseUrl changed.",
      initialData
    );
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.name || "");
      setEmail(initialData.email || "");
      setPosition(initialData.position || "");
      setRoleId(initialData.role?._id || "");
      setFinancialApprover(initialData.financial_approver || false); // Set financialApprover
      const currentAvatarUrl = initialData.avatar
        ? `${serverBaseUrl}/static/avatars/${initialData._id}/${
            initialData.avatar
          }?v=${Date.now()}`
        : null;
      setAvatarPreview(currentAvatarUrl);
      console.log(
        "[Hook] InitialData Effect: Set avatarPreview to:",
        currentAvatarUrl
      );
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setPosition("");
      setRoleId("");
      setFinancialApprover(false); // Reset financialApprover
      setAvatarPreview(null);
      console.log(
        "[Hook] InitialData Effect: Cleared form fields and avatarPreview."
      );
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
    console.log(
      "[Hook] InitialData Effect: Reset passwords, errors, and avatar file states."
    );
  }, [initialData, serverBaseUrl]);

  // --- Validation Effects (Username & Email) ---
  useEffect(() => {
    setIsCheckingUsername(
      usernameExactCountLoading &&
        !skipUsernameCheck &&
        !!trimmedDebouncedUsername
    );
    if (skipUsernameCheck) {
      setUsernameError(null);
      setUsernameHookError(null);
      if (!usernameExactCountLoading) setIsCheckingUsername(false);
      return;
    }
    if (usernameExactCountLoading) {
      setUsernameError(null);
      setUsernameHookError(null);
      return;
    }
    if (rawUsernameExactCountError) {
      setUsernameError(null);
      setUsernameHookError(rawUsernameExactCountError);
      console.error(
        "[Hook] Username exact count hook error:",
        rawUsernameExactCountError
      );
      return;
    }
    setUsernameHookError(null);
    if (typeof usernameExactCount === "number") {
      if (initialData) {
        if (usernameExactCount > 0)
          setUsernameError("Потребителското име вече е заето.");
        else setUsernameError(null);
      } else {
        if (usernameExactCount > 0)
          setUsernameError("Потребителското име вече е заето.");
        else setUsernameError(null);
      }
    } else if (!usernameExactCountLoading) {
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

  useEffect(() => {
    if (trimmedDebouncedEmail && !isEmailFormatCurrentlyValid) {
      setEmailError("Невалиден имейл формат.");
      setEmailHookError(null);
      setIsCheckingEmail(false);
      return;
    }
    if (
      isEmailFormatCurrentlyValid &&
      emailError === "Невалиден имейл формат."
    ) {
      setEmailError(null);
    }
    setIsCheckingEmail(
      emailExactCountLoading && !skipEmailCheck && !!trimmedDebouncedEmail
    );
    if (skipEmailCheck || !trimmedDebouncedEmail) {
      if (emailError !== "Невалиден имейл формат.") setEmailError(null);
      setEmailHookError(null);
      if (!emailExactCountLoading) setIsCheckingEmail(false);
      return;
    }
    if (emailExactCountLoading) {
      if (emailError !== "Невалиден имейл формат.") setEmailError(null);
      setEmailHookError(null);
      return;
    }
    if (rawEmailExactCountError) {
      if (emailError !== "Невалиден имейл формат.") setEmailError(null);
      setEmailHookError(rawEmailExactCountError);
      console.error(
        "[Hook] Email exact count hook error:",
        rawEmailExactCountError
      );
      return;
    }
    setEmailHookError(null);
    if (typeof emailExactCount === "number") {
      if (emailExactCount > 0) setEmailError("Имейлът вече е регистриран.");
      else setEmailError(null);
    } else if (!emailExactCountLoading) {
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
    emailError,
  ]);

  // --- Avatar Handlers with Logging ---
  const handleSetOriginalFile = useCallback((file: File | null) => {
    console.log(
      "[Hook] handleSetOriginalFile called with:",
      file ? file.name : null
    );
    setOriginalAvatarFile(file);
    if (file) {
      setIsRemovingAvatar(false); // If a new file is set, we are no longer removing
      setFinalCroppedBlob(null); // Clear previous crop
      console.log(
        "[Hook] handleSetOriginalFile: Cleared isRemovingAvatar and finalCroppedBlob."
      );
    }
  }, []);

  const handleSetCroppedBlob = useCallback((blob: Blob | null) => {
    console.log(
      "[Hook] handleSetCroppedBlob called with blob (size):",
      blob ? blob.size : null
    );
    setFinalCroppedBlob(blob);
  }, []);

  const handleSetAvatarPreview = useCallback((url: string | null) => {
    console.log(
      "[Hook] handleSetAvatarPreview called with url:",
      url ? url.substring(0, 30) + "..." : null
    );
    setAvatarPreview(url);
  }, []);

  const handleSetIsRemovingAvatar = useCallback((isRemoving: boolean) => {
    console.log("[Hook] handleSetIsRemovingAvatar called with:", isRemoving);
    setIsRemovingAvatar(isRemoving);
    if (isRemoving) {
      setOriginalAvatarFile(null);
      setFinalCroppedBlob(null);
      setAvatarPreview(null); // Also clear preview when removing
      console.log(
        "[Hook] handleSetIsRemovingAvatar: Cleared originalFile, croppedBlob, and avatarPreview."
      );
    }
  }, []);

  return {
    // Form Field State & Setters
    username,
    setUsername,
    fullName,
    setFullName,
    email,
    setEmail,
    position,
    setPosition,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    roleId,
    setRoleId,
    financialApprover, // Return state
    setFinancialApprover, // Return setter

    // Validation State
    usernameError,
    setUsernameError,
    emailError,
    setEmailError,
    usernameHookError,
    emailHookError,
    isCheckingUsername,
    isCheckingEmail,

    // Avatar State & Handlers
    originalAvatarFile,
    handleSetOriginalFile,
    finalCroppedBlob,
    handleSetCroppedBlob,
    avatarPreview,
    handleSetAvatarPreview,
    isRemovingAvatar,
    handleSetIsRemovingAvatar,

    // Other needed values
    trimmedDebouncedEmail,
    isEmailFormatCurrentlyValid,
  };
}
