import { createValidator } from '@pins/express';
import { body } from 'express-validator';

import {
	dateIsValid,
	dateIsTodayOrInThePast,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { folderPathToFolderNameText } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { lowerCase } from 'lodash-es';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { dateIsABusinessDay } from '#lib/validators/date-input.validator.js';

export const validateDocumentNameBodyFormat = createValidator(
	body()
		.custom((bodyFields) => {
			const items = Object.keys(bodyFields);
			return items.includes('documentId') && items.includes('fileName');
		})
		.withMessage('There is a problem with the service')
);

export const validateDocumentName = createValidator(
	body('fileName')
		.trim()
		.notEmpty()
		.withMessage('File name must be entered')
		.bail()
		// Filename must only contain alphanumeric characters, underscores and hyphens
		.matches('^[a-zA-Z0-9_ -]+$')
		.withMessage(
			'File name must only include letters a to z, numbers 0 to 9 and special characters such as hyphens and underscores'
		)
		.bail()
		.custom((value, { req }) => {
			const hasDuplicate = req.currentFolder.documents.some(
				(/** @type {import('@pins/appeals.api').Appeals.DocumentInfo} */ document) =>
					document.name.toLowerCase().substring(0, document.name.lastIndexOf('.')) ===
						value.toLowerCase() && document.id !== req.body.documentId
			);
			if (hasDuplicate) {
				return Promise.reject(
					`File name already exists within ${folderPathToFolderNameText(
						req.currentFolder.path
					)} documents`
				);
			}
			return true;
		})
);

export const validateDocumentDetailsBodyFormat = createValidator(
	body()
		.custom((bodyFields) => {
			if (
				!('items' in bodyFields) ||
				!Array.isArray(bodyFields.items) ||
				!(bodyFields.items.length > 0)
			) {
				return false;
			}

			for (const item of bodyFields.items) {
				if (!('documentId' in item) || !('receivedDate' in item)) {
					return false;
				}
			}

			return true;
		})
		.withMessage('There is a problem with the service')
);

export const validateDocumentDetailsReceivedDatesFields = createValidator(
	body('items.*.receivedDate').custom((value, { req }) => {
		const documentName = `${
			getDocumentName(req) ? getDocumentName(req) + ' received' : 'Received'
		}`;
		const day = value.day;
		const month = value.month;
		const year = value.year;

		if (!day && !month && !year) {
			throw new Error(
				`all-fields-day::Enter the date you received the ${
					documentName === 'document' || !documentName.includes('LPA')
						? lowerCase(documentName)
						: documentName
				}`
			);
		}

		if (!day && !month) {
			throw new Error(`day-month::${documentName} date must include a day and a month`);
		}

		if (!day && !year) {
			throw new Error(`day-year::${documentName} date must include a day and a year`);
		}

		if (!month && !year) {
			throw new Error(`month-year::${documentName} date must include a month and a year`);
		}

		if (!day) {
			throw new Error(`day::${documentName} date must include a day`);
		}

		if (!month) {
			throw new Error(`month::${documentName} date must include a month`);
		}

		if (!year) {
			throw new Error(`year::${documentName} date must include a year`);
		}

		const dayStr = String(day);
		const monthStr = String(month);
		const yearStr = String(year);

		if (!/^\d+$/.test(dayStr)) {
			throw new Error(`day::${documentName} date day must be a number`);
		}
		if (dayStr.length < 1 || dayStr.length > 2) {
			throw new Error(`day::${documentName} date day must be 1 or 2 digits`);
		}
		if (!/^(0?[1-9]|[12]\d|3[01])$/.test(dayStr)) {
			throw new Error(`day::${documentName} date day must be between 1 and 31`);
		}

		if (!/^\d+$/.test(monthStr)) {
			throw new Error(`month::${documentName} date month must be a number`);
		}
		if (monthStr.length < 1 || monthStr.length > 2) {
			throw new Error(`month::${documentName} date month must be 1 or 2 digits`);
		}
		if (!/^(0?[1-9]|1[0-2])$/.test(monthStr)) {
			throw new Error(`month::${documentName} date month must be between 1 and 12`);
		}

		if (!/^\d+$/.test(yearStr)) {
			throw new Error(`year::${documentName} date year must be a number`);
		}
		if (yearStr.length !== 4) {
			throw new Error(`year::${documentName} date year must be 4 digits`);
		}
		return true;
	})
);

export const validateDocumentDetailsReceivedDateValid = createValidator(
	body('items.*.receivedDate').custom((value, { req }) => {
		const documentName = `${
			getDocumentName(req) ? getDocumentName(req) + ' received' : 'Received'
		}`;
		const day = value.day;
		const month = value.month;
		const year = value.year;

		if (!day || !month || !year) {
			return false;
		}
		const errorMessage = `all-fields-day::${documentName} date must be a real date`;

		const dayNumber = Number.parseInt(day, 10);
		const monthNumber = Number.parseInt(month, 10);
		const yearNumber = Number.parseInt(year, 10);

		if (!dateIsValid({ day: dayNumber, month: monthNumber, year: yearNumber })) {
			throw new Error(errorMessage);
		}

		return true;
	})
);

export const validateDocumentDetailsReceivedDateIsNotFutureDate = createValidator(
	body('items.*.receivedDate').custom((value, { req }) => {
		const documentName = `${
			getDocumentName(req) ? getDocumentName(req) + ' received' : 'Received'
		}`;
		const day = value.day;
		const month = value.month;
		const year = value.year;

		if (!day || !month || !year) {
			return false;
		}
		const errorMessage = `all-fields-day::${documentName} date must be in the past`;

		if (!dateIsTodayOrInThePast({ day, month, year })) {
			throw new Error(errorMessage);
		}
		return true;
	})
);

export const validateDocumentDetailsRedactionStatuses = createValidator(
	body()
		.custom((bodyFields) => {
			for (const item of bodyFields.items) {
				if (!item?.redactionStatus) {
					return false;
				}
			}

			return true;
		})
		.withMessage('Please provide a redaction status for every document listed')
);

export const validateDocumentDeleteAnswer = createValidator(
	body('delete-file-answer')
		.trim()
		.notEmpty()
		.withMessage('Select yes if you are sure you want to remove this version')
);

export const getDocumentName = (
	/** @type {import("express-validator/src/base").Request} */ req
) => {
	const { currentFolder } = req;
	const folderDisplayLabel = mapFolderNameToDisplayLabel(currentFolder?.path);

	if (folderDisplayLabel == null || String(folderDisplayLabel).trim() === '') {
		return '';
	} else {
		return `${folderDisplayLabel}`;
	}
};

export const createDateInputDateBusinessDayValidator = createValidator(
	body('items.*.receivedDate').custom(async (value, { req }) => {
		const day = value.day;
		const month = value.month;
		const year = value.year;

		if (!day || !month || !year) {
			return false;
		}

		const dateToValidate = dayMonthYearHourMinuteToISOString({
			day,
			month,
			year
		});

		const result = await dateIsABusinessDay(req.apiClient, dateToValidate);
		if (result === false) {
			const errorMessage = `all-fields::${
				getDocumentName(req) ? getDocumentName(req) + ' received' : 'Received'
			}
 				received date must be a business day`;

			throw new Error(errorMessage);
		}
		return true;
	})
);
