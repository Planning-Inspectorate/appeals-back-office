import logger from '../logger.js';
import { formatInTimeZone } from 'date-fns-tz';
const UK_TIMEZONE = 'Europe/London';

/**
 *
 * @param {string} dateString
 * @param {string} formatString
 * @returns {string}
 */
export function formatDate(dateString, formatString) {
	try {
		if (!dateString) return '';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			logger.warn(`Invalid date encountered in template filter: ${dateString}`);
			return dateString;
		}
		return formatInTimeZone(date, UK_TIMEZONE, formatString);
	} catch (error) {
		logger.error(
			{ err: error, dateString, formatString },
			'Error formatting date in Nunjucks filter'
		);
		return dateString;
	}
}
