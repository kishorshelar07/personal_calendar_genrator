const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserCalendar = require('../models/UserCalendar');

const SAFE_FIELDS = '-usr_pass';

exports.getStats = async (req, res) => {
  try {
    const [total, active, inactive, admins, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ usr_status: 1 }),
      User.countDocuments({ usr_status: 0 }),
      User.countDocuments({ usr_type: 'Admin' }),
      User.find({}, SAFE_FIELDS).sort({ usr_reg_date_time: -1 }).limit(5)
    ]);
    res.json({ total, active, inactive, admins, recentUsers });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = req.user.usr_type === 'Admin'
      ? await User.find({}, SAFE_FIELDS).sort({ usr_reg_date_time: -1 })
      : await User.find({ usr_id: req.user.usr_id }, SAFE_FIELDS);
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { usr_id } = req.params;
    if (req.user.usr_type !== 'Admin' && req.user.usr_id !== usr_id)
      return res.status(403).json({ message: 'Access denied.' });
    const user = await User.findOne({ usr_id }, SAFE_FIELDS);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { usr_id, usr_name, usr_pass, usr_email, usr_dob, usr_gender, usr_type, usr_status, usr_remarks } = req.body;
    if (!usr_id || !usr_name || !usr_pass || !usr_email || !usr_dob)
      return res.status(400).json({ message: 'Required fields missing.' });
    if (!/^\d{10}$/.test(usr_id))
      return res.status(400).json({ message: 'Mobile number must be 10 digits.' });
    if (await User.findOne({ usr_id }))
      return res.status(409).json({ message: 'User ID already exists.' });

    await User.create({
      usr_id, usr_name, usr_pass: await bcrypt.hash(usr_pass, 10),
      usr_email, usr_dob, usr_gender: usr_gender || '',
      usr_type: usr_type || 'User',
      usr_status: usr_status !== undefined ? Number(usr_status) : 0,
      usr_remarks: usr_remarks || ''
    });
    res.status(201).json({ message: 'User created successfully.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { usr_id } = req.params;
    if (req.user.usr_type !== 'Admin' && req.user.usr_id !== usr_id)
      return res.status(403).json({ message: 'Access denied.' });

    const update = { ...req.body };
    delete update.usr_id;
    if (update.usr_pass?.trim()) {
      update.usr_pass = await bcrypt.hash(update.usr_pass, 10);
    } else {
      delete update.usr_pass;
    }
    if (req.user.usr_type !== 'Admin') {
      delete update.usr_type;
      delete update.usr_status;
    }

    const updated = await User.findOneAndUpdate({ usr_id }, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated successfully.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { usr_id } = req.params;
    if (req.user.usr_id === usr_id)
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    const deleted = await User.findOneAndDelete({ usr_id });
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    await UserCalendar.deleteMany({ usr_id });
    res.json({ message: 'User and related data deleted.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { usr_id } = req.params;
    const user = await User.findOne({ usr_id });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.usr_status = user.usr_status === 1 ? 0 : 1;
    await user.save();
    res.json({ message: `User ${user.usr_status === 1 ? 'activated' : 'deactivated'}.`, usr_status: user.usr_status });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.body;
    const rx = new RegExp(query, 'i');
    const filter = req.user.usr_type === 'Admin'
      ? { $or: [{ usr_id: rx }, { usr_name: rx }, { usr_email: rx }] }
      : { usr_id: req.user.usr_id };
    res.json(await User.find(filter, SAFE_FIELDS));
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};
