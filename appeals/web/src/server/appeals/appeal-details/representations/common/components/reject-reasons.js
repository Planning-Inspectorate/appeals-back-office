import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';

/**
 * @param {string[]} selectedReasons
 * @param {import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]} rejectionReasons
 * @returns {string}
 * */
export const rejectionReasonHtml = (selectedReasons, rejectionReasons) => {
	const reasonNames = selectedReasons.map(
		(reasonId) => rejectionReasons.find((r) => r.id === parseInt(reasonId))?.name ?? ''
	);

	return buildHtmUnorderedList(
		reasonNames,
		0,
		'govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0 govuk-list--bullet'
	);
};
