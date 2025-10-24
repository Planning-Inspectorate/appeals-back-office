import { simpleHtml } from '#lib/mappers/components/instructions/html.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCancelInquiry = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'cancel-inquiry';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return simpleHtml({
		id,
		content: `<p class="govuk-body govuk-!-margin-bottom-4">
			<a id="cancelInquiry" class="govuk-body govuk-link" href="${currentRoute}/inquiry/cancel">Cancel inquiry</a></p>`
	});
};
