const UserCalendar = require('../models/UserCalendar');

const findCal = async (id) => {
  if (/^[0-9a-fA-F]{24}$/.test(id)) return UserCalendar.findById(id);
  const n = Number(id);
  if (!isNaN(n)) return UserCalendar.findOne({ uc_no: n });
  return null;
};

exports.getStats = async (req, res) => {
  try {
    const [total, byType, recent] = await Promise.all([
      UserCalendar.countDocuments(),
      UserCalendar.aggregate([{ $group: { _id: '$uc_calendar_type', count: { $sum: 1 } } }]),
      UserCalendar.find({}).sort({ created_at: -1 }).limit(5)
    ]);
    res.json({ total, byType, recent });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filter = req.user.usr_type === 'Admin' ? {} : { usr_id: req.user.usr_id };
    res.json(await UserCalendar.find(filter).sort({ created_at: -1 }));
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const cal = await findCal(req.params.id);
    if (!cal) return res.status(404).json({ message: 'Calendar not found.' });
    if (req.user.usr_type !== 'Admin' && cal.usr_id !== req.user.usr_id)
      return res.status(403).json({ message: 'Access denied.' });
    res.json(cal);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.user.usr_type !== 'Admin') data.usr_id = req.user.usr_id;
    const cal = await UserCalendar.create(data);
    res.status(201).json({ message: 'Calendar created.', calendar: cal });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const cal = await findCal(req.params.id);
    if (!cal) return res.status(404).json({ message: 'Calendar not found.' });
    if (req.user.usr_type !== 'Admin' && cal.usr_id !== req.user.usr_id)
      return res.status(403).json({ message: 'Access denied.' });
    const update = { ...req.body };
    delete update.uc_no;
    Object.assign(cal, update);
    await cal.save();
    res.json({ message: 'Calendar updated.', calendar: cal });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const cal = await findCal(req.params.id);
    if (!cal) return res.status(404).json({ message: 'Calendar not found.' });
    if (req.user.usr_type !== 'Admin' && cal.usr_id !== req.user.usr_id)
      return res.status(403).json({ message: 'Access denied.' });
    await UserCalendar.findByIdAndDelete(cal._id);
    res.json({ message: 'Calendar deleted.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
};
