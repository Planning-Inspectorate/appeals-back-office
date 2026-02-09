/**
 * @typedef {import('../appeals/appeal-details/appeal-details.types.js').BodyValidationOutcome} BodyValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('@pins/appeals.api').Appeals.IncompleteInvalidReasonsResponse} IncompleteInvalidReasonResponse
 * @typedef {import('../appeals/appeal-details/lpa-questionnaire/lpa-questionnaire.types.js').LPAQuestionnaireSessionValidationOutcome} LPAQuestionnaireSessionValidationOutcome
 * @typedef {import('../appeals/appeal-details/appellant-case/appellant-case.types.js').AppellantCaseSessionValidationOutcome} AppellantCaseSessionValidationOutcome
 */

/**
 *
 * @param {ReasonOption[]} reasonOptions
 * @param {number[]|undefined} checkedOptions
 * @param {IncompleteInvalidReasonResponse[]} existingReasons
 * @param {BodyValidationOutcome} bodyValidationOutcome
 * @param {string} bodyValidationBaseKey
 * @param {AppellantCaseSessionValidationOutcome|LPAQuestionnaireSessionValidationOutcome|undefined} sessionValidationOutcome
 * @param {import('@pins/express').ValidationErrors | undefined} error
 * @returns {import('../appeals/appeals.types.js').CheckboxItemParameter[]}
 */
export function mapReasonOptionsToCheckboxItemParameters(
	reasonOptions,
	checkedOptions,
	existingReasons,
	bodyValidationOutcome,
	bodyValidationBaseKey,
	sessionValidationOutcome,
	error = undefined
) {
	return reasonOptions.map((reason) => {
		const addAnotherTextItemsFromExistingOutcome = getAddAnotherTextItemsFromExistingOutcome(
			reason,
			existingReasons
		);
		const addAnotherTextItemsFromSession = getAddAnotherTextItemsFromSession(
			reason,
			sessionValidationOutcome
		);
		const addAnotherTextItemsFromBody = getAddAnotherTextItemsFromBody(
			reason,
			bodyValidationOutcome,
			bodyValidationBaseKey
		);

		let textItems = [''];

		if (addAnotherTextItemsFromBody) {
			textItems = addAnotherTextItemsFromBody.length > 0 ? addAnotherTextItemsFromBody : [''];
		} else if (addAnotherTextItemsFromSession) {
			textItems = addAnotherTextItemsFromSession;
		} else if (addAnotherTextItemsFromExistingOutcome) {
			textItems = addAnotherTextItemsFromExistingOutcome;
		}

		const errors = textItems.map((textItem, index) => {
			return error && error?.[`${bodyValidationBaseKey}-${reason.id}-${index + 1}`]?.msg
				? error?.[`${bodyValidationBaseKey}-${reason.id}-${index + 1}`]?.msg
				: undefined;
		});

		return {
			value: `${reason.id}`,
			text: reason.name,
			checked: checkedOptions?.includes(reason.id) || false,
			...(reason.hasText && {
				addAnother: { textItems },
				error: errors
			})
		};
	});
}

/**
 *
 * @param {ReasonOption} reasonOption
 * @param {IncompleteInvalidReasonResponse[]} existingReasons
 * @returns {string[]|undefined}
 */
function getAddAnotherTextItemsFromExistingOutcome(reasonOption, existingReasons) {
	return existingReasons.find((existingReason) => existingReason?.name?.id === reasonOption.id)
		?.text;
}

/**
 *
 * @param {ReasonOption} reasonOption
 * @param {AppellantCaseSessionValidationOutcome|LPAQuestionnaireSessionValidationOutcome|undefined} sessionValidationOutcome
 * @returns {string[]|undefined}
 */
function getAddAnotherTextItemsFromSession(reasonOption, sessionValidationOutcome) {
	return sessionValidationOutcome?.reasonsText?.[reasonOption.id];
}

/**
 *
 * @param {ReasonOption} reasonOption
 * @param {BodyValidationOutcome|undefined} bodyValidationOutcome
 * @param {string} bodyValidationBaseKey
 * @returns {string[]|undefined}
 */
function getAddAnotherTextItemsFromBody(
	reasonOption,
	bodyValidationOutcome,
	bodyValidationBaseKey
) {
	/** @type {string[]|undefined} */
	let addAnotherTextItemsFromBody =
		Object.keys(bodyValidationOutcome || {}).length &&
		(bodyValidationOutcome || {})[`${bodyValidationBaseKey}-${reasonOption.id}`];

	if (addAnotherTextItemsFromBody) {
		if (!Array.isArray(addAnotherTextItemsFromBody)) {
			addAnotherTextItemsFromBody = [addAnotherTextItemsFromBody];
		}

		return addAnotherTextItemsFromBody;
	}
}

/**
 *
 * @param {Object<string, any>} requestBody
 * @param {'invalidReason'|'incompleteReason'|'missingDocuments'} reasonKey
 * @returns {Object<string, string[]>}
 */
export function getNotValidReasonsTextFromRequestBody(requestBody, reasonKey) {
	if (!requestBody[reasonKey]) {
		throw new Error(`reasonKey "${reasonKey}" not found in requestBody`);
	}

	/** @type {Object<string, string[]>} */
	const reasonsText = {};

	let bodyReasonIds = Array.isArray(requestBody[reasonKey])
		? requestBody[reasonKey]
		: [requestBody[reasonKey]];

	for (const reasonId of bodyReasonIds) {
		const textItemsKey = `${reasonKey}-${reasonId}`;

		if (requestBody[textItemsKey]) {
			const reasonsTextKey = `${reasonId}`;
			reasonsText[reasonsTextKey] = Array.isArray(requestBody[textItemsKey])
				? requestBody[textItemsKey]
				: [requestBody[textItemsKey]];

			reasonsText[reasonsTextKey] = reasonsText[reasonsTextKey].filter(
				(reason) => reason.length > 0
			);
		}
	}

	return reasonsText;
}
