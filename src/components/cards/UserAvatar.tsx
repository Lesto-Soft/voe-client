import React, { useState, useEffect } from "react";

interface UserAvatarProps {
  name: string; // For initials calculation
  imageUrl: string | null | undefined; // Full URL to the image, or null/undefined if none
  size?: number; // Optional size in pixels (default: 32)
}

// Helper to get initials (you can keep this in UserManagementPage or move to utils)
const getInitials = (name: string): string => {
  const names = name?.split(" ") || [];
  let initials = "";
  if (names.length > 0 && names[0]) initials += names[0].charAt(0);
  if (names.length > 1 && names[1]) initials += names[1].charAt(0);
  return initials.toUpperCase() || "?"; // Fallback for empty name
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  size = 32,
}) => {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Reset error state if the image URL changes
  useEffect(() => {
    setImageLoadFailed(false);
  }, [imageUrl]);

  const handleImageError = () => {
    setImageLoadFailed(true);
  };

  const displayFallback = imageLoadFailed || !imageUrl;
  const initials = getInitials(name);
  const bgColor = "bg-gray-400"; // Get a consistent color

  const dimensionStyle = {
    width: `${size}px`,
    height: `${size}px`,
    lineHeight: `${size}px`, // Vertically center initials approximately
    fontSize: `${Math.max(10, Math.floor(size * 0.45))}px`, // Scale font size
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold overflow-hidden ${
        displayFallback ? bgColor : "bg-gray-200"
      }`} // Use dynamic bg or gray if image expected
      style={dimensionStyle}
      title={name} // Show full name on hover
    >
      {displayFallback ? (
        <span>{initials}</span>
      ) : (
        <img
          src={imageUrl || ""} // Pass the imageUrl
          alt={`${name}'s avatar`}
          className="h-full w-full object-cover" // Ensure image covers the area
          onError={handleImageError} // Set error state on failure
        />
      )}
    </div>
  );
};

export default UserAvatar;
