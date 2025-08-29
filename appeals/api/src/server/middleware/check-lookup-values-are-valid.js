import commonRepository from '#repositories/common.repository.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').NextFunction} NextFunction */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Appeals.IncompleteInvalidReasons} IncompleteInvalidReasons */

/**
 * @param {string[] | number[] | IncompleteInvalidReasons} arr
 * @returns {arr is IncompleteInvalidReasons}
 */
const isIncompleteInvalidReasons = (arr) => {
	return arr.every((el) => typeof el === 'object' && Object.hasOwn(el, 'id'));
};

/**
 * @param {string} fieldName
 * @param {string} databaseTable
 * @returns {(req: {
 * 	 body: {
 * 		 [key: string]: string | string[] | IncompleteInvalidReasons | number[],
 *     validationOutcome: string
 *   }
 * }, res: Response, next: NextFunction) => Promise<object | void>}
 */
const checkLookupValuesAreValid = (fieldName, databaseTable) => async (req, res, next) => {
	let {
		body: { [fieldName]: valuesToCheck }
	} = req;

	if (valuesToCheck) {
		valuesToCheck = typeof valuesToCheck !== 'object' ? [valuesToCheck] : valuesToCheck;

		if (isIncompleteInvalidReasons(valuesToCheck)) {
			valuesToCheck = valuesToCheck.map(({ id }) => id);
		}

		const lookupValues = await commonRepository.getLookupList(databaseTable);
		const lookupValueIds = lookupValues.map(({ id }) => id);
		const hasValidValues = valuesToCheck.every((valueToCheck) =>
			lookupValueIds.includes(Number(valueToCheck))
		);

		if (!hasValidValues) {
			return res.status(404).send({ errors: { [fieldName]: ERROR_NOT_FOUND } });
		}
	}

	next();
};

export default checkLookupValuesAreValid;
