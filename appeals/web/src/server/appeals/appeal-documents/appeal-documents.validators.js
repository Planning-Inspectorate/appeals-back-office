import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import // createDateInputFieldsValidator,
//createDocumentDateInputFieldsValidator
'#lib/validators/date-input.validator.js';
import { dateIsValid, dateIsTodayOrInThePast } from '#lib/dates.js';
import { folderPathToFolderNameText } from '#appeals/appeal-documents/appeal-documents.mapper.js';

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
	body('items.*.receivedDate').custom((value) => {
		const day = value.day;
		const month = value.month;
		const year = value.year;

		if (!day && !month && !year) {
			throw new Error('all-fields-day::Enter the received date');
		}

		if (!day && !month) {
			throw new Error('all-fields-day::Received date must include a day and a month');
		}

		if (!day && !year) {
			throw new Error('all-fields-day::Received date must include a day and a year');
		}

		if (!month && !year) {
			throw new Error('all-fields-month::Received date must include a month and a year');
		}

		if (!day) {
			throw new Error('day::Received date must include a day');
		}

		if (!month) {
			throw new Error('month::Received date must include a month');
		}

		if (!year) {
			throw new Error('year::Received date must include a year');
		}

		const dayStr = String(day);
		const monthStr = String(month);
		const yearStr = String(year);

		if (!/^\d+$/.test(dayStr)) {
			throw new Error('day::Received date day must be a number');
		}
		if (dayStr.length < 1 || dayStr.length > 2) {
			throw new Error('day::Received date day must be 1 or 2 digits');
		}
		if (!/^(0?[1-9]|[12]\d|3[01])$/.test(dayStr)) {
			throw new Error('day::Received date day must be between 1 and 31');
		}

		if (!/^\d+$/.test(monthStr)) {
			throw new Error('month::Received date month must be a number');
		}
		if (monthStr.length < 1 || monthStr.length > 2) {
			throw new Error('month::Received date month must be 1 or 2 digits');
		}
		if (!/^(0?[1-9]|1[0-2])$/.test(monthStr)) {
			throw new Error('month::Received date month must be between 1 and 12');
		}

		if (!/^\d+$/.test(yearStr)) {
			throw new Error('year::Received date year must be a number');
		}
		if (yearStr.length !== 4) {
			throw new Error('year::Received date year must be 4 digits');
		}
		return true;
	})
);

export const validateDocumentDetailsReceivedDateValid = createValidator(
	body('items.*.receivedDate')
		.custom((value) => {
			const day = value.day;
			const month = value.month;
			const year = value.year;

			if (!day || !month || !year) {
				return false;
			}

			const dayNumber = Number.parseInt(day, 10);
			const monthNumber = Number.parseInt(month, 10);
			const yearNumber = Number.parseInt(year, 10);

			if (!dateIsValid({ day: dayNumber, month: monthNumber, year: yearNumber })) {
				return false;
			}

			return true;
		})
		.withMessage('all-fields-day::Received date must be a valid date')
);

export const validateDocumentDetailsReceivedDateIsNotFutureDate = createValidator(
	body('items.*.receivedDate')
		.custom((value) => {
			const day = value.day;
			const month = value.month;
			const year = value.year;

			if (!day || !month || !year) {
				return false;
			}

			return dateIsTodayOrInThePast({ day, month, year });
		})
		.withMessage('all-fields-day::Received date cannot be a future date')
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
	body('delete-file-answer').trim().notEmpty().withMessage('Answer must be provided')
);
