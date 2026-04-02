// auth.routes.js
const express = require('express');
const r = express.Router();
const auth = require('../controllers/auth.controller');
r.post('/register', auth.register);
r.post('/login', auth.login);
module.exports = r;
