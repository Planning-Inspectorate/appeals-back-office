import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementEffectiveDate = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'enforcement-effective-date',
		text: 'What is the effective date on your enforcement notice?',
		value: appellantCaseData.enforcementNotice?.effectiveDate || 'No data',
		link: `${currentRoute}/enforcement-notice-effective-date/change`,
		editable: userHasUpdateCase
	});
