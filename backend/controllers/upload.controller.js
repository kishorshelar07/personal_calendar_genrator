const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');
const multer = require('multer');
const UserCalendar = require('../models/UserCalendar');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Auto-create uploads folder if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('📁 Created uploads directory');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, _file, cb) => {
    const prefix = (req.user?.usr_id || 'user').substring(0, 6);
    const hex    = crypto.randomBytes(2).toString('hex');
    cb(null, `${prefix}_${hex}.jpg`);
  }
});

const uploader = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, JPG, WEBP images are allowed.'));
  },
  limits: { files: 20, fileSize: 10 * 1024 * 1024 }
});

// Promisify multer so errors can be caught with try/catch
const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    uploader.array('images', 20)(req, res, err => (err ? reject(err) : resolve()));
  });

exports.uploadImages = async (req, res) => {
  try {
    await runMulter(req, res);

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files received. Please select at least one image.' });

    const newFiles   = req.files.map(f => f.filename);
    const calendarId = req.body.calendarId;

    if (calendarId) {
      let cal = /^[0-9a-fA-F]{24}$/.test(calendarId)
        ? await UserCalendar.findById(calendarId)
        : await UserCalendar.findOne({ uc_no: Number(calendarId) });

      if (cal) {
        const existing = cal.uc_img_csv
          ? cal.uc_img_csv.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        if (existing.length + newFiles.length > 24) {
          newFiles.forEach(fn => {
            const fp = path.join(UPLOADS_DIR, fn);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
          });
          return res.status(400).json({
            message: `Exceeds 24-image limit. Current: ${existing.length}, uploading: ${newFiles.length}`
          });
        }

        cal.uc_img_csv = [...existing, ...newFiles].join(', ');
        await cal.save();

        return res.json({
          message: `${newFiles.length} image(s) uploaded!`,
          uploaded_files: newFiles,
          updated_uc_img_csv: cal.uc_img_csv
        });
      }
    }

    return res.json({
      message: `${newFiles.length} image(s) uploaded!`,
      uploaded_files: newFiles,
      updated_uc_img_csv: newFiles.join(', ')
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    if (err instanceof multer.MulterError) {
      const msgs = {
        LIMIT_FILE_SIZE:  'File too large. Max 10 MB per image.',
        LIMIT_FILE_COUNT: 'Too many files. Max 20 at once.'
      };
      return res.status(400).json({ message: msgs[err.code] || err.message });
    }
    return res.status(500).json({ message: err.message || 'Upload failed.' });
  }
};

exports.getImage = (req, res) => {
  const fp = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ message: 'Image not found.' });
  res.sendFile(fp);
};

exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const calendarId   = req.body.calendarId;

    if (calendarId) {
      const cal = /^[0-9a-fA-F]{24}$/.test(calendarId)
        ? await UserCalendar.findById(calendarId)
        : await UserCalendar.findOne({ uc_no: Number(calendarId) });

      if (cal) {
        const imgs = cal.uc_img_csv
          ? cal.uc_img_csv.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        cal.uc_img_csv = imgs.filter(i => i !== filename).join(', ');
        await cal.save();
      }
    }

    const fp = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);

    res.json({ message: 'Image deleted.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete image.' });
  }
};
