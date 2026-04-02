const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  usr_id:            { type: String, required: true, unique: true, trim: true, maxlength: 10 },
  usr_name:          { type: String, required: true, trim: true, maxlength: 35 },
  usr_pass:          { type: String, required: true },
  usr_status:        { type: Number, enum: [0, 1], default: 0 },
  usr_type:          { type: String, enum: ['Admin', 'User'], default: 'User' },
  usr_dob:           { type: Date, required: true },
  usr_email:         { type: String, required: true, trim: true, maxlength: 50 },
  usr_gender:        { type: String, trim: true, default: '' },
  usr_reg_date_time: { type: Date, default: Date.now },
  usr_remarks:       { type: String, maxlength: 160, default: '' }
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema, 'users');
