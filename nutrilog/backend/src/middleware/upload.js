const { uploadPhoto, uploadAvatar } = require('../config/cloudinary');

const handleUploadError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max size is 10MB.' });
  }
  next(err);
};

module.exports = { uploadPhoto, uploadAvatar, handleUploadError };
