import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB/index.js';
import { add, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import { padNumberWithZero } from '#lib/string-utilities.js';
import { DEFAULT_TIMEZONE } from '@pins/appeals/constants/dates.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 * @typedef {import('../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {boolean}
 */
export const dateIsValid = (dayMonthYearHourMinute) => {
	const date = new Date(dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute));
	return isValid(date);
};

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {boolean}
 */
export const dateIsInTheFuture = (dayMonthYearHourMinute) => {
	const date = new Date(dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute));

	return isAfter(date, new Date(getTodaysISOString()));
};

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {boolean}
 */
export const dateIsInThePast = (dayMonthYearHourMinute) => {
	const dateISOString = dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute);
	const todaysISOString = getTodaysISOString();

	const date = new Date(dateISOString);
	return isBefore(date, new Date(todaysISOString));
};

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {boolean}
 */
export const dateIsTodayOrInThePast = (dayMonthYearHourMinute) => {
	const dateISOString = dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute);
	const todaysISOString = getTodaysISOString();

	if (dateISOString === todaysISOString) {
		return true;
	}

	const date = new Date(dateISOString);
	return isBefore(date, new Date(todaysISOString));
};

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @param {DayMonthYearHourMinute} dateToCompare
 * @returns {boolean}
 */
export const dateIsAfter = (dayMonthYearHourMinute, dateToCompare) => {
	const date = new Date(dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute));
	const dateAfter = new Date(dayMonthYearHourMinuteToISOString(dateToCompare));

	return isAfter(date, dateAfter);
};

/**
 * @param {string | null | undefined} dateISOString
 * @returns {string}
 */
export function dateISOStringToDisplayTime24hr(dateISOString) {
	if (typeof dateISOString === 'undefined' || dateISOString === null) {
		return '';
	}

	let displayTimeString;

	try {
		displayTimeString = formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'H:mm');
	} catch (e) {
		displayTimeString = '';
	}

	return displayTimeString;
}

/**
 * @param {string | null | undefined} dateISOString
 * @returns {string}
 */
export function dateISOStringToDisplayTime12hr(dateISOString) {
	if (typeof dateISOString === 'undefined' || dateISOString === null) {
		return '';
	}

	let displayTimeString;

	try {
		displayTimeString = formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, `h:mmaaa`);
	} catch (e) {
		displayTimeString = '';
	}

	return displayTimeString;
}

/**
 * returns today's ISO string with today's day, month, year at Europe/london midnight time (00:00)
 * @returns {string}
 */
export function getTodaysISOString() {
	const nowISOString = new Date().toISOString();

	const { year, month, day } = dateISOStringToDayMonthYearHourMinute(nowISOString);

	return dayMonthYearHourMinuteToISOString({
		day,
		month,
		year
	});
}

/**
 * @param {string | null | undefined} dateISOString
 * @param {string} fallback
 * @returns {string}
 */
export function dateISOStringToDisplayDate(dateISOString, fallback = '') {
	if (typeof dateISOString === 'undefined' || dateISOString === null) {
		return fallback;
	}

	let displayDateString;

	try {
		displayDateString = formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'd MMMM yyyy', {
			locale: enGB
		});
	} catch (e) {
		displayDateString = '';
	}

	return displayDateString;
}

/**
 * @param {string | null | undefined} dateISOString
 * @returns {DayMonthYearHourMinute}
 */
export function dateISOStringToDayMonthYearHourMinute(dateISOString) {
	if (typeof dateISOString === 'undefined' || dateISOString === null) {
		return {};
	}

	let day, month, year, hour, minute;

	try {
		day = parseInt(formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'dd'), 10);
		month = parseInt(formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'MM'), 10);
		year = parseInt(formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'yyyy'), 10);
		hour = parseInt(formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'HH'), 10);
		minute = parseInt(formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, 'mm'), 10);
	} catch (e) {
		day = undefined;
		month = undefined;
		year = undefined;
		hour = undefined;
		minute = undefined;
	}

	return { day, month, year, hour, minute };
}

/**
 * Parse the date and time parameters in Europe/London
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {string}
 */
