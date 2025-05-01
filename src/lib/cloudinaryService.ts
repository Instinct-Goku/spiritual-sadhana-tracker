
/**
 * Cloudinary image upload service
 */

const CLOUDINARY_CLOUD_NAME = "lovable";
const CLOUDINARY_API_KEY = "265992398755936";
const CLOUDINARY_UPLOAD_PRESET = "profile_photos";

/**
 * Uploads an image to Cloudinary
 * @param file The image file to upload
 * @returns Promise with the upload result containing the secure URL
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", CLOUDINARY_API_KEY);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error("Image upload failed");
    }
    
    const data = await response.json();
    return data.secure_url;
    
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
