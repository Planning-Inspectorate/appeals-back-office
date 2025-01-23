/** @typedef {import('@pins/appeals.api').Schema.AppellantCaseIncompleteReason|import('@pins/appeals.api').Schema.LPAQuestionnaireIncompleteReason} Reason */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCaseIncompleteReasonsSelected|import('@pins/appeals.api').Schema.LPAQuestionnaireIncompleteReasonsSelected} ReasonSelected */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCaseIncompleteReasonText|import('@pins/appeals.api').Schema.LPAQuestionnaireIncompleteReasonText} ReasonText */

/**
 * @param {ReasonSelected[]} reasonsArray - The array of reasons objects containing incomplete or invalid reasons
 * @returns {string[]} - List of formatted reasons
 */
export const getFormattedReasons = (reasonsArray) => {
	if (!reasonsArray || reasonsArray.length === 0) {
		throw new Error('No reasons found');
	}

	// Infer keys from the first item in the array
	const firstItem = reasonsArray[0];
	const reasonNameKey = Object.keys(firstItem).find(
		(key) => /Reason$/.test(key) && !/ReasonId$/.test(key)
	);
	const reasonTextKey = Object.keys(firstItem).find((key) => /ReasonText$/.test(key));

	if (!reasonNameKey || !reasonTextKey) {
		throw new Error('Unable to infer keys from the given array');
	}

	return reasonsArray.flatMap((item) => {
		// @ts-ignore
		const reasonText = /** @type {ReasonText[]} */ (item)[reasonTextKey];
		// @ts-ignore
		const reasonName = /** @type {Reason} */ (item)[reasonNameKey];

		if (reasonText.length > 0) {
			return reasonText.map(
				(/** @type {ReasonText} */ textItem) => `${reasonName.name}: ${textItem.text}`
			);
		} else {
			return [reasonName.name];
		}
	});
};
