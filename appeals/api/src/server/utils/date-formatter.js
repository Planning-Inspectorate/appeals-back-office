import { formatInTimeZone } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB/index.js';

export const timeZone = 'Europe/London';

/**
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

export default formatDate;
