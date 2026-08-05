import { add } from 'date-fns';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
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
/**
 *
 * @param {Date} date
 * @param {Date} afterDate
 * @returns {boolean}
 */

export const dateIsOnOrAfterDate = (date, afterDate) => {
	const d1 = new Date(date);
	const d2 = new Date(afterDate);

	if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
		return false;
	}

	const dateStr = formatInTimeZone(d1, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
	const afterDateStr = formatInTimeZone(d2, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
	return dateStr >= afterDateStr;
};
