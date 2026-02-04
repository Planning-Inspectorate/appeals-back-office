import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapContactPlanningInspectorateDate = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const hasData = appellantCaseData.enforcementNotice?.contactPlanningInspectorateDate !== null;
	const actionText = appellantCaseData.enforcementNotice?.contactPlanningInspectorateDate
		? 'Change'
		: 'Add';
	return textSummaryListItem({
		id: 'contact-planning-inspectorate-date',
		text: 'When did you contact the Planning Inspectorate?',
		value: !hasData
			? 'No data'
			: actionText === 'Add'
				? 'Not answered'
				: dateISOStringToDisplayDate(
						appellantCaseData.enforcementNotice?.contactPlanningInspectorateDate
					),
		link: `${currentRoute}/contact-planning-inspectorate-date/change`,
		actionText,
		editable: hasData && userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
};
