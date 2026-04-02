const mongoose = require('mongoose');

const userCalendarSchema = new mongoose.Schema({
  uc_no:               { type: Number, unique: true },
  usr_id:              { type: String, ref: 'User', required: true },
  uc_msg:              { type: String, maxlength: 100, default: '' },
  uc_date_event_csv:   { type: String, default: '' },
  uc_event_details_csv:{ type: String, default: '' },
  uc_img_csv:          { type: String, default: '' },
  uc_num_page:         { type: Number, enum: [1, 3, 12], default: 1 },
  uc_start_date:       { type: Date },
  uc_end_date:         { type: Date },
  uc_calendar_type:    { type: String, enum: ['template_1','template_2','template_3'], default: 'template_1' },
  uc_page_header:      { type: String, maxlength: 100, default: '' },
  uc_page_footer:      { type: String, maxlength: 100, default: '' },
  uc_remarks:          { type: String, maxlength: 100, default: '' },
  created_at:          { type: Date, default: Date.now }
}, { versionKey: false });

userCalendarSchema.pre('save', async function (next) {
  if (this.isNew) {
    const last = await this.constructor.findOne({}, {}, { sort: { uc_no: -1 } });
    this.uc_no = last ? last.uc_no + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('UserCalendar', userCalendarSchema, 'user_calendars');
