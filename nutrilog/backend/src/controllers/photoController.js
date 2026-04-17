const prisma = require('../config/database');
const { cloudinary } = require('../config/cloudinary');

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { date, note, weight } = req.body;
    const photo = await prisma.photo.create({
      data: {
        userId: req.user.id,
        url: req.file.path,
        publicId: req.file.filename,
        date: date ? new Date(date) : new Date(),
        note: note || null,
        weight: weight ? parseFloat(weight) : null,
      },
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const [photos, total] = await Promise.all([
      prisma.photo.findMany({ where: { userId: req.user.id }, orderBy: { date: 'desc' }, take: parseInt(limit), skip: parseInt(offset) }),
      prisma.photo.count({ where: { userId: req.user.id } }),
    ]);
    res.json({ photos, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get photos' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await prisma.photo.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    await cloudinary.uploader.destroy(photo.publicId);
    await prisma.photo.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
