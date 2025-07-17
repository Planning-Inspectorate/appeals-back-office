import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { textInputCharacterLimits } from '../../appeals/appeal.constants.js';

/**
 *
 * @param {string} checkboxIdsBodyKey
 * @returns
 */
export const createCheckboxTextItemsValidator = (checkboxIdsBodyKey) =>
	createValidator(
		body()
			.custom((bodyFields) => {
				let checkboxIds = bodyFields[checkboxIdsBodyKey];

				if (!Array.isArray(checkboxIds)) {
					checkboxIds = [checkboxIds];
				}

				for (const checkboxId of checkboxIds || []) {
					let textItemsForId = bodyFields?.[`${checkboxIdsBodyKey}-${checkboxId}`];

					if (typeof textItemsForId === 'undefined') {
						continue;
					}

					if (
						textItemsForId.length === 0 ||
						(Array.isArray(textItemsForId) &&
							textItemsForId.filter((textItem) => textItem.length > 0).length === 0)
					) {
						return false;
					}
				}

				return true;
			})
			.withMessage('Enter a reason')
			.bail()
			.custom((bodyFields) => {
				const characterLimit = textInputCharacterLimits.checkboxTextItemsLength;
				let checkboxIds = bodyFields[checkboxIdsBodyKey];

				if (!Array.isArray(checkboxIds)) {
					checkboxIds = [checkboxIds];
				}

				for (const checkboxId of checkboxIds || []) {
					let textItemsForId = bodyFields?.[`${checkboxIdsBodyKey}-${checkboxId}`];

					if (typeof textItemsForId === 'undefined') {
						continue;
					}

					if (
						(typeof textItemsForId === 'string' && textItemsForId.length > characterLimit) ||
						(Array.isArray(textItemsForId) &&
							textItemsForId.filter((textItem) => textItem.length > characterLimit).length > 0)
					) {
						return false;
					}
				}

				return true;
			})
			.withMessage(
				`Text in text fields cannot exceed ${textInputCharacterLimits.checkboxTextItemsLength} characters`
			)
	);
