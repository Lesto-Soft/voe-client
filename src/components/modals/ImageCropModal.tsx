import React, { useState, useCallback } from "react";
import Cropper, { Point, Area } from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage"; // Adjust path

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null; // The image data URL to crop
  onCropComplete: (croppedBlob: Blob | null) => void; // Callback with result
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixelsResult: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsResult);
    },
    []
  );

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      onCropComplete(null); // Indicate failure or cancellation
      onClose();
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob); // Send the result back
      onClose(); // Close the modal
    } catch (e) {
      console.error("Error cropping image:", e);
      onCropComplete(null); // Indicate failure
      onClose();
    }
  };

  const handleCancel = () => {
    onCropComplete(null); // Indicate cancellation
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    // Basic Modal Structure (use your existing modal or a library like Radix UI)
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="relative h-[70vh] w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">Изрежете Аватар</h3>
        <div className="relative h-[calc(100%-120px)] w-full">
          {/* Cropper Component */}
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1 / 1} // Square aspect ratio for avatar
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
            cropShape="round" // Optional: makes the crop area visually round
            showGrid={false} // Optional: hide grid lines
          />
        </div>
        {/* Controls (Zoom Slider) */}
        <div className="mt-4 flex items-center gap-4">
          <label htmlFor="zoom" className="text-sm">
            Приближение:
          </label>
          <input
            id="zoom"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500"
          />
        </div>
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Отказ
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Потвърди
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
