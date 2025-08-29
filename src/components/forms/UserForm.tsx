// src/components/forms/UserForm.tsx
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
import CategorySelectionDropdown from "./partials/CategorySelectionDropdown";
import { IUser, IMe } from "../../db/interfaces";
import { useGetActiveCategories } from "../../graphql/hooks/category";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import { useCurrentUser } from "../../context/UserContext";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const VALIDATION = {
  USERNAME: { MIN: 3, MAX: 25 },
  PASSWORD: { MIN: 6, MAX: 15 },
  NAME: { MIN: 3, MAX: 50 },
  POSITION: { MIN: 3, MAX: 50 },
  EMAIL: { MAX: 50 },
};

const MAX_AVATAR_SIZE_MB = 3;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

interface UserFormProps {
  onSubmit: (
    formData: any,
    editingUserId: string | null,
    avatarData: File | null | undefined
  ) => void;
  onClose: () => void;
  initialData: IUser | null;
  submitButtonText: string;
  roles: Role[];
  rolesLoading: boolean;
  rolesError: any;
  isAdmin: boolean;
}

const isValidEmailFormat = (emailToTest: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToTest);

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
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

  const [initialExpertCategories, setInitialExpertCategories] = useState<
    string[]
  >([]);
  const [initialManagedCategories, setInitialManagedCategories] = useState<
    string[]
  >([]);

  const filteredRoles = useMemo(() => {
    if (currentUser?.role?._id !== ROLES.ADMIN) {
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
  const [positionError, setPositionError] = useState<string | null>(null);
  const [submitEmailError, setSubmitEmailError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isExpertConfirmOpen, setIsExpertConfirmOpen] = useState(false); // add state for dialog

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCompletedRef = useRef<boolean>(false);
  // add ref to hold form data while dialog is open
  const pendingSubmitData = useRef<{
    formData: any;
    editingUserId: string | null;
    avatarData: File | null | undefined;
  } | null>(null);

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

  const handleRoleChange = (newRoleId: string) => {
    const oldRoleIsPrivileged = canManageCategories;
    const newRoleIsPrivileged =
      newRoleId === ROLES.ADMIN || newRoleId === ROLES.EXPERT;
    if (!oldRoleIsPrivileged && newRoleIsPrivileged) {
      setExpertCategoryIds(initialExpertCategories);
      setManagedCategoryIds(initialManagedCategories);
    } else if (oldRoleIsPrivileged && !newRoleIsPrivileged) {
      setExpertCategoryIds([]);
      setManagedCategoryIds([]);
    }
    setRoleId(newRoleId);
    setRoleError(null);
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

  const handleConfirmExpertSubmit = () => {
    if (pendingSubmitData.current) {
      const { formData, editingUserId, avatarData } = pendingSubmitData.current;
      onSubmit(formData, editingUserId, avatarData);
    }
    setIsExpertConfirmOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitError(null);
    setNameError(null);
    setPasswordError(null);
    setPositionError(null);
    setSubmitEmailError(null);
    setRoleError(null);

    let canSubmit = true;

    if (usernameError || emailError) {
      canSubmit = false;
    }

    const finalTrimmedUsername = username.trim();
    const finalTrimmedName = fullName.trim();
    const finalTrimmedEmail = email.trim();
    const finalTrimmedPosition = position.trim();

    if (!finalTrimmedUsername) {
      setUsernameError("Потребителското име е задължително.");
      canSubmit = false;
    } else if (finalTrimmedUsername.length < VALIDATION.USERNAME.MIN) {
      setUsernameError(
        `Потребителското име трябва да е поне ${VALIDATION.USERNAME.MIN} символа.`
      );
      canSubmit = false;
    } else if (finalTrimmedUsername.length > VALIDATION.USERNAME.MAX) {
      setUsernameError(
        `Потребителското име не може да бъде по-дълго от ${VALIDATION.USERNAME.MAX} символа.`
      );
      canSubmit = false;
    }

    if (!finalTrimmedName) {
      setNameError("Името е задължително.");
      canSubmit = false;
    } else if (finalTrimmedName.length < VALIDATION.NAME.MIN) {
      setNameError(`Името трябва да е поне ${VALIDATION.NAME.MIN} символа.`);
      canSubmit = false;
    } else if (finalTrimmedName.length > VALIDATION.NAME.MAX) {
      setNameError(
        `Името не може да бъде по-дълго от ${VALIDATION.NAME.MAX} символа.`
      );
      canSubmit = false;
    }

    if (!roleId) {
      setRoleError("Ролята е задължителна.");
      canSubmit = false;
    }

    if (finalTrimmedEmail) {
      if (!isValidEmailFormat(finalTrimmedEmail)) {
        setSubmitEmailError("Невалиден имейл формат.");
        canSubmit = false;
      } else if (finalTrimmedEmail.length > VALIDATION.EMAIL.MAX) {
        setSubmitEmailError(
          `Имейлът не може да бъде по-дълъг от ${VALIDATION.EMAIL.MAX} символа.`
        );
        canSubmit = false;
      }
    }

    if (finalTrimmedPosition) {
      if (finalTrimmedPosition.length < VALIDATION.POSITION.MIN) {
        setPositionError(
          `Позицията трябва да е поне ${VALIDATION.POSITION.MIN} символа.`
        );
        canSubmit = false;
      } else if (finalTrimmedPosition.length > VALIDATION.POSITION.MAX) {
        setPositionError(
          `Позицията не може да бъде по-дълга от ${VALIDATION.POSITION.MAX} символа.`
        );
        canSubmit = false;
      }
    }

    if (!isEditing) {
      if (!password) {
        setPasswordError("Паролата е задължителна.");
        canSubmit = false;
      } else if (password.length < VALIDATION.PASSWORD.MIN) {
        setPasswordError(
          `Паролата трябва да е поне ${VALIDATION.PASSWORD.MIN} символа.`
        );
        canSubmit = false;
      } else if (password.length > VALIDATION.PASSWORD.MAX) {
        setPasswordError(
          `Паролата не може да бъде по-дълга от ${VALIDATION.PASSWORD.MAX} символа.`
        );
        canSubmit = false;
      } else if (password !== confirmPassword) {
        setPasswordError("Паролите не съвпадат.");
        canSubmit = false;
      }
    } else {
      if (newPassword) {
        if (newPassword.length < VALIDATION.PASSWORD.MIN) {
          setPasswordError(
            `Новата парола трябва да е поне ${VALIDATION.PASSWORD.MIN} символа.`
          );
          canSubmit = false;
        } else if (newPassword.length > VALIDATION.PASSWORD.MAX) {
          setPasswordError(
            `Новата парола не може да бъде по-дълга от ${VALIDATION.PASSWORD.MAX} символа.`
          );
          canSubmit = false;
        } else if (newPassword !== confirmNewPassword) {
          setPasswordError("Новите пароли не съвпадат.");
          canSubmit = false;
        }
      }
    }

    if (usernameHookError || emailHookError) {
      canSubmit = false;
    }
    if (isCheckingUsername || isCheckingEmail) {
      setFormSubmitError(
        "Проверката за уникалност все още е в ход. Моля изчакайте."
      );
      canSubmit = false;
    }

    if (!canSubmit) {
      if (
        !formSubmitError &&
        !usernameError &&
        !emailError &&
        !nameError &&
        !passwordError &&
        !positionError &&
        !submitEmailError &&
        !roleError
      ) {
        setFormSubmitError("Моля, коригирайте грешките във формата.");
      }
      return;
    }

    const formDataObject: any = {
      username: finalTrimmedUsername,
      name: fullName.trim(),
      email: finalTrimmedEmail || null,
      position: finalTrimmedPosition || null,
      role: roleId || null,
      financial_approver: financialApprover,
      expert_categories: expertCategoryIds,
      managed_categories: managedCategoryIds,
    };
    if (!isEditing) formDataObject.password = password;
    else if (newPassword) formDataObject.password = newPassword;

    let avatarFile: File | null | undefined = undefined;

    if (finalCroppedBlob) {
      const filename = originalAvatarFile?.name
        ? `cropped_${originalAvatarFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
        : "cropped_avatar.png";

      avatarFile = new File([finalCroppedBlob], filename, {
        type: finalCroppedBlob.type,
      });
    } else if (isRemovingAvatar && isEditing) {
      avatarFile = null;
    }

    // add the pre-submit check
    const isMisconfiguredExpert =
      roleId === ROLES.EXPERT &&
      expertCategoryIds.length === 0 &&
      managedCategoryIds.length === 0;

    if (isMisconfiguredExpert) {
      pendingSubmitData.current = {
        formData: formDataObject,
        editingUserId: initialData?._id || null,
        avatarData: avatarFile,
      };
      setIsExpertConfirmOpen(true);
      return; // Stop submission until user confirms
    }

    onSubmit(formDataObject, initialData?._id || null, avatarFile);
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
            usernameError={usernameError || usernameHookError?.message}
            isCheckingUsername={isCheckingUsername}
            fullName={fullName}
            setFullName={(v) => {
              setFullName(v);
              setNameError(null);
            }}
            nameError={nameError}
            email={email}
            setEmail={(v) => {
              setEmail(v);
              setEmailError(null);
              setSubmitEmailError(null);
            }}
            emailError={
              submitEmailError || emailError || emailHookError?.message
            }
            isCheckingEmail={isCheckingEmail}
            isEmailFormatCurrentlyValid={isEmailFormatCurrentlyValid}
            trimmedDebouncedEmail={trimmedDebouncedEmail}
            position={position}
            setPosition={(v) => {
              setPosition(v);
              setPositionError(null);
            }}
            positionError={positionError}
            roleId={roleId}
            onRoleChange={handleRoleChange}
            roleError={roleError}
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
                disabled={!isAdmin}
              />
              <CategorySelectionDropdown
                label="Менажира категории"
                allCategories={activeCategories}
                selectedCategoryIds={managedCategoryIds}
                onSelectionChange={setManagedCategoryIds}
                isLoading={categoriesLoading}
                errorPlaceholderClass={errorPlaceholderClass}
                disabled={!isAdmin}
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
            passwordError={passwordError}
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

      {/* add the dialog to the component's render output */}
      <ConfirmActionDialog
        isOpen={isExpertConfirmOpen}
        onOpenChange={setIsExpertConfirmOpen}
        onConfirm={handleConfirmExpertSubmit}
        title="Потвърждение за експерт"
        description={
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              Този потребител е с роля 'Експерт', но няма избрани категории, в
              които да е експерт или които да управлява.
              <br />
              <br />
              Сигурни ли сте, че искате да продължите?
            </div>
          </div>
        }
        confirmButtonText="Да, запази"
        isDestructiveAction={false}
      />
    </>
  );
};

export default UserForm;
