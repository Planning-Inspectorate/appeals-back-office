import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_TYPE_OF_PLANNING_APPLICATION } from 'pins-data-model';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';

/**
 * @param {string | null | undefined } typeOfPlanningApplication
 * @returns {string}
 */
const applicationTypeText = (typeOfPlanningApplication) => {
	if (!typeOfPlanningApplication) {
		return '';
	}
	switch (typeOfPlanningApplication) {
		// note: although the constant refers to 'FULL_APPEAL'
		// we are actually referring to the original planning application here
		case APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL:
			return 'Full planning';
		default:
			return capitalizeFirstLetter(typeOfPlanningApplication.split('-').join(' '));
	}
};

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationType = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'appeal-type',
		text: 'What type of application is your appeal about?',
		value: applicationTypeText(appellantCaseData.typeOfPlanningApplication),
		link: `${currentRoute}/#`,
		editable: false
	});
