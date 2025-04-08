import { simpleHtml } from '#lib/mappers/components/instructions/html.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAddHearingEstimates = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'add-hearing-estimates';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return simpleHtml({
		id,
		content: `<h3 class="govuk-heading-m">Hearing estimates</h3><p><a class="govuk-body govuk-link" href="${currentRoute}/hearing/add-estimates">Add hearing estimates</a></p>`
	});
};
