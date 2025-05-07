// src/components/forms/CreateUserForm.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Role, User } from "../../page/types/userManagementTypes"; // Adjust path
import ImageCropModal from "../modals/ImageCropModal";
import { useCreateUserFormState } from "./hooks/useCreateUserFormState"; // Import the new hook
import UserInputFields from "./partials/UserInputFields"; // Import sub-components
import PasswordFields from "./partials/PasswordFields";
import AvatarUploadSection from "./partials/AvatarUploadSection";

// Interface for the final avatar data structure expected by parent onSubmit
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
  onClose: () => void; // Keep onClose if the form itself needs to trigger closing
  initialData: User | null;
  submitButtonText: string;
  roles: Role[];
  rolesLoading: boolean;
  rolesError: any;
  // Add t function if needed for submit button text etc.
}

// Helper: Convert Blob to Base64 (Move to utils if used elsewhere)
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

// Helper: Check email format (Move to utils)
const isValidEmailFormat = (emailToTest: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  submitButtonText = "Създай",
  roles = [],
  rolesLoading: propsRolesLoading = false, // Renamed to avoid conflict if needed
  rolesError: propsRolesError = null,
}) => {
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- Use the custom hook for state and logic ---
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
  } = useCreateUserFormState({ initialData, serverBaseUrl });

  // --- State specific to this component (Modal) ---
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null); // For general submit errors

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref to track if crop was completed successfully before modal close
  const cropCompletedRef = useRef<boolean>(false);

  // --- Avatar Handling Logic specific to triggering the modal ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      cropCompletedRef.current = false; // Reset flag on new file select
      handleSetOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback when cropping is complete (or cancelled within the modal)
  const handleCropComplete = useCallback(
    (croppedBlob: Blob | null) => {
      setImageToCrop(null);
      setIsCropModalOpen(false);
      handleSetCroppedBlob(croppedBlob);

      if (croppedBlob) {
        // Crop was successful
        cropCompletedRef.current = true; // Set flag for successful crop
        const blobUrl = URL.createObjectURL(croppedBlob);
        handleSetAvatarPreview(blobUrl);
        console.log("[CreateUserForm] Crop successful, blob set, flag set.");
      } else {
        // Crop was cancelled within the modal
        cropCompletedRef.current = false; // Ensure flag is false on cancel
        console.log("[CreateUserForm] Crop cancelled/failed in modal.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        handleSetOriginalFile(null);
      }
    },
    [handleSetCroppedBlob, handleSetAvatarPreview, handleSetOriginalFile]
  );

  // Effect to clean up Blob URLs created for preview
  useEffect(() => {
    const currentPreview = avatarPreview;
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarClick = () => {
    // Passed to AvatarUploadSection
  };

  const handleRemoveAvatar = () => {
    cropCompletedRef.current = false; // Reset flag if removing
    handleSetIsRemovingAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handler for when the modal is closed via backdrop click or Esc key
  const handleModalClose = useCallback(() => {
    console.log(
      "[CreateUserForm] Modal onClose triggered. Crop completed flag:",
      cropCompletedRef.current
    );
    // Only reset if the crop wasn't successfully completed before closing
    if (!cropCompletedRef.current) {
      console.log(
        "[CreateUserForm] Modal onClose: Resetting state because crop was not completed."
      );
      setImageToCrop(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      handleSetOriginalFile(null); // Clear original file state
    } else {
      console.log(
        "[CreateUserForm] Modal onClose: Crop completed flag is true, not resetting state."
      );
    }
    // Always close the modal visually and reset the flag for the next cycle
    setIsCropModalOpen(false);
    cropCompletedRef.current = false;
  }, [handleSetOriginalFile]); // Dependency is only the setter

  // --- Form Submission ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitError(null);
    let canSubmit = true;

    const finalTrimmedUsername = username.trim();
    const finalTrimmedEmail = email.trim();

    // Perform final synchronous checks
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

    // Password checks
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

    // Prepare data for parent onSubmit
    const formDataObject: any = {
      username: finalTrimmedUsername,
      name: fullName.trim(),
      email: finalTrimmedEmail || null,
      position: position.trim() || null,
      role: roleId || null,
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

    console.log("[CreateUserForm] handleSubmit - Preparing to submit:", {
      isEditing: !!initialData,
      finalCroppedBlobExists: !!finalCroppedBlob,
      originalAvatarFileName: originalAvatarFile?.name,
      isRemovingAvatar: isRemovingAvatar,
      calculatedAvatarInputData: avatarInputData,
      formDataObject: formDataObject,
    });

    onSubmit(formDataObject, initialData?._id || null, avatarInputData);
  };

  // --- Render ---
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
  const errorPlaceholderClass = "mt-1 text-xs min-h-[1.2em]";

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
            errorPlaceholderClass={errorPlaceholderClass}
          />

          <AvatarUploadSection
            fullName={fullName}
            username={username}
            avatarPreview={avatarPreview}
            isRemovingAvatar={isRemovingAvatar}
            onFileChange={handleFileChange}
            onAvatarClick={handleAvatarClick}
            onRemoveAvatar={handleRemoveAvatar}
            errorPlaceholderClass={errorPlaceholderClass}
          />

          <PasswordFields
            isEditing={!!initialData}
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

        {/* General Form Submission Error Display */}
        {formSubmitError && (
          <div className="mt-6 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center">
            {formSubmitError}
          </div>
        )}

        {/* Submit Button */}
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

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={handleModalClose} // Use the ref-based handler
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default CreateUserForm;
