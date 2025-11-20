import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementNoticeListedBuilding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const hasData = appellantCaseData.enforcementNotice?.isListedBuilding !== null;
	return booleanSummaryListItem({
		id: 'enforcement-notice-listed-building',
		text: 'Is your enforcement notice about a listed building?',
		value: appellantCaseData.enforcementNotice?.isListedBuilding,
		defaultText: 'No data',
		link: `${currentRoute}/enforcement-notice-listed-building/change`,
		editable: hasData && userHasUpdateCase
	});
};
