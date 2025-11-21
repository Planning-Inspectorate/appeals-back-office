import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementEffectiveDate = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const hasData = appellantCaseData.enforcementNotice?.effectiveDate !== null;
	return textSummaryListItem({
		id: 'enforcement-effective-date',
		text: 'What is the effective date on your enforcement notice?',
		value: appellantCaseData.enforcementNotice?.effectiveDate
			? dateISOStringToDisplayDate(appellantCaseData.enforcementNotice.effectiveDate)
			: 'No data',
		link: `${currentRoute}/enforcement-effective-date/change`,
		editable: hasData && userHasUpdateCase
	});
};
