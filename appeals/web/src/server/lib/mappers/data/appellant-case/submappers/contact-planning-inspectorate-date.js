import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapContactPlanningInspectorateDate = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const actionText = appellantCaseData.enforcementNotice?.contactPlanningInspectorateDate
		? 'Change'
		: 'Add';
	return textSummaryListItem({
		id: 'contact-planning-inspectorate-date',
		text: 'When did you contact the Planning Inspectorate?',
		value: appellantCaseData.enforcementNotice
			? appellantCaseData.enforcementNotice.contactPlanningInspectorateDate || 'Not answered'
			: 'No data',
		link: `${currentRoute}/contact-planning-inspectorate-date/${actionText.toLowerCase()}`,
		actionText,
		editable: userHasUpdateCase
	});
};
