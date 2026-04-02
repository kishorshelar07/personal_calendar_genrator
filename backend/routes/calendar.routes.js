const express = require('express');
const r = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const c = require('../controllers/calendar.controller');

r.use(auth);
r.get('/stats', role, c.getStats);
r.get('/', c.getAll);
r.get('/:id', c.getById);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);

module.exports = r;
