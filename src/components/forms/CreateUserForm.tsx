import React, { useState, useEffect, useRef, useCallback } from "react";
import { Role } from "../../page/UserManagementPage"; // Adjust path if needed
import UserAvatar from "../cards/UserAvatar"; // Import the UserAvatar component
import ImageCropModal from "../modals/ImageCropModal";

// --- Interfaces ---
interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
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

// --- Helper Function ---
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string)?.split(",")[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error("Не може да се прочете файла като base64."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// --- Component ---
const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onClose,
  initialData = null,
  submitButtonText = "Създай",
  roles = [],
  rolesLoading = false,
  rolesError = null,
}) => {
  // --- State ---
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [role, setRoleId] = useState("");

  // Avatar State
  const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(
    null
  ); // Store original
  const [finalCroppedBlob, setFinalCroppedBlob] = useState<Blob | null>(null); // Store the cropped result
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // Now holds existing URL or Cropped Blob URL
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null); // Data URL for cropper

  // --- Constants ---
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- Effect for Initial Data ---
  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.name || "");
      setEmail(initialData.email || "");
      setPosition(initialData.position || "");
      setPassword("");
      setConfirmPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setRoleId(initialData.role?._id || "");

      // Set initial avatar preview from existing data
      const currentAvatarUrl = initialData.avatar
        ? `${serverBaseUrl}/static/avatars/${initialData._id}/${initialData.avatar}`
        : null;
      setAvatarPreview(currentAvatarUrl); // This is the initial display

      // Reset crop/file state
      // setAvatarFile(null); // Keep original? Maybe not needed now
      setOriginalAvatarFile(null);
      setFinalCroppedBlob(null);
      setIsRemovingAvatar(false);
      setImageToCrop(null);
      setIsCropModalOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      // Reset form for creation
      setUsername("");
      setFullName("");
      setEmail("");
      setPosition("");
      setPassword("");
      setConfirmPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setRoleId("");
      // Reset avatar/crop state
      setAvatarPreview(null);
      // setAvatarFile(null);
      setOriginalAvatarFile(null);
      setFinalCroppedBlob(null);
      setIsRemovingAvatar(false);
      setImageToCrop(null);
      setIsCropModalOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [initialData, serverBaseUrl]); // Removed defaultAvatarPath dependency

  // --- Avatar Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalAvatarFile(file); // Store the original file
      // setAvatarFile(file); // Maybe not needed now
      setIsRemovingAvatar(false); // Reset removal flag
      setFinalCroppedBlob(null); // Reset previous crop result
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string); // Set image for cropper modal
        setIsCropModalOpen(true); // Open the cropper modal
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback from ImageCropModal
  const handleCropComplete = useCallback(
    (croppedBlob: Blob | null) => {
      setImageToCrop(null); // Clear the image source for the cropper
      setIsCropModalOpen(false); // Close cropper modal

      if (croppedBlob) {
        console.log("Cropped Blob received:", croppedBlob);
        setFinalCroppedBlob(croppedBlob); // Store the cropped Blob
        // Create a temporary URL for previewing the cropped Blob
        const blobUrl = URL.createObjectURL(croppedBlob);
        setAvatarPreview(blobUrl); // Update the preview to show the cropped image
        console.log("Blob URL for preview:", blobUrl);

        // IMPORTANT: Revoke the object URL when the component unmounts
        // or when a new image/crop happens to avoid memory leaks.
        // Handled in a cleanup effect (see below).
      } else {
        // Crop was cancelled or failed, revert? Or do nothing?
        // Reset file input if cancelled
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setOriginalAvatarFile(null); // Clear stored original file if cancelled
        // Decide if you want to revert avatarPreview to initialData state here
        console.log("Crop cancelled or failed.");
      }
    },
    [] // No dependencies needed if it only calls setState
  );

  // Effect to clean up Blob URLs
  useEffect(() => {
    // Store the current preview URL
    const currentPreview = avatarPreview;

    // Return a cleanup function
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(currentPreview);
        console.log("Revoked Blob URL:", currentPreview);
      }
    };
  }, [avatarPreview]); // Run when avatarPreview changes

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    // setAvatarFile(null);
    setOriginalAvatarFile(null);
    setFinalCroppedBlob(null);
    setAvatarPreview(null); // Reset preview to null (will show initials)
    setIsRemovingAvatar(true); // Flag that avatar should be removed on submit
    setImageToCrop(null);
    setIsCropModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- Helper to convert Blob to Base64 ---
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string)?.split(",")[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Could not convert Blob to base64."));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  // --- Form Submission ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Validation
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

    // Prepare Core Data
    const formDataObject: any = {
      username,
      name: fullName,
      email: email || null,
      position: position || null,
      role: role || null,
    };
    if (!initialData) formDataObject.password = password;
    else if (newPassword) formDataObject.password = newPassword;

    // Prepare Avatar Data
    let avatarInputData: AvatarInputData | null | undefined = undefined; // undefined = no change

    if (finalCroppedBlob) {
      // Prioritize cropped blob
      try {
        const base64String = await blobToBase64(finalCroppedBlob);
        // Use original filename or generate a new one
        const filename = originalAvatarFile?.name
          ? `cropped_${originalAvatarFile.name}`
          : "cropped_avatar.png";
        avatarInputData = { filename: filename, file: base64String };
      } catch (error) {
        console.error("Error converting cropped blob to base64:", error);
        alert(
          `Грешка при обработка на изрязания аватар: ${
            error instanceof Error ? error.message : "Неизвестна грешка"
          }`
        );
        return; // Stop submission
      }
    } else if (isRemovingAvatar && initialData?._id) {
      avatarInputData = null; // Explicitly set to null for removal
    }

    // Call Parent Submit
    onSubmit(formDataObject, initialData?._id || null, avatarInputData);
  };

  // --- Render ---
  if (rolesLoading)
    return <div className="p-4 text-center">Зареждане на роли...</div>;
  if (rolesError)
    return (
      <div className="p-4 text-center text-red-500">
        Грешка: {rolesError.message}
      </div>
    );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* --- Input fields (Username, Full Name, Email, Position, Role) --- */}
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
              className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                !!initialData
                  ? "border-gray-300 bg-gray-100"
                  : "border-gray-300"
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
          {/* --- Role Input --- */}
          <div>
            {" "}
            {/* This div occupies one grid column */}
            <label
              htmlFor="role"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
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
                  {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {/* --- Avatar Upload Section --- */}
          {/* Removed md:col-span-2 and mt-2 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Аватар
            </label>
            <div className="flex items-center gap-4">
              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                name="avatarFile" // Use a distinct name if needed
              />
              {/* Avatar Preview/Fallback */}
              <div className="cursor-pointer" onClick={handleAvatarClick}>
                <UserAvatar
                  name={fullName || username || "?"}
                  imageUrl={avatarPreview} // Shows existing or cropped preview
                  size={64}
                />
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="rounded bg-blue-500 px-3 py-1 text-xs text-white shadow-sm hover:bg-blue-600"
                >
                  {/* Text depends on whether *any* preview exists now */}
                  {avatarPreview ? "Смени" : "Качи"} Аватар
                </button>
                {/* Show remove only if there's a preview AND we're not already in removal state */}
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
                    Аватарът ще бъде премахнат.
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* --- Password Fields --- */}
          {!initialData ? (
            <>
              {" "}
              {/* Create Mode Passwords */}
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
          ) : (
            <>
              {" "}
              {/* Edit Mode Passwords */}
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
              </div>
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Потвърди нова парола
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Потвърди нова парола"
                />
              </div>
            </>
          )}
        </div>

        {/* --- Submit Button --- */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:cursor-pointer shover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {submitButtonText}
          </button>
        </div>
      </form>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          // Handle manual close (cancel)
          setIsCropModalOpen(false);
          setImageToCrop(null);
          // Reset file input if user cancels crop without confirming
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setOriginalAvatarFile(null);
          handleCropComplete(null); // Ensure parent knows it was cancelled
        }}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete} // Pass the callback
      />
    </>
  );
};

export default CreateUserForm;
