import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealType = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'appeal-type',
		text: 'What type of application is your appeal about?',
		value: appealDetails.appealType,
		link: `${currentRoute}/#`,
		editable: userHasUpdateCase
	});
