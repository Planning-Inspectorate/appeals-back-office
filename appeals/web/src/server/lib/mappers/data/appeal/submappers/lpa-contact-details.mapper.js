import { textSummaryListItem } from '#lib/mappers/index.js';
import { isLpaqReceived } from '#lib/mappers/utils/is-lpaq-received.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaContactDetails = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-contact-details',
		text: 'Local planning authority (LPA)',
		value: {
			html:
				appealDetails.localPlanningDepartment && appealDetails.lpaEmailAddress
					? `<ul class="govuk-list"><li>${appealDetails.localPlanningDepartment}</li><li>${appealDetails.lpaEmailAddress}</li></ul>`
					: 'Awaiting questionnaire'
		},
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: userHasUpdateCasePermission && !isLpaqReceived(appealDetails),
		classes: 'appeal-lpa-contact-details'
	});
