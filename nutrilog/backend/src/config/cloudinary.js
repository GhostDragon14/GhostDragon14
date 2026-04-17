const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'nutrilog/progress-photos', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }] },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'nutrilog/avatars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }] },
});

const uploadPhoto = multer({ storage: photoStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { cloudinary, uploadPhoto, uploadAvatar };
