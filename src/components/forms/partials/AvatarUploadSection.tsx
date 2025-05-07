// src/components/forms/partials/AvatarUploadSection.tsx
import React, { useRef } from "react";
import UserAvatar from "../../cards/UserAvatar"; // Adjust path

interface AvatarUploadSectionProps {
  fullName: string;
  username: string;
  avatarPreview: string | null;
  isRemovingAvatar: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarClick: () => void;
  onRemoveAvatar: () => void;
  errorPlaceholderClass: string;
  // Add t function if needed for button text/labels
}

const AvatarUploadSection: React.FC<AvatarUploadSectionProps> = ({
  fullName,
  username,
  avatarPreview,
  isRemovingAvatar,
  onFileChange,
  onAvatarClick,
  onRemoveAvatar,
  errorPlaceholderClass,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarAreaClick = () => {
    fileInputRef.current?.click();
    onAvatarClick(); // Notify parent if needed (e.g., for analytics)
  };

  const handleButtonClick = (action: "upload" | "remove") => {
    if (action === "upload") {
      fileInputRef.current?.click();
      onAvatarClick(); // Notify parent
    } else if (action === "remove") {
      onRemoveAvatar();
      // Reset file input value if remove is clicked
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Аватар
      </label>
      <div className="flex flex-wrap items-center gap-4">
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
          name="avatarFile" // Optional: Useful if submitting without JS
        />
        {/* Avatar Preview/Fallback */}
        <div
          className="cursor-pointer flex-shrink-0"
          onClick={handleAvatarAreaClick}
        >
          <UserAvatar
            name={fullName || username || "?"}
            imageUrl={avatarPreview}
            size={64}
          />
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-grow sm:flex-grow-0">
          <button
            type="button"
            onClick={() => handleButtonClick("upload")}
            className="rounded bg-blue-500 px-3 py-1 text-xs text-white shadow-sm hover:bg-blue-600"
          >
            {avatarPreview ? "Смени" : "Качи"} Аватар
          </button>
          {avatarPreview && !isRemovingAvatar && (
            <button
              type="button"
              onClick={() => handleButtonClick("remove")}
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
      <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
    </div>
  );
};

export default AvatarUploadSection;
