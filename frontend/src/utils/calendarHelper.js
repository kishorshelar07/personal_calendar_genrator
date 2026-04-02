export function getMonthDays(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  let dow = (first.getDay() + 6) % 7; // Mon=0

  for (let i = dow - 1; i >= 0; i--)
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });

  for (let d = 1; d <= last.getDate(); d++)
    days.push({ date: new Date(year, month, d), day: d, isCurrentMonth: true });

  const rem = 7 - (days.length % 7);
  if (rem < 7)
    for (let d = 1; d <= rem; d++)
      days.push({ date: new Date(year, month + 1, d), day: d, isCurrentMonth: false });

  return days;
}

const fmt = d => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
};
const norm = s => String(s).replace(/\//g,'-').trim();

export function isEventDate(date, csv) {
  if (!csv) return false;
  const target = fmt(date);
  return csv.split(',').map(norm).includes(target);
}

export function getEventLabel(date, dateCSV, detailCSV) {
  if (!dateCSV || !detailCSV) return '';
  const idx = dateCSV.split(',').map(norm).indexOf(fmt(date));
  return idx === -1 ? '' : (detailCSV.split(',')[idx] || '').trim();
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function generateCalendarData(start, end) {
  const out = [];
  let cur = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), 1);
  const lim = new Date(new Date(end).getFullYear(),   new Date(end).getMonth(),   1);
  while (cur <= lim) {
    out.push({ year: cur.getFullYear(), month: cur.getMonth(), monthName: MONTHS[cur.getMonth()] });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

export function splitIntoChunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
