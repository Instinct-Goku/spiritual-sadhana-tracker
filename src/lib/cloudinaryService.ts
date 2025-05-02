
/**
 * Cloudinary image upload service
 */

const CLOUDINARY_CLOUD_NAME = "techrager-blogspot-com";
const CLOUDINARY_API_KEY = "265992398755936";
const CLOUDINARY_UPLOAD_PRESET = "upload_profile_img";

interface UploadOptions {
  mobileNumber?: string;
  email?: string;
}

/**
 * Uploads an image to Cloudinary
 * @param file The image file to upload
 * @param options Options for customizing the upload (mobileNumber and email)
 * @returns Promise with the upload result containing the secure URL
 */
export const uploadImageToCloudinary = async (file: File, options?: UploadOptions): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", CLOUDINARY_API_KEY);
    
    // Specify folder for storage
    formData.append("folder", "profile_photos");
    
    // Custom filename using mobile number and first 4 chars of email if provided
    if (options?.mobileNumber) {
      let customFilename = options.mobileNumber;
      
      // Append email prefix if available
      if (options.email && options.email.length >= 4) {
        customFilename += '_' + options.email.substring(0, 4);
      }
      
      formData.append("public_id", customFilename);
    }
    
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
