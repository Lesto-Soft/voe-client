import React, { useState, useRef } from "react";
import { IMe } from "../../../db/interfaces";
import AvatarUploadSection from "../../../components/forms/partials/AvatarUploadSection";
import UserInputFields from "../../../components/forms/partials/UserInputFields";
import PasswordFields from "../../../components/forms/partials/PasswordFields";
import ImageCropModal from "../../../components/modals/ImageCropModal";
import getCroppedImg from "../../../utils/cropImage";

interface AccountSettingsProps {
  currentUser: IMe;
  isEditingSelf: boolean; // Flag to know if we're editing our own vs another user's profile
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  currentUser,
  isEditingSelf,
}) => {
  // This would ideally be a single state object, but separated for clarity in this mock
  const [fullName, setFullName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [position, setPosition] = useState(currentUser.position || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Avatar State
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";
  const [originalAvatarFile, setOriginalAvatarFile] = useState<File | null>(
    null
  );
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser.avatar
      ? `${serverBaseUrl}/static/avatars/${currentUser._id}/${currentUser.avatar}`
      : null
  );
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileInfoSave = () => {
    // TODO: Add validation
    console.log("Saving Profile Info:", { fullName, email, position });
    // Here you would call your `useUpdateUser` mutation
    alert("Информацията за профила е запазена (симулация).");
  };

  const handleChangePassword = () => {
    setPasswordError(null);
    if (newPassword.length > 0 && newPassword !== confirmNewPassword) {
      setPasswordError("Паролите не съвпадат.");
      return;
    }
    if (newPassword.length > 0 && newPassword.length < 6) {
      setPasswordError("Паролата трябва да е поне 6 символа.");
      return;
    }
    console.log("Changing password...");
    // Here you would call the `useUpdateUser` mutation with the new password
    alert("Паролата е сменена (симулация).");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleAvatarSave = () => {
    console.log("Saving avatar...", { croppedBlob, isRemovingAvatar });
    // Here you would call the `useUpdateUser` mutation with avatar data
    alert("Аватарът е запазен (симулация).");
  };

  // Avatar Handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
        setOriginalAvatarFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (imageToCrop && croppedAreaPixels) {
      const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setCroppedBlob(blob);
      setAvatarPreview(URL.createObjectURL(blob));
      setIsRemovingAvatar(false);
    }
    setIsCropModalOpen(false);
  };

  const handleRemoveAvatar = () => {
    setIsRemovingAvatar(true);
    setAvatarPreview(null);
    setCroppedBlob(null);
    setOriginalAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-10">
      {/* Profile Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Профилна информация
        </h2>
        <hr className="my-4 border-gray-200" />
        <div className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Име и фамилия
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border p-2 border-gray-300"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Имейл
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border p-2 border-gray-300"
            />
          </div>
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Позиция
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-md border p-2 border-gray-300"
            />
          </div>
        </div>
        <div className="text-right mt-6">
          <button
            onClick={handleProfileInfoSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
          >
            Запази промените
          </button>
        </div>
      </div>

      {/* Avatar Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Аватар</h2>
        <hr className="my-4 border-gray-200" />
        <AvatarUploadSection
          fullName={fullName}
          username={currentUser.username}
          avatarPreview={avatarPreview}
          isRemovingAvatar={isRemovingAvatar}
          onFileChange={handleFileChange}
          onAvatarClick={() => {}}
          onRemoveAvatar={handleRemoveAvatar}
          errorPlaceholderClass="mt-1 text-xs min-h-[1.2em]"
          avatarError={avatarError}
          fileInputRef={fileInputRef}
        />
        <div className="text-right mt-6">
          <button
            onClick={handleAvatarSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
          >
            Запази аватара
          </button>
        </div>
      </div>

      {/* Change Password */}
      {isEditingSelf && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Промяна на парола
          </h2>
          <hr className="my-4 border-gray-200" />
          <PasswordFields
            isEditing={true}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmNewPassword={confirmNewPassword}
            setConfirmNewPassword={setConfirmNewPassword}
            passwordError={passwordError}
            errorPlaceholderClass="mt-1 text-xs min-h-[1.2em]"
          />
          <div className="text-right mt-6">
            <button
              onClick={handleChangePassword}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={!newPassword}
            >
              Смени паролата
            </button>
          </div>
        </div>
      )}

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default AccountSettings;
