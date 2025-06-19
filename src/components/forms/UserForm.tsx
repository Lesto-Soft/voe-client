import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Role } from "../../types/userManagementTypes";
import ImageCropModal from "../modals/ImageCropModal";
import { useUserFormState } from "./hooks/useUserFormState";
import UserInputFields from "./partials/UserInputFields";
import PasswordFields from "./partials/PasswordFields";
import AvatarUploadSection from "./partials/AvatarUploadSection";
import CategorySelectionDropdown from "./partials/CategorySelectionDropdown"; // NEW
import { IUser, ICategory, IMe } from "../../db/interfaces";
import { useGetActiveCategories } from "../../graphql/hooks/category"; // NEW
import { ROLES } from "../../utils/GLOBAL_PARAMETERS"; // NEW
import { useCurrentUser } from "../../context/UserContext";

const VALIDATION = {
  USERNAME: { MIN: 3, MAX: 20 },
  PASSWORD: { MIN: 6, MAX: 50 },
  NAME: { MIN: 3, MAX: 50 },
  POSITION: { MIN: 0, MAX: 50 },
  EMAIL: { MAX: 100 },
};

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
  isAdmin,
}) => {
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";
  const isEditing = !!initialData;
  const currentUser = useCurrentUser() as IMe | undefined;

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
    expertCategoryIds,
    setExpertCategoryIds,
    managedCategoryIds,
    setManagedCategoryIds,
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

  const {
    categories: activeCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetActiveCategories();

  // --- NEW: State to store the original category assignments ---
  const [initialExpertCategories, setInitialExpertCategories] = useState<
    string[]
  >([]);
  const [initialManagedCategories, setInitialManagedCategories] = useState<
    string[]
  >([]);

  const filteredRoles = useMemo(() => {
    // isAdmin is true for both Expert (Managers) and Admin so we need to
    // explicitly check the currentUser.role._id
    if (currentUser?.role?._id !== ROLES.ADMIN) {
      // Filter out ADMIN role if current user is not an admin
      return roles.filter((role) => role._id !== ROLES.ADMIN);
    }
    return roles;
  }, [roles, isAdmin]);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCompletedRef = useRef<boolean>(false);

  // --- NEW: useEffect to populate the "memory" state on load ---
  useEffect(() => {
    if (initialData) {
      const expertIds =
        initialData.expert_categories?.map((c: any) => c._id || c) || [];
      const managedIds =
        initialData.managed_categories?.map((c: any) => c._id || c) || [];
      setInitialExpertCategories(expertIds);
      setInitialManagedCategories(managedIds);
    }
  }, [initialData]);

  const canManageCategories = useMemo(
    () => roleId === ROLES.ADMIN || roleId === ROLES.EXPERT,
    [roleId]
  );

  // --- MODIFIED: The role change handler now includes restore logic ---
  const handleRoleChange = (newRoleId: string) => {
    // Check the privilege level of the role we are changing FROM
    const oldRoleIsPrivileged = canManageCategories;
    // Check the privilege level of the role we are changing TO
    const newRoleIsPrivileged =
      newRoleId === ROLES.ADMIN || newRoleId === ROLES.EXPERT;

    // Case 1: Restore categories
    // If moving from a non-privileged role TO a privileged one...
    if (!oldRoleIsPrivileged && newRoleIsPrivileged) {
      // ...restore the original categories we saved on load.
      setExpertCategoryIds(initialExpertCategories);
      setManagedCategoryIds(initialManagedCategories);
    }
    // Case 2: Clear categories
    // If moving from a privileged role TO a non-privileged one...
    else if (oldRoleIsPrivileged && !newRoleIsPrivileged) {
      // ...clear the categories as before.
      setExpertCategoryIds([]);
      setManagedCategoryIds([]);
    }
    // Case 3: (e.g., Admin -> Expert or Normal -> Inactive)
    // In all other cases, do nothing to the categories, preserving any changes.

    // Finally, always update the role ID itself.
    setRoleId(newRoleId);
  };

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
    // --- Reset all local errors on new submit attempt ---
    setFormSubmitError(null);
    setUsernameError(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    let canSubmit = true;

    const finalTrimmedUsername = username.trim();
    const finalTrimmedName = fullName.trim();
    const finalTrimmedEmail = email.trim();

    // --- NEW/ENHANCED VALIDATION LOGIC ---
    if (!finalTrimmedUsername) {
      setUsernameError("Потребителското име е задължително.");
      canSubmit = false;
    } else if (finalTrimmedUsername.length < VALIDATION.USERNAME.MIN) {
      setUsernameError(
        `Потребителското име трябва да е поне ${VALIDATION.USERNAME.MIN} символа.`
      );
      canSubmit = false;
    }

    if (!finalTrimmedName) {
      setNameError("Името е задължително.");
      canSubmit = false;
    } else if (finalTrimmedName.length < VALIDATION.NAME.MIN) {
      setNameError(`Името трябва да е поне ${VALIDATION.NAME.MIN} символа.`);
      canSubmit = false;
    }

    if (!roleId) {
      setFormSubmitError("Ролята е задължителна.");
      canSubmit = false;
    }

    if (finalTrimmedEmail && !isValidEmailFormat(finalTrimmedEmail)) {
      setEmailError("Невалиден имейл формат.");
      canSubmit = false;
    }

    // --- Password Validation ---
    if (!isEditing) {
      // CREATE MODE
      if (!password) {
        setPasswordError("Паролата е задължителна.");
        canSubmit = false;
      } else if (password.length < VALIDATION.PASSWORD.MIN) {
        setPasswordError(
          `Паролата трябва да е поне ${VALIDATION.PASSWORD.MIN} символа.`
        );
        canSubmit = false;
      } else if (password !== confirmPassword) {
        setPasswordError("Паролите не съвпадат.");
        canSubmit = false;
      }
    } else {
      // EDIT MODE
      if (newPassword && newPassword.length < VALIDATION.PASSWORD.MIN) {
        setPasswordError(
          `Новата парола трябва да е поне ${VALIDATION.PASSWORD.MIN} символа.`
        );
        canSubmit = false;
      } else if (newPassword !== confirmNewPassword) {
        setPasswordError("Новите пароли не съвпадат.");
        canSubmit = false;
      }
    }

    // --- Check hook-based errors ---
    if (usernameHookError || (emailHookError && finalTrimmedEmail)) {
      canSubmit = false;
    }
    if (isCheckingUsername || (isCheckingEmail && finalTrimmedEmail)) {
      setFormSubmitError(
        "Проверката за уникалност все още е в ход. Моля изчакайте."
      );
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
      expert_categories: expertCategoryIds, // NEW
      managed_categories: managedCategoryIds, // NEW
    };
    if (!isEditing) formDataObject.password = password;
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
  if (propsRolesError || categoriesError)
    return (
      <div className="p-4 text-center text-red-500">
        Грешка при зареждане на данни:{" "}
        {propsRolesError?.message ||
          categoriesError?.message ||
          "Неизвестна грешка"}
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
            }}
            usernameError={usernameError || usernameHookError?.message} // Combine errors
            isCheckingUsername={isCheckingUsername}
            fullName={fullName}
            setFullName={(v) => {
              setFullName(v);
              setNameError(null);
            }}
            nameError={nameError} // Pass new error prop
            email={email}
            setEmail={(v) => {
              setEmail(v);
              setEmailError(null);
            }}
            emailError={emailError || emailHookError?.message} // Combine errors
            isCheckingEmail={isCheckingEmail}
            isEmailFormatCurrentlyValid={isEmailFormatCurrentlyValid}
            trimmedDebouncedEmail={trimmedDebouncedEmail}
            position={position}
            setPosition={setPosition}
            roleId={roleId}
            onRoleChange={handleRoleChange} // CHANGED: Pass the new handler
            roles={filteredRoles}
            financialApprover={financialApprover}
            setFinancialApprover={setFinancialApprover}
            errorPlaceholderClass={errorPlaceholderClass}
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

          {canManageCategories && (
            <>
              <CategorySelectionDropdown
                label="Експерт в категории"
                allCategories={activeCategories}
                selectedCategoryIds={expertCategoryIds}
                onSelectionChange={setExpertCategoryIds}
                isLoading={categoriesLoading}
                errorPlaceholderClass={errorPlaceholderClass}
                disabled={!isAdmin} // ADDED: Disable if not an admin
              />
              <CategorySelectionDropdown
                label="Менажира категории"
                allCategories={activeCategories}
                selectedCategoryIds={managedCategoryIds}
                onSelectionChange={setManagedCategoryIds}
                isLoading={categoriesLoading}
                errorPlaceholderClass={errorPlaceholderClass}
                disabled={!isAdmin} // ADDED: Disable if not an admin
              />
            </>
          )}

          <PasswordFields
            isEditing={isEditing}
            password={password}
            setPassword={(v) => {
              setPassword(v);
              setPasswordError(null);
            }}
            confirmPassword={confirmPassword}
            setConfirmPassword={(v) => {
              setConfirmPassword(v);
              setPasswordError(null);
            }}
            newPassword={newPassword}
            setNewPassword={(v) => {
              setNewPassword(v);
              setPasswordError(null);
            }}
            confirmNewPassword={confirmNewPassword}
            setConfirmNewPassword={(v) => {
              setConfirmNewPassword(v);
              setPasswordError(null);
            }}
            passwordError={passwordError} // Pass new error prop
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