export const dayMonthYearHourMinuteToISOString = (dayMonthYearHourMinute) => {
	if (typeof dayMonthYearHourMinute === 'undefined' || dayMonthYearHourMinute === null) {
		return '';
	}

	const { year, month, day, hour = 0, minute = 0 } = dayMonthYearHourMinute;

	if (
		typeof year === 'undefined' ||
		year === null ||
		typeof month === 'undefined' ||
		month === null ||
		typeof day === 'undefined' ||
		day === null
	) {
		return '';
	}

	const dateStr = `${year}-${padNumberWithZero(month)}-${padNumberWithZero(day)}`;
	const timeStr = `${padNumberWithZero(hour)}:${padNumberWithZero(minute)}`;

	let dateISOString;

	try {
		dateISOString = zonedTimeToUtc(`${dateStr} ${timeStr}`, DEFAULT_TIMEZONE).toISOString();
	} catch (e) {
		dateISOString = '';
	}

	return dateISOString;
};

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {string}
 */
export function dayMonthYearHourMinuteToDisplayDate(dayMonthYearHourMinute) {
	if (typeof dayMonthYearHourMinute === 'undefined' || dayMonthYearHourMinute === null) {
		return '';
	}

	return dateISOStringToDisplayDate(dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute));
}

/**
 * @param {string | null | undefined} isoDate
 * @returns {string} Day of the week
 */
export const getDayFromISODate = (isoDate) => {
	if (typeof isoDate === 'undefined' || isoDate === null) {
		return '';
	}
	const dateInZone = utcToZonedTime(isoDate, DEFAULT_TIMEZONE);
	return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateInZone);
};

/**
 *
 * @param {string} originalDecisionDate
 * @param {string} appealType
 * @returns {Date|undefined}
 */
export const calculateIncompleteDueDate = (originalDecisionDate, appealType) => {
	const config = getExtendedDeadlineConfiguration(appealType);
	if (config) {
		const dueDate = add(parseISO(originalDecisionDate), config);
		return dueDate;
	}
};

/**
 * @param {import('got').Got} apiClient
 * @param {Date} startDate
 * @param {number} numDays
 * @returns {Promise<Date>}
 * */
export const addBusinessDays = async (apiClient, startDate, numDays) => {
	const date = await apiClient
		.post('appeals/add-business-days', {
			json: { inputDate: startDate.toISOString(), numDays }
		})
		.json();

	return new Date(date);
};

/**
 *
 * @param {string} appealType
 * @returns
 */
const getExtendedDeadlineConfiguration = (appealType) => {
	switch (appealType) {
		case APPEAL_TYPE.HOUSEHOLDER:
			return {
				weeks: 12
			};
		case APPEAL_TYPE.S78:
			return {
				months: 6
			};
		default: {
			return null;
		}
	}
};

/**
 *
 * @param {Date} date
 * @returns {Date}
 */
export const oneMonthBefore = (date) => {
	const dateOneMonthBefore = new Date(date.getTime());
	dateOneMonthBefore.setMonth(dateOneMonthBefore.getMonth() - 1);
	return dateOneMonthBefore;
};

/**
 * Returns the days with one or no decimal places, followed by 'day' or 'days
 * @param {string | number | undefined} days
 * @returns {string}
 */
export const formatDays = (days) => {
	if (typeof days === 'undefined') {
		return '';
	}

	const numberOfDays = typeof days === 'string' ? parseFloat(days) : days;
	const suffix = numberOfDays === 1 ? 'day' : 'days';

	return `${numberOfDays} ${suffix}`;
};

/**
 *
 * @param {string | Date} date
 * @param {Number} hours
 * @param {Number} minutes
 * @returns {Date}
 */
export const setTimeInTimeZone = (date, hours, minutes) => {
	const ymd = formatInTimeZone(date, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
	const paddedHours = hours.toString().padStart(2, '0');
	const paddedMinutes = minutes.toString().padStart(2, '0');
	return zonedTimeToUtc(`${ymd} ${paddedHours}:${paddedMinutes}`, DEFAULT_TIMEZONE);
};
