const express = require('express');
const r = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const u = require('../controllers/user.controller');

r.use(auth);
r.get('/stats', role, u.getStats);
r.post('/search', u.searchUsers);
r.get('/', u.getAllUsers);
r.get('/:usr_id', u.getUserById);
r.post('/', role, u.addUser);
r.put('/:usr_id', u.updateUser);
r.patch('/:usr_id/toggle-status', role, u.toggleStatus);
r.delete('/:usr_id', role, u.deleteUser);

module.exports = r;
