import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationReference = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-reference',
		text: 'What is the application reference number?',
		value: appellantCaseData.planningApplicationReference,
		link: `${currentRoute}/lpa-reference/change`,
		editable: userHasUpdateCase
	});
