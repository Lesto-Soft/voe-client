// src/utils/fileCompression.ts
import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";

/**
 * Checks if the file type allows for compression.
 */
const isCompressibleImage = (file: File): boolean => {
  return /image\/(jpeg|png|webp)/i.test(file.type);
};

const isPDF = (file: File): boolean => {
  return file.type === "application/pdf";
};

/**
 * Compresses an image file using browser-image-compression.
 */
const compressImage = async (
  file: File,
  targetSizeMB: number
): Promise<File> => {
  const options = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as string,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Image compression failed, returning original:", error);
    return file;
  }
};

/**
 * Attempts to optimize a PDF file.
 */
const compressPdf = async (file: File): Promise<File> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Оптимизация на структурата
    const compressedBytes = await pdfDoc.save({ useObjectStreams: false });

    if (compressedBytes.byteLength < file.size) {
      return new File([new Uint8Array(compressedBytes)], file.name, {
        type: "application/pdf",
        lastModified: Date.now(),
      });
    }

    return file;
  } catch (error) {
    console.warn("PDF optimization failed, returning original:", error);
    return file;
  }
};

/**
 * Main utility function to handle file compression based on type.
 * @param file The file to compress.
 * @param targetSizeMB The desired maximum size in MB.
 */
export const compressFile = async (
  file: File,
  targetSizeMB: number
): Promise<File> => {
  const targetSizeBytes = targetSizeMB * 1024 * 1024;

  // 1. Ако файлът е вече под целта, го връщаме веднага
  if (file.size <= targetSizeBytes) {
    return file;
  }

  console.info(
    `Attempting to compress ${
      file.name
    } to under ${targetSizeMB} MB (Current: ${(file.size / 1024 / 1024).toFixed(
      2
    )} MB)...`
  );

  // 2. Логика според типа
  if (isCompressibleImage(file)) {
    return await compressImage(file, targetSizeMB);
  } else if (isPDF(file)) {
    // PDF компресията е "best effort", подаваме я за консистенция
    return await compressPdf(file);
  }

  return file;
};
