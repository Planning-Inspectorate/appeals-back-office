import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { createDateInputFieldsValidator } from '#lib/validators/date-input.validator.js';
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

export const validateDocumentDetailsReceivedDatesFields = createDateInputFieldsValidator(
	'',
	'Received date',
	'day',
	'month',
	'year',
	'items.*.receivedDate'
);

export const validateDocumentDetailsReceivedDateValid = createValidator(
	body()
		.custom((bodyFields) => {
			for (const item of bodyFields.items) {
				const day = item?.receivedDate?.day;
				const month = item?.receivedDate?.month;
				const year = item?.receivedDate?.year;

				if (!day || !month || !year) {
					return false;
				}

				const dayNumber = Number.parseInt(day, 10);
				const monthNumber = Number.parseInt(month, 10);
				const yearNumber = Number.parseInt(year, 10);

				if (!dateIsValid({ day: dayNumber, month: monthNumber, year: yearNumber })) {
					return false;
				}
			}

			return true;
		})
		.withMessage('Received date must be a valid date')
);

export const validateDocumentDetailsReceivedDateIsNotFutureDate = createValidator(
	body()
		.custom((bodyFields) => {
			for (const item of bodyFields.items) {
				const day = item?.receivedDate?.day;
				const month = item?.receivedDate?.month;
				const year = item?.receivedDate?.year;

				if (!day || !month || !year) {
					return false;
				}

				return dateIsTodayOrInThePast({ day, month, year });
			}

			return true;
		})
		.withMessage('Received date cannot be a future date')
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
