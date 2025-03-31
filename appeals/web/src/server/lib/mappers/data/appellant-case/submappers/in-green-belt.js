import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInGreenBelt = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'green-belt',
		text: 'Is the appeal site in a green belt?',
		value: appellantCaseData.isGreenBelt,
		defaultText: 'No data',
		link: `${currentRoute}/green-belt/change/appellant`,
		editable: userHasUpdateCase
	});
