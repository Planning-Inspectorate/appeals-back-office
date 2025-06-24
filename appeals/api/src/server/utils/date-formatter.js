import { formatInTimeZone } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB/index.js';
import { DEFAULT_TIMEZONE } from '@pins/appeals/constants/dates.js';

/**
 * Format the given date as a string in Europe/London
 *
 * @param {Date} date
 * @param {boolean} shortened - whether to shorten the month name
 * @returns {string} formatted date string, either 'd MMM yyyy' or 'd MMMM yyyy'
 */
function formatDate(date, shortened = true) {
	if (!(date instanceof Date) || isNaN(date.getTime())) {
		return '';
	}
	return formatInTimeZone(date, DEFAULT_TIMEZONE, shortened ? 'd MMM yyyy' : 'd MMMM yyyy', {
		locale: enGB
	});
}

/**
 * Format the given date as an HH:mm string in Europe/London
 * Example return value: 13:00
 *
 * @param {Date | undefined} date
 * @returns {string} formatted time string,'HH:mm'
 */
export const formatTime = (date) => {
	if (!date) {
		return '';
	}
	return formatInTimeZone(new Date(date), DEFAULT_TIMEZONE, 'HH:mm');
};

/**
 * Format the given date as an HH:mm string in Europe/London
 * Example return value: 1:00pm
 *
 * @param {Date | undefined} date
 * @returns {string} formatted time string,'HH:mm'
 */
export const formatTime12h = (date) => {
	if (!date) {
		return '';
	}
	return formatInTimeZone(new Date(date), DEFAULT_TIMEZONE, 'h:mmaaa');
};

/**
 * Format the given date as yyyy-MM-dd HH:mm:ss:SSS string in Europe/London
 *
 * @param {Date | undefined} date
 * @returns {string} formatted sortable date and time string,'yyyy-MM-dd HH:mm:ss:SSS string'
 */
export const formatSortableDateTime = (date) => {
	if (!date) {
		return '';
	}
	return formatInTimeZone(new Date(date), DEFAULT_TIMEZONE, 'yyyy-MM-dd HH:mm:ss:SSS');
};

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

export default formatDate;
