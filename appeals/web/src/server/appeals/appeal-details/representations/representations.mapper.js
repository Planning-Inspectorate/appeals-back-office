import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { ensureArray } from '#lib/array-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RepresentationRejectionReason} RepresentationRejectionReason */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RejectionReasonUpdateInput} RejectionReasonUpdateInput */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RejectionReasons} RejectionReasons */

/**
 * @param {Representation} comment
 * @param {RepresentationRejectionReason[]} rejectionReasonOptions
 * @param {import('@pins/express').Session} session
 * @param {string} sessionKey
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
		const value = session[sessionKey]?.rejectionReason;
		if (!value) {
			return [];
		}

		return ensureArray(value);
	})();

	return rejectionReasonOptions.map((reason) => {
		const selectedReason = rejectionReasonMap.get(reason.id);
		const id = reason.id.toString();

		const selectedTextItems = (() => {
			const value = session[sessionKey]?.[`rejectionReason-${reason.id}`];
			if (
				!value ||
				(session[sessionKey]?.commentId && session[sessionKey]?.commentId !== comment.id)
			) {
				return null;
			}

			return ensureArray(value);
		})();

		return {
			value: id,
			text: reason.name,
			checked:
				error?.optionId === reason.id || Boolean(selectedReason) || selectedReasons.includes(id),
			error: error?.message,
			hasText: reason.hasText,
			textItems: selectedReason?.text || selectedTextItems || ['']
		};
	});
}

/**
 * @param {RejectionReasons} rejectionReasons
 * @returns {RejectionReasonUpdateInput[]}
 */
export function mapRejectionReasonPayload(rejectionReasons) {
	const { rejectionReason, ...otherReasons } = rejectionReasons;

	/** @type {Record<number, RejectionReasonUpdateInput>} */
	const mappedReasons = {};

	/** @param {string | number} id */
	const addReason = (id) => {
		const numId = parseInt(String(id), 10);
		if (!isNaN(numId) && !mappedReasons[numId]) {
			mappedReasons[numId] = { id: numId, text: [] };
		}
	};

	const reasonsArray = ensureArray(rejectionReason);
	reasonsArray.forEach((id) => {
		if (typeof id === 'string' || typeof id === 'number') {
			addReason(id);
		}
	});

	Object.entries(otherReasons).forEach(([key, value]) => {
		const match = key.match(/^rejectionReason-(\d+)$/);
		if (match) {
			const id = parseInt(match[1], 10);
			if (!isNaN(id)) {
				const texts = ensureArray(value);
				const trimmedTexts = texts
					.filter((text) => typeof text === 'string' && text.trim() !== '')
					.map((text) => (typeof text === 'string' ? text.trim() : ''));

				if (trimmedTexts.length > 0 || reasonsArray.includes(String(id))) {
					addReason(id);
					mappedReasons[id].text = texts
						.filter((text) => typeof text === 'string' && text.trim() !== '')
						.map((text) => text?.toString().trim() ?? '');
				}
			}
		}
	});

	return Object.values(mappedReasons);
}

/**
 * @param {Appeal} appeal
 * @returns {PageContent}
 * */
export function statementAndCommentsSharePage(appeal) {
	const shortAppealReference = appealShortReference(appeal.appealReference);

	const ipCommentsText = (() => {
		const numIpComments = appeal.documentationSummary?.ipComments?.counts?.valid ?? 0;

		return numIpComments > 0
			? `<a href="/appeals-service/appeal-details/${appeal.appealId}/interested-party-comments" class="govuk-link">${numIpComments} interested party comments</a>`
			: null;
	})();

	const statementsText =
		appeal.documentationSummary?.lpaStatement?.representationStatus ===
		APPEAL_REPRESENTATION_STATUS.VALID
			? `<a href="/appeals-service/appeal-details/${appeal.appealId}/lpa-statement" class="govuk-link">1 statement</a>`
			: null;

	const valueTexts = [ipCommentsText, statementsText].filter(Boolean);

	/** @type {PageComponent} */
	const textComponent =
		valueTexts.length > 0
			? {
					type: 'inset-text',
					parameters: {
						html: `We’ll share ${valueTexts.length === 1 ? 'the ' : ''}${valueTexts.join(
							' and '
						)} with the relevant parties.`
					}
			  }
			: {
					type: 'html',
					parameters: {
						html: 'There are no interested party comments or statements to share.'
					}
			  };

	const heading =
		valueTexts.length > 0 ? 'Share IP comments and statements' : 'Progress to final comments';

	return {
		title: heading,
		backLinkUrl: `/appeals-service/appeal-details/${appeal.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading,
		pageComponents: [
			textComponent,
			{
				type: 'warning-text',
				parameters: {
					text: 'Do not confirm until you have reviewed all of the supporting documents and redacted any sensitive information.'
				}
			}
		],
		submitButtonProperties: {
			text: valueTexts.length > 0 ? 'Confirm' : 'Progress case'
		}
	};
}

/**
 * @param {Appeal} appeal
 * @returns {PageContent}
 * */
export function finalCommentsSharePage(appeal) {
	const hasValidFinalCommentsAppellant =
		appeal.documentationSummary.appellantFinalComments?.representationStatus ===
		COMMENT_STATUS.VALID;
	const hasValidFinalCommentsLPA =
		appeal.documentationSummary.lpaFinalComments?.representationStatus === COMMENT_STATUS.VALID;

	const infoText = (() => {
		if (hasValidFinalCommentsAppellant && hasValidFinalCommentsLPA) {
			return `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appeal.appealId}/final-comments/appellant">appellant final comments</a> and <a class="govuk-link" href="/appeals-service/appeal-details/${appeal.appealId}/final-comments/lpa">LPA final comments</a> with the relevant parties.`;
		}

		if (hasValidFinalCommentsAppellant && !hasValidFinalCommentsLPA) {
			return `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appeal.appealId}/final-comments/appellant">appellant final comments</a> with the relevant parties.`;
		}

		if (!hasValidFinalCommentsAppellant && hasValidFinalCommentsLPA) {
			return `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appeal.appealId}/final-comments/lpa">LPA final comments</a> with the relevant parties.`;
		}

		return `There are no final comments to share.`;
	})();

	const hasItemsToShare = hasValidFinalCommentsLPA || hasValidFinalCommentsAppellant;
	const title = hasItemsToShare ? 'Confirm that you want to share final comments' : 'Progress case';
	const warningText = hasItemsToShare
		? 'Do not share until you have reviewed all of the supporting documents and redacted any sensitive information.'
		: 'Do not progress the case if you are awaiting any late final comments.';
	const submitButtonText = hasItemsToShare ? 'Share final comments' : 'Progress case';

	/** @type {PageContent} */
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appeal.appealId}`,
		preHeading: `Appeal ${appealShortReference(appeal.appealReference)}`,
		heading: title,
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">${infoText}</p>`
				}
			},
			{
				type: 'warning-text',
				wrapperHtml: {
					opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
					closing: '</div></div>'
				},
				parameters: {
					text: warningText
				}
			},
			{
				type: 'button',
				wrapperHtml: {
					opening:
						'<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds"><form action="" method="POST" novalidate>',
					closing: '</form></div></div>'
				},
				parameters: {
					text: submitButtonText,
					type: 'submit'
				}
			}
		]
	};

	return pageContent;
}
