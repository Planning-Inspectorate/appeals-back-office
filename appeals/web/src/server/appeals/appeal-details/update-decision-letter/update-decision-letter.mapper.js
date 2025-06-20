import { appealShortReference } from '#lib/appeals-formatter.js';
import { textareaInput } from '#lib/mappers/index.js';

/** @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} AppellantCase */
/** @typedef {import('../appeal-details.types.js').WebAppeal} Appeal */
/** @typedef {{folderId: number, documentId: string, documentName: string, letterDate: string, outcome: string}} Decision */

/**
 *
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} [correctionNotice]
 * @param {import('@pins/express').ValidationErrors|null|undefined} [errors]

 * @returns {PageContent}
 */
export const correctionNoticePage = (appealId, appealReference, correctionNotice, errors) => {
	const backLinkUrl = `/appeals-service/appeal-details/${appealId}/update-decision-letter/upload-decision-letter?backUrl=/appeals-service/appeal-details/${appealId}/appeal-decision`;

	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal decision',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Correction notice',
		pageComponents: [
			textareaInput({
				name: 'correctionNotice',
				id: 'correction-notice',
				labelIsPageHeading: true,
				value: correctionNotice || '',
				errorMsg: errors?.correctionNotice.msg
			})
		]
	};

	return pageContent;
};
