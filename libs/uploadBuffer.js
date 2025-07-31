// libs/uploadBuffer.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const uploadBuffer = (fileBuffer, folder, filename) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
