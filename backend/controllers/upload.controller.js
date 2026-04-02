const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const UserCalendar = require('../models/UserCalendar');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOADS_DIR),
  filename: (req, _, cb) => {
    const prefix = req.user.usr_id.substring(0, 6);
    const hex = crypto.randomBytes(2).toString('hex');
    cb(null, `${prefix}_${hex}.jpg`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPEG/PNG images allowed.'), ok);
  },
  limits: { files: 20, fileSize: 5 * 1024 * 1024 }
});

exports.uploadImages = [
  upload.array('images', 20),
  async (req, res) => {
    try {
      if (!req.files?.length) return res.status(400).json({ message: 'No files received.' });

      const { calendarId } = req.body;
      const newFiles = req.files.map(f => f.filename);

      if (calendarId) {
        let cal;
        if (/^[0-9a-fA-F]{24}$/.test(calendarId)) cal = await UserCalendar.findById(calendarId);
        else cal = await UserCalendar.findOne({ uc_no: Number(calendarId) });

        if (cal) {
          const existing = cal.uc_img_csv ? cal.uc_img_csv.split(',').map(s => s.trim()).filter(Boolean) : [];
          if (existing.length + newFiles.length > 24)
            return res.status(400).json({ message: `Exceeds 24 image limit. Current: ${existing.length}` });
          cal.uc_img_csv = [...existing, ...newFiles].join(', ');
          await cal.save();
        }
      }

      res.json({ message: `${newFiles.length} image(s) uploaded.`, uploaded_files: newFiles });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Upload failed.' });
    }
  }
];

exports.getImage = (req, res) => {
  const fp = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ message: 'Image not found.' });
  res.sendFile(fp);
};

exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const { calendarId } = req.body;

    if (calendarId) {
      let cal;
      if (/^[0-9a-fA-F]{24}$/.test(calendarId)) cal = await UserCalendar.findById(calendarId);
      else cal = await UserCalendar.findOne({ uc_no: Number(calendarId) });
      if (cal) {
        const imgs = cal.uc_img_csv ? cal.uc_img_csv.split(',').map(s => s.trim()).filter(Boolean) : [];
        cal.uc_img_csv = imgs.filter(i => i !== filename).join(', ');
        await cal.save();
      }
    }

    const fp = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);

    res.json({ message: 'Image deleted.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};
