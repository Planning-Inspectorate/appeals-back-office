import { isOutcomeIncomplete, isOutcomeInvalid } from './check-validation-outcome.js';

/** @typedef {import('@pins/appeals.api').Schema.AppellantCaseIncompleteReasonsSelected} AppellantCaseIncompleteReasonsSelected */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCaseInvalidReasonsSelected} AppellantCaseInvalidReasonsSelected */
/** @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaireIncompleteReasonsSelected} LPAQuestionnaireIncompleteReasonsSelected */
/** @typedef {import('@pins/appeals.api').Api.InvalidIncompleteReason} InvalidIncompleteReason */

/**
 * @param {AppellantCaseIncompleteReasonsSelected | AppellantCaseInvalidReasonsSelected | LPAQuestionnaireIncompleteReasonsSelected} reason
 * @returns {InvalidIncompleteReason}}
 */
const mapIncompleteInvalidReasons = (reason) => {
	if ('appellantCaseIncompleteReason' in reason) {
		return {
			name: reason.appellantCaseIncompleteReason,
			text: reason.appellantCaseIncompleteReasonText?.map(({ text }) => text)
		};
	} else if ('appellantCaseInvalidReason' in reason) {
		return {
			name: reason.appellantCaseInvalidReason,
			text: reason.appellantCaseInvalidReasonText?.map(({ text }) => text)
		};
	}

	return {
		name: reason.lpaQuestionnaireIncompleteReason,
		text: reason.lpaQuestionnaireIncompleteReasonText?.map(({ text }) => text)
	};
};

/**
 * @param {string | null} outcome
 * @param {Array<AppellantCaseIncompleteReasonsSelected | LPAQuestionnaireIncompleteReasonsSelected> | null} [incompleteReasons]
 * @param {AppellantCaseInvalidReasonsSelected[]} [invalidReasons]
 * @returns {{outcome: string|null, invalidReasons: InvalidIncompleteReason[]|undefined, incompleteReasons: InvalidIncompleteReason[]|undefined } | null}
 */
const formatValidationOutcomeResponse = (outcome, incompleteReasons, invalidReasons) => {
	if (outcome) {
		return {
			outcome: outcome || null,
			invalidReasons: isOutcomeInvalid(outcome)
				? invalidReasons?.map((reason) => mapIncompleteInvalidReasons(reason))
				: undefined,
			incompleteReasons: isOutcomeIncomplete(outcome)
				? incompleteReasons?.map((reason) => mapIncompleteInvalidReasons(reason))
				: undefined
		};
	}
	return null;
};

export default formatValidationOutcomeResponse;
