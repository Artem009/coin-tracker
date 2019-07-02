const subDays = require("date-fns/sub_days");
const addHours = require("date-fns/add_hours");
const startOfDay = require("date-fns/start_of_day");
const startOfWeek = require("date-fns/start_of_week");
const startOfMonth = require("date-fns/start_of_month");
const startOfYear = require("date-fns/start_of_year");
const endOfDay = require("date-fns/end_of_day");
const getTimestamp = require("date-fns/get_time");
const format = require("date-fns/format");

const ko = require("date-fns/locale/ko");
const ru = require("date-fns/locale/ru");
const en = require("date-fns/locale/en");

const locales = {
  ko,
  ru,
  en
};

const now = () => new Date();

const toTimestamp = (date) => getTimestamp(date ? date : now());

const toDate = ts => new Date(parseInt(ts, 10) * 1000);

const dateFormat = (date, mask = "d/m/Y H:i", lang = "en") => {
  const newDate = typeof date === 'number' ? toDate(date) : date;
  return format(newDate, mask, { locale: locales[lang] });
};

const dayStart = (d = now()) => startOfDay(typeof d === 'number' ? new Date(d) : d);

const yesterdayStart = () => startOfDay(subDays(now(), 1));

const yesterdayEnd = () => endOfDay(subDays(now(), 1));

const weekStart = () => startOfWeek(now(), { weekStartsOn: 1 });

const monthStart = () => startOfMonth(now());

const yearStart = () => startOfYear(now());

module.exports = {
  now,
  toDate,
  dateFormat,
  toTimestamp,
  dayStart,
  yesterdayStart,
  yesterdayEnd,
  weekStart,
  monthStart,
  yearStart,
  subDays,
  addHours
};
