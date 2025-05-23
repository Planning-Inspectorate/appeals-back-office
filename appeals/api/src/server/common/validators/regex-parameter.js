import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @param {RegExp} regex
 * @param {string | null} parentKeyOptional
 * @returns {ValidationChain}
 */
const validateRegex = (parameterName, regex, parentKeyOptional = null) => {
	const chain = body(parameterName);

	if (parentKeyOptional) {
		chain.if(body(parentKeyOptional).exists({ values: 'null' }));
	}
	return chain.exists({ checkFalsy: true }).matches(regex);
};

export default validateRegex;
