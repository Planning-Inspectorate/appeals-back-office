import { simpleHtml } from '#lib/mappers/components/instructions/html.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCancelHearing = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'cancel-hearing';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return simpleHtml({
		id,
		content: `<p class="govuk-body govuk-!-margin-bottom-4">
			<a id="cancelHearing" class="govuk-body govuk-link" href="${currentRoute}/hearing/cancel">Cancel hearing</a></p>`
	});
};
