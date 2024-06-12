import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File path not found");
      return null;
    }

    // Ensure file exists
    if (!fs.existsSync(localFilePath)) {
      console.log(`File not found: ${localFilePath}`);
      return null;
    }

    // Upload file to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    

    // Delete the file after uploading
    fs.unlinkSync(localFilePath);
    
    return uploadResponse;
  } catch (error) {
    console.error('Error during upload:', error);

    // Delete the file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return null;
  }
};

export default uploadOnCloudinary;
