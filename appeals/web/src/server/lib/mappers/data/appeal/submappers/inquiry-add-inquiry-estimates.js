import { simpleHtml } from '#lib/mappers/components/instructions/html.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAddInquiryEstimates = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'add-inquiry-estimates';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return simpleHtml({
		id,
		content: `<p><a id="addInquiryEstimates" class="govuk-body govuk-link" href="${currentRoute}/inquiry/estimates/add">Add inquiry estimates</a></p>`
	});
};
