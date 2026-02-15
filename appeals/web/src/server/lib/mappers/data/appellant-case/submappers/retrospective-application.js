import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRetrospectiveApplication = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const retrospectiveApplication =
		appellantCaseData.enforcementNotice?.retrospectiveApplication || null;

	return booleanSummaryListItem({
		id: 'retrospective-application',
		text: 'Did anyone submit a retrospective planning application?',
		value: retrospectiveApplication,
		defaultText: 'Not answered',
		link: `${currentRoute}/retrospective-application/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		actionText: retrospectiveApplication !== null ? 'Change' : 'Add'
	});
};
