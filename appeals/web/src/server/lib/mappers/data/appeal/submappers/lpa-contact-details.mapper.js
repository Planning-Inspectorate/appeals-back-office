import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaContactDetails = ({
	appealDetails,
	currentRoute
	//userHasUpdateCasePermission
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
		editable: false, //todo: a2-2605 userHasUpdateCasePermission,
		classes: 'appeal-lpa-contact-details'
	});
