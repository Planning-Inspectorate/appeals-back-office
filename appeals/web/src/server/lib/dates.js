import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB/index.js';
import { isValid, isBefore, isAfter} from 'date-fns';
import { padNumberWithZero } from '#lib/string-utilities.js';

export const timeZone = 'Europe/London';

/**
 * @typedef {import('../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {boolean}
 */
export const dateIsValid = (dayMonthYearHourMinute) => {
	const date = new Date(dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute));
	return (
		isValid(date)
	);
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
 * @returns {string}
 */
export function getTodaysISOString() {
	const nowISOString = new Date().toISOString();

	const {year, month, day} = dateISOStringToDayMonthYearHourMinute(nowISOString);

	return dayMonthYearHourMinuteToISOString({
		day,
		month,
		year,
		hour: 0,
		minute: 0
	});
}

/**
 * @param {string | null | undefined} dateISOString
 * @returns {string}
 */
export function dateISOStringToDisplayDate(dateISOString) {
	if (typeof dateISOString === 'undefined' || dateISOString === null) {
		return '';
	}

	let displayDateString;

	try {
		displayDateString = formatInTimeZone(dateISOString, timeZone, 'd MMMM yyyy', {
			locale: enGB
		});
	} catch (e) {
		displayDateString = '';
	}

    return displayDateString;
}

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
		displayTimeString = formatInTimeZone(dateISOString, timeZone, 'H:mm');
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
		displayTimeString = formatInTimeZone(dateISOString, timeZone, `h:mmaaaaa'm'`);
	} catch (e) {
		displayTimeString = '';
	}

    return displayTimeString;
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
		day = parseInt(formatInTimeZone(dateISOString, timeZone, 'dd'), 10);
		month = parseInt(formatInTimeZone(dateISOString, timeZone, 'MM'), 10);
		year = parseInt(formatInTimeZone(dateISOString, timeZone, 'yyyy'), 10);
		hour = parseInt(formatInTimeZone(dateISOString, timeZone, 'HH'), 10);
		minute = parseInt(formatInTimeZone(dateISOString, timeZone, 'mm'), 10);
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

	const {year, month, day, hour = 0, minute = 0} = dayMonthYearHourMinute;

	if (typeof year === 'undefined' || year === null || typeof month === 'undefined' || month === null || typeof day === 'undefined' || day === null) {
		return '';
	}

    const dateStr = `${year}-${padNumberWithZero(month)}-${padNumberWithZero(day)}`;
    const timeStr = `${padNumberWithZero(hour)}:${padNumberWithZero(minute)}`;

	let dateISOString;

	try {
		dateISOString = zonedTimeToUtc(`${dateStr} ${timeStr}`, timeZone).toISOString();
	} catch (e) {
		dateISOString = '';
	}

    return dateISOString;
}

/**
 * @param {DayMonthYearHourMinute} dayMonthYearHourMinute
 * @returns {string}
 */
export function dayMonthYearHourMinuteToDisplayDate(dayMonthYearHourMinute) {
	if (typeof dayMonthYearHourMinute === 'undefined' || dayMonthYearHourMinute === null) {
		return '';
	}

	return dateISOStringToDisplayDate(
		dayMonthYearHourMinuteToISOString(dayMonthYearHourMinute)
	);
}
