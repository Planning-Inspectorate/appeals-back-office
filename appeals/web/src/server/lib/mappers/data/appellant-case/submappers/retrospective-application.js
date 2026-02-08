import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRetrospectiveApplication = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	return booleanSummaryListItem({
		id: 'retrospective-application',
		text: 'Did anyone submit a retrospective planning application?',
		value: appellantCaseData.enforcementNotice?.retrospectiveApplication,
		defaultText: 'No data',
		link: `${currentRoute}/retrospective-application/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
};
