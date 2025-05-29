import { get } from 'lodash-es';
import { ensureArray } from '#lib/array-utilities.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RepresentationRejectionReason} RepresentationRejectionReason */

/**
 * @param {Representation} comment
 * @param {RepresentationRejectionReason[]} rejectionReasonOptions
 * @param {import('@pins/express').Session} session
 * @param {string | string[]} sessionKey
 * @param {{ optionId: number, message: string }} [error]
 * @returns {import('#appeals/appeals.types.js').CheckboxItemParameter[]}
 */
export function mapRejectionReasonOptionsToCheckboxItemParameters(
	comment,
	rejectionReasonOptions,
	session,
	sessionKey,
	error
) {
	const rejectionReasons = comment.rejectionReasons || [];
	const rejectionReasonMap = new Map(rejectionReasons.map((reason) => [reason.id, reason]));

	const selectedReasons = (() => {
		const value = get(session, sessionKey)?.rejectionReason;
		if (!value) {
			return [];
		}

		return ensureArray(value);
	})();

	return rejectionReasonOptions.map((reason) => {
		const selectedReason = rejectionReasonMap.get(reason.id);
		const id = reason.id.toString();

		const selectedTextItems = (() => {
			const sessionContent = get(session, sessionKey);
			const value = sessionContent?.[`rejectionReason-${reason.id}`];
			if (!value) return null;

			delete sessionContent[`rejectionReason-${reason.id}`];

			return ensureArray(value);
		})();

		return {
			value: id,
			text: reason.name,
			checked:
				error?.optionId === reason.id || Boolean(selectedReason) || selectedReasons.includes(id),
			error: error?.message,
			hasText: reason.hasText,
			textItems: selectedTextItems || selectedReason?.text || ['']
		};
	});
}
