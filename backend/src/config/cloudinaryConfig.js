import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with credentials from environment variables
// The CLOUDINARY_URL format is: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: cloudinaryUrl.hostname,
    api_key: cloudinaryUrl.username,
    api_secret: cloudinaryUrl.password,
  });
} else {
  console.warn('CLOUDINARY_URL is not set in environment variables');
}

export default cloudinary;

