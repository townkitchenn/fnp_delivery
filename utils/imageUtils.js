import * as ImageManipulator from "expo-image-manipulator";
import { API_BASE_URL } from "../config/apiConfig";
import { ensureHttps } from "./urlUtils";

export const compressImage = async (uri) => {
  try {
    const manipulateResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize to reasonable dimensions
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Compress by 50%
    );

    return {
      uri: manipulateResult.uri,
      type: "image/jpeg",
      name: "compressed_image.jpg",
    };
  } catch (error) {
    console.error("Image compression error:", error);
    throw error;
  }
};

// Utility function to handle both Base64 and HTTP URLs for image display
export const getImageSource = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's already a Base64 data URI, use it directly
  if (imageUrl.startsWith("data:image/")) {
    return { uri: imageUrl };
  }

  // If it's an HTTP URL, ensure it's HTTPS
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return { uri: ensureHttps(imageUrl) };
  }

  // If it's a relative path, construct the full URL
  return { uri: ensureHttps(`${API_BASE_URL}/${imageUrl}`) };
};
