import {
	DAYTIME_HOUR,
	DAYTIME_MINUTE,
	DEADLINE_HOUR,
	DEADLINE_MINUTE,
	DEFAULT_TIMEZONE
} from '@pins/appeals/constants/dates.js';
import {
	BANK_HOLIDAY_FEED_DIVISION_ENGLAND,
	CONFIG_APPEAL_TIMETABLE,
	CONFIG_BANKHOLIDAYS_FEED_URL
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { addBusinessDays, isAfter, isBefore, isSameDay, isWeekend, parseISO } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import fetch from 'node-fetch';
import { getCache, setCache } from './cache-data.js';
import isExpeditedAppealType from './is-expedited-appeal-type.js';

/** @typedef {import('../types/appeal.js').BankHolidayFeedEvents } BankHolidayFeedEvents */
/** @typedef {import('../types/appeal.js').BankHolidayFeedDivisions } BankHolidayFeedDivisions */
/** @typedef {import('../types/appeal.js').TimetableDeadlineDate} TimetableDeadlineDate */

/**
 * Count the number of bank holidays between two dates
 *
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {BankHolidayFeedEvents} bankHolidays
 * @returns {number}
 */
export const getNumberOfBankHolidaysBetweenDates = (dateFrom, dateTo, bankHolidays) => {
	return bankHolidays.filter(
		({ date }) =>
			(isSameDay(new Date(date), new Date(dateFrom)) ||
				isAfter(new Date(date), new Date(dateFrom))) &&
			(isSameDay(new Date(date), new Date(dateTo)) || isBefore(new Date(date), new Date(dateTo)))
	).length;
};

/**
 * @param {BankHolidayFeedDivisions} division
 * @returns {Promise<BankHolidayFeedEvents>}
 */
export const fetchBankHolidaysForDivision = async (
	division = BANK_HOLIDAY_FEED_DIVISION_ENGLAND
) => {
	try {
		const cacheKey = 'bankHolidayFeedJsonCache';

		if (getCache(cacheKey) == null) {
			const bankHolidayFeed = await fetch(CONFIG_BANKHOLIDAYS_FEED_URL);
			const bankHolidayFeedJson = await bankHolidayFeed.json();

			// @ts-ignore
			setCache(cacheKey, bankHolidayFeedJson);
		}

		return getCache(cacheKey)[division].events;
	} catch (error) {
		throw new Error(String(error));
	}
};

/**
 * Add any bank holiday days in the date range to the deadline day
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {BankHolidayFeedEvents} bankHolidays
 * @returns {{ bankHolidayCount: number, calculatedDate: Date }}
 */
export const recalculateDateForBankHolidays = (dateFrom, dateTo, bankHolidays) => {
	const bankHolidayCount = getNumberOfBankHolidaysBetweenDates(dateFrom, dateTo, bankHolidays);

	if (bankHolidayCount) {
		return {
			bankHolidayCount,
			calculatedDate: addBusinessDays(dateTo, bankHolidayCount)
		};
	}

	return { bankHolidayCount, calculatedDate: dateTo };
};

/**
 * @param {Date} startedAt
 * @param {Date} calculatedDate
 * @param {BankHolidayFeedEvents} bankHolidays
 * @returns {Date}
 */
const addBankHolidayDays = (startedAt, calculatedDate, bankHolidays) => {
	let bankHolidayCount = 0;

	({ bankHolidayCount, calculatedDate } = recalculateDateForBankHolidays(
		startedAt,
		calculatedDate,
		bankHolidays
	));

	while (bankHolidayCount > 0) {
		({ bankHolidayCount, calculatedDate } = recalculateDateForBankHolidays(
			calculatedDate,
			calculatedDate,
			bankHolidays
		));
	}

	return calculatedDate;
};

/**
 * @param {string} date
 * @returns {Date}
 */
const addWeekendDays = (date) => {
	let calculatedDate = parseISO(date);

	while (isWeekend(calculatedDate)) {
		calculatedDate = addBusinessDays(calculatedDate, 1);
	}

	return calculatedDate;
};

/**
 * @param {string} date
 * @returns {Promise<Date>}
 */
const recalculateDateIfNotBusinessDay = async (date) => {
	const processedDate = setTimeInTimeZone(date, DAYTIME_HOUR, DAYTIME_MINUTE).toISOString();

	const bankHolidays = await fetchBankHolidaysForDivision();
	const calculatedDate = addWeekendDays(processedDate);
	const calculatedDateWithoutBankHolidays = addBankHolidayDays(
		calculatedDate,
		calculatedDate,
		bankHolidays
	);

	return setTimeInTimeZone(calculatedDateWithoutBankHolidays, 0, 0);
};

/**
 * @param {string} startDate
 * @param {number} numDays
 * @returns {Promise<Date>}
 * */
const addDays = async (startDate, numDays) => {
	const processedDate = setTimeInTimeZone(startDate, DAYTIME_HOUR, DAYTIME_MINUTE);

	const calculatedDate = addBusinessDays(processedDate, numDays);

	const bankHolidays = await fetchBankHolidaysForDivision();
	const calculatedDateWithoutBankHolidays = addBankHolidayDays(
		processedDate,
		calculatedDate,
		bankHolidays
	);

	return setTimeInTimeZone(calculatedDateWithoutBankHolidays, 0, 0);
};

/**
 *
 * @param {string | Date} date
 * @param {Number} hours
 * @param {Number} minutes
 * @returns {Date}
 */
const setTimeInTimeZone = (date, hours, minutes) => {
	const ymd = formatInTimeZone(date, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
	const paddedHours = hours.toString().padStart(2, '0');
	const paddedMinutes = minutes.toString().padStart(2, '0');
	return zonedTimeToUtc(`${ymd} ${paddedHours}:${paddedMinutes}`, DEFAULT_TIMEZONE);
};

/**
 * Calculates the timetable deadlines excluding weekends and bank holidays
 *
 * 1. The deadline day is calculated excluding weekends
 * 2. The number of bank holidays in the date range are added to the deadline day
 * 3. If the new deadline day (and any consecutive days) are bank holidays, these are added to the deadline day
 *
 * @param {string} appealType
 * @param {Date|null} startedAt
 * @param {string} procedureType
 * @returns {Promise<TimetableDeadlineDate | undefined>}
 */
const calculateTimetable = async (appealType, startedAt, procedureType = 'written') => {
	if (startedAt) {
		const startDate = setTimeInTimeZone(startedAt, DAYTIME_HOUR, DAYTIME_MINUTE);

		const fullAppealTypeKey = appealType === APPEAL_CASE_TYPE.H ? appealType : APPEAL_CASE_TYPE.W;
		const expeditedAppealTypeKey = APPEAL_CASE_TYPE.D;
		const appealTimetableConfig = !isExpeditedAppealType(appealType)
			? CONFIG_APPEAL_TIMETABLE[fullAppealTypeKey][procedureType]
			: CONFIG_APPEAL_TIMETABLE[expeditedAppealTypeKey];

		if (appealTimetableConfig) {
			const bankHolidays = await fetchBankHolidaysForDivision();

			return Object.fromEntries(
				Object.entries(appealTimetableConfig).map(([fieldName, { daysFromStartDate }]) => {
					let calculatedDate = addBusinessDays(startDate, daysFromStartDate);
					calculatedDate = addBankHolidayDays(startDate, calculatedDate, bankHolidays);

					const deadline = setTimeInTimeZone(calculatedDate, DEADLINE_HOUR, DEADLINE_MINUTE);

					return [fieldName, deadline];
				})
			);
		}
	}
};

export { addDays, calculateTimetable, recalculateDateIfNotBusinessDay, setTimeInTimeZone };
