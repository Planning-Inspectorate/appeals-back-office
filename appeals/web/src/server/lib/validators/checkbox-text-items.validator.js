import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

/**
 * Creates a validator middleware for checkbox text items.
 * @param {string} checkboxIdsBodyKey - The key in req.body containing checkbox IDs.
 * @param {number} [characterLimit=textInputCharacterLimits.checkboxTextItemsLength] - The maximum length of a text item.
 * @param {string} [customError] - The error to be displayed
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export const createCheckboxTextItemsValidator = (
	checkboxIdsBodyKey,
	characterLimit = textInputCharacterLimits.checkboxTextItemsLength,
	customError = 'Enter a reason'
) => {
	return (req, res, next) => {
		const bodyFields = req.body;
		let checkboxIds = bodyFields[checkboxIdsBodyKey];
		if (!Array.isArray(checkboxIds)) {
			checkboxIds = [checkboxIds];
		}
		const validators = [];
		for (const checkboxId of checkboxIds || []) {
			let textItemsForId = bodyFields?.[`${checkboxIdsBodyKey}-${checkboxId}`];
			if (typeof textItemsForId === 'undefined') {
				continue;
			}
			if (Array.isArray(textItemsForId)) {
				if (textItemsForId.length === 0) {
					validators.push(
						body(`${checkboxIdsBodyKey}-${checkboxId}`).custom(() => {
							throw new Error(customError);
						})
					);
					continue;
				}
				textItemsForId.forEach((textItem, textItemIndex) => {
					validators.push(
						body(`${checkboxIdsBodyKey}-${checkboxId}-${textItemIndex + 1}`).custom(() =>
							textItemCustomValidator(
								textItem,
								characterLimit,
								customError === 'Enter a reason' ? undefined : customError
							)
						)
					);
				});
			} else if (typeof textItemsForId === 'string') {
				validators.push(
					body(`${checkboxIdsBodyKey}-${checkboxId}-1`).custom(() =>
						textItemCustomValidator(
							textItemsForId,
							characterLimit,
							customError === 'Enter a reason' ? undefined : customError
						)
					)
				);
			}
		}
		return createValidator(validators)(req, res, next);
	};
};

/**
 * Custom validator for text item.
 * @param {string} textItem
 * @param {number} characterLimit
 * @param {string} [customError] - The error to be displayed
 * @returns {boolean}
 * @throws {Error} If textItem is empty.
 */
export const textItemCustomValidator = (textItem, characterLimit, customError = 'reason') => {
	if (typeof textItem !== 'string' || textItem.trim().length === 0) {
		throw new Error(`Enter ${customError === 'reason' ? 'a reason' : customError}`);
	}
	if (textItem.length > characterLimit) {
		const prefix = `${customError === 'reason' ? 'Reason' : capitalizeFirstLetter(customError)}`;
		throw new Error(`${prefix} must be ${characterLimit} characters or less`);
	}
	if (!textItem.match(/^[A-Za-z0-9 .,'!&-()]+$/)) {
		const prefix = `${customError === 'reason' ? 'Reason' : capitalizeFirstLetter(customError)}`;
		throw new Error(
			`${prefix} must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes`
		);
	}
	return true;
};
