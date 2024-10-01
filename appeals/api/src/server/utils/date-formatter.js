import { formatInTimeZone } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB/index.js';

export const timeZone = 'Europe/London';

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
	return formatInTimeZone(date, timeZone, shortened ? 'd MMM yyyy' : 'd MMMM yyyy', {
		locale: enGB
	});
}

/**
 * Format the given date as an HH:mm string in Europe/London
 *
 * @param {Date | undefined} date
 * @returns {string} formatted time string,'HH:mm'
 */
export const formatTime = (date) => {
	if (!date) {
		return '';
	}
	return formatInTimeZone(new Date(date), timeZone, 'HH:mm');
};

export default formatDate;
