import logger from './logger.js';

/**
 *
 * @param {number} timeHour
 * @param {number} timeMinute
 * @param {number} beforeTimeHour
 * @param {number} beforeTimeMinute
 * @returns {boolean} indicating whether time is before beforeTime
 */
export function timeIsBeforeTime(timeHour, timeMinute, beforeTimeHour, beforeTimeMinute) {
	return timeHour * 60 + timeMinute < beforeTimeHour * 60 + beforeTimeMinute;
}

/**
 * @param {string} timeString
 */
export function is24HourTimeValid(timeString) {
	//Check the format hh:mm
	const timeRegex = /^(0?[0-9]|1[0-9]|2[0-3]?):(0?[0-9]|[1-5][0-9])$/;
	if (!timeRegex.test(timeString)) {
		return false;
	}

	// Validate the ranges
	const [hours, minutes] = timeString.split(':');
	const hoursInt = parseInt(hours, 10);
	const minutesInt = parseInt(minutes, 10);
	if (hoursInt < 0 || hoursInt > 23 || minutesInt < 0 || minutesInt > 59) {
		return false;
	}

	return true;
}
