module.exports = (req, res, next) => {
  if (req.user?.usr_type !== 'Admin')
    return res.status(403).json({ message: 'Admin access required.' });
  next();
};
