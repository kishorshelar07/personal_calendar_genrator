const express = require('express');
const r = express.Router();
const auth = require('../middleware/auth.middleware');
const up = require('../controllers/upload.controller');

r.post('/images', auth, up.uploadImages);
r.delete('/file/:filename', auth, up.deleteImage);
r.get('/:filename', up.getImage);

module.exports = r;
