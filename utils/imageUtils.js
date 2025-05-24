import * as ImageManipulator from "expo-image-manipulator";

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
