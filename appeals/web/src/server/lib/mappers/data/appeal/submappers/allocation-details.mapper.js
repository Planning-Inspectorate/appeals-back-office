import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAllocationDetails = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'allocation-details',
		text: 'Allocation level',
		value: {
			html: mapDetailsHtml(appealDetails.allocationDetails)
		},
		link: `${currentRoute}/allocation-details/allocation-level`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-allocation-details',
		actionText: appealDetails.allocationDetails ? 'Change' : 'Add'
	});

/**
 * @param {import('@pins/appeals.api').Appeals.AppealAllocation|null} [details]
 * @returns {string}
 */
const mapDetailsHtml = (details) => {
	if (!details) {
		return 'No allocation level for this appeal';
	}
	if (details.specialisms.length === 1) {
		return `<div class="govuk-!-margin-0">Level: ${details.level}<br>${details.specialisms[0]}</div>`;
	}

	const specialismsList = details.specialisms.join('</li><li>');
	return `<div class="govuk-!-margin-0">Level: ${details.level}</div><ul class="govuk-!-margin-0"><li>${specialismsList}</li></ul>`;
};
