const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { usr_id, usr_name, usr_pass, usr_email, usr_dob, usr_gender } = req.body;

    if (!usr_id || !usr_name || !usr_pass || !usr_email || !usr_dob)
      return res.status(400).json({ message: 'All required fields must be filled.' });

    if (!/^\d{10}$/.test(usr_id))
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });

    if (await User.findOne({ usr_id }))
      return res.status(409).json({ message: 'This mobile number is already registered.' });

    const usr_pass_hash = await bcrypt.hash(usr_pass, 10);
    await User.create({ usr_id, usr_name, usr_pass: usr_pass_hash, usr_email, usr_dob, usr_gender: usr_gender || '' });

    res.status(201).json({ message: 'Registration successful. Please wait for admin activation.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { usr_id, usr_dob, new_pass } = req.body;
    if (!usr_id || !usr_dob || !new_pass)
      return res.status(400).json({ message: 'Mobile number, date of birth and new password are required.' });

    const user = await User.findOne({ usr_id });
    if (!user) return res.status(404).json({ message: 'No account found with this mobile number.' });

    // Verify DOB matches
    const storedDob = new Date(user.usr_dob).toISOString().substring(0, 10);
    const inputDob  = new Date(usr_dob).toISOString().substring(0, 10);
    if (storedDob !== inputDob)
      return res.status(401).json({ message: 'Date of birth does not match our records.' });

    if (new_pass.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    user.usr_pass = await bcrypt.hash(new_pass, 10);
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch {
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { usr_id, usr_pass } = req.body;
    if (!usr_id || !usr_pass)
      return res.status(400).json({ message: 'Mobile number and password are required.' });

    const user = await User.findOne({ usr_id });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    if (user.usr_status !== 1) return res.status(403).json({ message: 'Account is inactive. Contact admin.' });

    if (!(await bcrypt.compare(usr_pass, user.usr_pass)))
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { usr_id: user.usr_id, usr_name: user.usr_name, usr_type: user.usr_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, usr_id: user.usr_id, usr_name: user.usr_name, usr_type: user.usr_type });
  } catch {
    res.status(500).json({ message: 'Server error during login.' });
  }
};
