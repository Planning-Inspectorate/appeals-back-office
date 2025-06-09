import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapTypeOfPlanningApplication = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'appeal-type',
		text: 'What type of application is your appeal about?',
		value: appellantCaseData.typeOfPlanningApplication,
		link: `${currentRoute}/#`,
		editable: false
	});
