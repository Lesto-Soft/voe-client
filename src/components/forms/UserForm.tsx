import React, { useState, useEffect, useRef, useCallback } from "react";
import { Role } from "../../types/userManagementTypes";
import ImageCropModal from "../modals/ImageCropModal";
import { useUserFormState } from "./hooks/useUserFormState"; // <-- Use renamed hook
import UserInputFields from "./partials/UserInputFields";
import PasswordFields from "./partials/PasswordFields";
import AvatarUploadSection from "./partials/AvatarUploadSection";
import { IUser } from "../../db/interfaces";

const MAX_AVATAR_SIZE_MB = 3;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

interface AvatarInputData {
  filename: string;
  file: string; // base64 string
}

interface UserFormProps {
  onSubmit: (
    formData: any,
    editingUserId: string | null,
    avatarData: AvatarInputData | null | undefined
  ) => void;
  onClose: () => void;
  initialData: IUser | null;
  submitButtonText: string;
  roles: Role[];
  rolesLoading: boolean;
  rolesError: any;
  // --- NEW PROPS ---
  isAdmin: boolean;
}

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

const isValidEmailFormat = (emailToTest: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  submitButtonText = "Запази",
  roles = [],
  rolesLoading: propsRolesLoading = false,
  rolesError: propsRolesError = null,
  // --- NEW PROP ---
  isAdmin,
}) => {
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";
  const isEditing = !!initialData;

  const {
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
  } = useUserFormState({ initialData, serverBaseUrl });

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCompletedRef = useRef<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError(
        `Файлът е твърде голям. Максималният размер е ${MAX_AVATAR_SIZE_MB}MB.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    cropCompletedRef.current = false;
    handleSetOriginalFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = useCallback(
    (croppedBlob: Blob | null) => {
      setImageToCrop(null);
      setIsCropModalOpen(false);
      handleSetCroppedBlob(croppedBlob);

      if (croppedBlob) {
        cropCompletedRef.current = true;
        const blobUrl = URL.createObjectURL(croppedBlob);
        handleSetAvatarPreview(blobUrl);
      } else {
        cropCompletedRef.current = false;
        if (fileInputRef.current) fileInputRef.current.value = "";
        handleSetOriginalFile(null);
      }
    },
    [handleSetCroppedBlob, handleSetAvatarPreview, handleSetOriginalFile]
  );

  useEffect(() => {
    const currentPreview = avatarPreview;
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [avatarPreview]);

  const handleRemoveAvatar = () => {
    setAvatarError(null);
    cropCompletedRef.current = false;
    handleSetIsRemovingAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModalClose = useCallback(() => {
    if (!cropCompletedRef.current) {
      setImageToCrop(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      handleSetOriginalFile(null);
    }
    setIsCropModalOpen(false);
    cropCompletedRef.current = false;
  }, [handleSetOriginalFile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitError(null);
    let canSubmit = true;

    const finalTrimmedUsername = username.trim();
    const finalTrimmedEmail = email.trim();

    if (!finalTrimmedUsername) {
      setUsernameError("Потребителското име е задължително.");
      canSubmit = false;
    }
    if (finalTrimmedEmail && !isValidEmailFormat(finalTrimmedEmail)) {
      setEmailError("Невалиден имейл формат.");
      canSubmit = false;
    }
    if (usernameError || usernameHookError) canSubmit = false;
    if (
      finalTrimmedEmail &&
      isValidEmailFormat(finalTrimmedEmail) &&
      (emailError || emailHookError)
    )
      canSubmit = false;
    if (isCheckingUsername && finalTrimmedUsername) {
      setFormSubmitError("Проверката на потребителско име е в ход.");
      canSubmit = false;
    }
    if (
      isCheckingEmail &&
      finalTrimmedEmail &&
      isValidEmailFormat(finalTrimmedEmail)
    ) {
      setFormSubmitError("Проверката на имейл е в ход.");
      canSubmit = false;
    }

    if (!initialData && !password) {
      setFormSubmitError("Паролата е задължителна при създаване!");
      canSubmit = false;
    }
    if (!initialData && password !== confirmPassword) {
      setFormSubmitError("Паролите не съвпадат!");
      canSubmit = false;
    }
    if (initialData && newPassword && newPassword !== confirmNewPassword) {
      setFormSubmitError("Новите пароли не съвпадат!");
      canSubmit = false;
    }

    if (!canSubmit) {
      if (!formSubmitError)
        setFormSubmitError("Моля, коригирайте грешките във формата.");
      return;
    }

    const formDataObject: any = {
      username: finalTrimmedUsername,
      name: fullName.trim(),
      email: finalTrimmedEmail || null,
      position: position.trim() || null,
      role: roleId || null,
      financial_approver: financialApprover,
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
        setFormSubmitError(
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

  const overallLoading =
    (isCheckingUsername && !!username.trim()) ||
    (isCheckingEmail && !!email.trim() && isEmailFormatCurrentlyValid);
  const errorPlaceholderClass = "mt-1 text-xs min-h-[2.4em]";

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <UserInputFields
            username={username}
            setUsername={(v) => {
              setUsername(v);
              setUsernameError(null);
              setFormSubmitError(null);
            }}
            usernameError={usernameError}
            usernameHookError={usernameHookError}
            isCheckingUsername={isCheckingUsername}
            fullName={fullName}
            setFullName={(v) => {
              setFullName(v);
              setFormSubmitError(null);
            }}
            email={email}
            setEmail={(v) => {
              setEmail(v);
              setEmailError(null);
              setFormSubmitError(null);
            }}
            emailError={emailError}
            emailHookError={emailHookError}
            isCheckingEmail={isCheckingEmail}
            isEmailFormatCurrentlyValid={isEmailFormatCurrentlyValid}
            trimmedDebouncedEmail={trimmedDebouncedEmail}
            position={position}
            setPosition={(v) => {
              setPosition(v);
              setFormSubmitError(null);
            }}
            roleId={roleId}
            setRoleId={(v) => {
              setRoleId(v);
              setFormSubmitError(null);
            }}
            roles={roles}
            financialApprover={financialApprover}
            setFinancialApprover={(v) => {
              setFinancialApprover(v);
              setFormSubmitError(null);
            }}
            errorPlaceholderClass={errorPlaceholderClass}
            // --- PASS NEW PROPS ---
            isEditing={isEditing}
            isAdmin={isAdmin}
          />

          <AvatarUploadSection
            fullName={fullName}
            username={username}
            avatarPreview={avatarPreview}
            isRemovingAvatar={isRemovingAvatar}
            onFileChange={handleFileChange}
            onAvatarClick={() => {}}
            onRemoveAvatar={handleRemoveAvatar}
            errorPlaceholderClass={errorPlaceholderClass}
            avatarError={avatarError}
            fileInputRef={fileInputRef}
          />

          <PasswordFields
            isEditing={isEditing}
            password={password}
            setPassword={(v) => {
              setPassword(v);
              setFormSubmitError(null);
            }}
            confirmPassword={confirmPassword}
            setConfirmPassword={(v) => {
              setConfirmPassword(v);
              setFormSubmitError(null);
            }}
            newPassword={newPassword}
            setNewPassword={(v) => {
              setNewPassword(v);
              setFormSubmitError(null);
            }}
            confirmNewPassword={confirmNewPassword}
            setConfirmNewPassword={(v) => {
              setConfirmNewPassword(v);
              setFormSubmitError(null);
            }}
            errorPlaceholderClass={errorPlaceholderClass}
          />
        </div>

        {formSubmitError && (
          <div className="mt-6 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">
            {formSubmitError}
          </div>
        )}

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
        onClose={handleModalClose}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default UserForm;
