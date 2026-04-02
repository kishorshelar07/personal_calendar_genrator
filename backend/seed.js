/**
 * PCG — Database Seed Script
 * Run: node seed.js
 * Place this file inside: pcg/backend/
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User         = require('./models/User');
const UserCalendar = require('./models/UserCalendar');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dbcalendar';

// ─── Seed Data ───────────────────────────────────────────────────────────────

const USERS = [
  {
    usr_id:     '9999999999',
    usr_name:   'Super Admin',
    usr_pass:   'admin123',
    usr_status: 1,
    usr_type:   'Admin',
    usr_dob:    new Date('1990-01-15'),
    usr_email:  'admin@calendarpro.com',
    usr_gender: 'Male',
    usr_remarks:'Default admin account'
  },
  {
    usr_id:     '9876543210',
    usr_name:   'Rahul Sharma',
    usr_pass:   'rahul123',
    usr_status: 1,
    usr_type:   'User',
    usr_dob:    new Date('1995-05-20'),
    usr_email:  'rahul@example.com',
    usr_gender: 'Male',
    usr_remarks:'Test user 1'
  },
  {
    usr_id:     '8765432109',
    usr_name:   'Priya Patil',
    usr_pass:   'priya123',
    usr_status: 1,
    usr_type:   'User',
    usr_dob:    new Date('1998-08-12'),
    usr_email:  'priya@example.com',
    usr_gender: 'Female',
    usr_remarks:'Test user 2'
  },
  {
    usr_id:     '7654321098',
    usr_name:   'Amit Desai',
    usr_pass:   'amit123',
    usr_status: 0,             // Inactive — admin ne activate karava lagel
    usr_type:   'User',
    usr_dob:    new Date('1993-11-30'),
    usr_email:  'amit@example.com',
    usr_gender: 'Male',
    usr_remarks:'Inactive user example'
  },
  {
    usr_id:     '6543210987',
    usr_name:   'Sneha Joshi',
    usr_pass:   'sneha123',
    usr_status: 1,
    usr_type:   'User',
    usr_dob:    new Date('2000-03-07'),
    usr_email:  'sneha@example.com',
    usr_gender: 'Female',
    usr_remarks:'Test user 4'
  }
];

const CALENDARS = [
  {
    usr_id:               '9876543210',
    uc_msg:               'Rahul Family Calendar 2025',
    uc_date_event_csv:    '2025/01/26, 2025/08/15, 2025/10/02',
    uc_event_details_csv: 'Republic Day, Independence Day, Gandhi Jayanti',
    uc_img_csv:           '',
    uc_num_page:          1,
    uc_start_date:        new Date('2025-01-01'),
    uc_end_date:          new Date('2025-12-31'),
    uc_calendar_type:     'template_1',
    uc_page_header:       'Sharma Family 2025',
    uc_page_footer:       'Made with CalendarPro ❤️',
    uc_remarks:           '1-page full year calendar'
  },
  {
    usr_id:               '9876543210',
    uc_msg:               'Monthly Planner 2025',
    uc_date_event_csv:    '2025/02/14, 2025/05/20, 2025/12/25',
    uc_event_details_csv: 'Valentines Day, Birthday, Christmas',
    uc_img_csv:           '',
    uc_num_page:          12,
    uc_start_date:        new Date('2025-01-01'),
    uc_end_date:          new Date('2025-12-31'),
    uc_calendar_type:     'template_2',
    uc_page_header:       'Monthly Planner',
    uc_page_footer:       '© Sharma Family',
    uc_remarks:           '12-page monthly calendar'
  },
  {
    usr_id:               '8765432109',
    uc_msg:               'Priya Quarterly Calendar',
    uc_date_event_csv:    '2025/03/08, 2025/04/14, 2025/06/21',
    uc_event_details_csv: 'Womens Day, Birthday, Fathers Day',
    uc_img_csv:           '',
    uc_num_page:          3,
    uc_start_date:        new Date('2025-01-01'),
    uc_end_date:          new Date('2025-12-31'),
    uc_calendar_type:     'template_3',
    uc_page_header:       'Patil Family',
    uc_page_footer:       'Memories Forever',
    uc_remarks:           '3-page quarterly calendar'
  },
  {
    usr_id:               '6543210987',
    uc_msg:               'Sneha Annual Calendar 2025',
    uc_date_event_csv:    '2025/01/14, 2025/07/04, 2025/11/01',
    uc_event_details_csv: 'Makar Sankranti, USA Independence, Anniversary',
    uc_img_csv:           '',
    uc_num_page:          1,
    uc_start_date:        new Date('2025-01-01'),
    uc_end_date:          new Date('2025-12-31'),
    uc_calendar_type:     'template_1',
    uc_page_header:       'Joshi Family 2025',
    uc_page_footer:       'Every day is a blessing',
    uc_remarks:           'Simple 1-page calendar'
  }
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('\n🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to:', MONGO_URI);

    // ── Clear old data ──
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await UserCalendar.deleteMany({});
    console.log('   Users cleared');
    console.log('   Calendars cleared');

    // ── Seed Users ──
    console.log('\n👤 Creating users...');
    for (const u of USERS) {
      const hashed = await bcrypt.hash(u.usr_pass, 10);
      const plain  = u.usr_pass;
      await User.create({ ...u, usr_pass: hashed });
      console.log(`   ✅ ${u.usr_type.padEnd(5)} | ${u.usr_id} | ${u.usr_name.padEnd(15)} | pass: ${plain} | ${u.usr_status === 1 ? '🟢 Active' : '🔴 Inactive'}`);
    }

    // ── Seed Calendars ──
    console.log('\n📅 Creating calendars...');
    for (const c of CALENDARS) {
      const created = await UserCalendar.create(c);
      console.log(`   ✅ uc_no: ${created.uc_no} | ${c.uc_calendar_type} | "${c.uc_msg}" → usr: ${c.usr_id}`);
    }

    // ── Summary ──
    console.log('\n─────────────────────────────────────────');
    console.log('🎉 Seed complete!\n');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('─────────────────────────────────────────');
    console.log('  ADMIN:');
    console.log('    Mobile   : 9999999999');
    console.log('    Password : admin123');
    console.log('    Route    : /admin/dashboard\n');
    console.log('  USERS:');
    console.log('    Mobile   : 9876543210  | Password: rahul123');
    console.log('    Mobile   : 8765432109  | Password: priya123');
    console.log('    Mobile   : 6543210987  | Password: sneha123');
    console.log('    Mobile   : 7654321098  | Password: amit123  ← INACTIVE');
    console.log('─────────────────────────────────────────\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
