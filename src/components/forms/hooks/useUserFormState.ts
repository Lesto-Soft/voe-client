import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../../../hooks/useDebounce"; // Adjust path if needed
import {
  useCountUsersByExactUsername,
  useCountUsersByExactEmail,
} from "../../../graphql/hooks/user"; // Adjust path
import { IUser } from "../../../db/interfaces";

// Helper function
const isValidEmailFormat = (emailToTest: string): boolean =>
  emailToTest === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);

interface UseUserFormStateProps {
  initialData: IUser | null;
  serverBaseUrl: string;
}

export function useUserFormState({
  initialData,
  serverBaseUrl,
}: UseUserFormStateProps) {
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
  const [financialApprover, setFinancialApprover] = useState<boolean>(false); // --- Validation State ---

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameHookError, setUsernameHookError] = useState<any | null>(null);
  const [emailHookError, setEmailHookError] = useState<any | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false); // --- Avatar State ---

  const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(
    null
  );
  const [finalCroppedBlob, setFinalCroppedBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false); // --- Debounced Values ---

  const debouncedUsername = useDebounce(username, 700);
  const debouncedEmail = useDebounce(email, 700); // --- Validation Hooks ---

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
  }); // --- Effect for Initial Data ---

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.name || "");
      setEmail(initialData.email || "");
      setPosition(initialData.position || "");
      setRoleId(initialData.role?._id || "");
      setFinancialApprover(initialData.financial_approver || false);
      const currentAvatarUrl = initialData.avatar
        ? `${serverBaseUrl}/static/avatars/${initialData._id}/${
            initialData.avatar
          }?v=${Date.now()}`
        : null;
      setAvatarPreview(currentAvatarUrl);
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setPosition("");
      setRoleId("");
      setFinancialApprover(false);
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
  }, [initialData, serverBaseUrl]); // --- Validation Effects (Username & Email) ---

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
      return;
    }
    setUsernameHookError(null);
    if (typeof usernameExactCount === "number") {
      if (usernameExactCount > 0) {
        setUsernameError("Потребителското име вече е заето.");
      } else {
        setUsernameError(null);
      }
    } else if (!usernameExactCountLoading) {
      setUsernameError("Невалиден отговор за проверка на потребителско име.");
    }
  }, [
    trimmedDebouncedUsername,
    usernameExactCount,
    usernameExactCountLoading,
    rawUsernameExactCountError,
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
      return;
    }
    setEmailHookError(null);
    if (typeof emailExactCount === "number") {
      if (emailExactCount > 0) {
        setEmailError("Имейлът вече е регистриран.");
      } else {
        setEmailError(null);
      }
    } else if (!emailExactCountLoading) {
      setEmailError("Невалиден отговор за проверка на имейл.");
    }
  }, [
    trimmedDebouncedEmail,
    emailExactCount,
    emailExactCountLoading,
    rawEmailExactCountError,
    isEmailFormatCurrentlyValid,
    skipEmailCheck,
    emailError,
  ]); // --- Avatar Handlers ---

  const handleSetOriginalFile = useCallback((file: File | null) => {
    setOriginalAvatarFile(file);
    if (file) {
      setIsRemovingAvatar(false);
      setFinalCroppedBlob(null);
    }
  }, []);

  const handleSetCroppedBlob = useCallback((blob: Blob | null) => {
    setFinalCroppedBlob(blob);
  }, []);

  const handleSetAvatarPreview = useCallback((url: string | null) => {
    setAvatarPreview(url);
  }, []);

  const handleSetIsRemovingAvatar = useCallback((isRemoving: boolean) => {
    setIsRemovingAvatar(isRemoving);
    if (isRemoving) {
      setOriginalAvatarFile(null);
      setFinalCroppedBlob(null);
      setAvatarPreview(null);
    }
  }, []);

  return {
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
    financialApprover,
    setFinancialApprover,
    usernameError,
    setUsernameError,
    emailError,
    setEmailError,
    usernameHookError,
    emailHookError,
    isCheckingUsername,
    isCheckingEmail,
    originalAvatarFile,
    handleSetOriginalFile,
    finalCroppedBlob,
    handleSetCroppedBlob,
    avatarPreview,
    handleSetAvatarPreview,
    isRemovingAvatar,
    handleSetIsRemovingAvatar,
    trimmedDebouncedEmail,
    isEmailFormatCurrentlyValid,
  };
}
