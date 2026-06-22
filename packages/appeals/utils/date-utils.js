import { add } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '../constants/dates.js';

/**
 * @param {Date} date
 * @returns {Date}
 * */
export const nextUKDay = (date) => {
	const ukDate = utcToZonedTime(date, DEFAULT_TIMEZONE);
	const nextDayUkDate = add(ukDate, { days: 1 });
	const startOfTomorrow = nextDayUkDate.setHours(0, 0, 0, 0);
	return zonedTimeToUtc(startOfTomorrow, DEFAULT_TIMEZONE);
};
