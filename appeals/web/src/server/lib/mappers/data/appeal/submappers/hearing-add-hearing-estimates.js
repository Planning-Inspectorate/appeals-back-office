import { simpleHtml } from '#lib/mappers/components/instructions/html.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAddHearingEstimates = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'add-hearing-estimates';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return simpleHtml({
		id,
		content: `<p><a id="addHearingEstimates" class="govuk-body govuk-link" href="${currentRoute}/hearing/estimates/add">Add hearing estimates</a></p>`
	});
};
