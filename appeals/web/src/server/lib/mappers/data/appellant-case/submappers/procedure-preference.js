import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreference = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference',
		text: 'How would you prefer us to decide your appeal?',
		editable: !appellantCaseData.isEnforcementChild,
		value: getProcedurePreference(appellantCaseData.appellantProcedurePreference),
		link: `${currentRoute}/procedure-preference/change`,
		cypressDataName: 'change-procedure-preference'
	});

/**
 * @param {string?} procedurePreference
 * @returns {string}
 */
const getProcedurePreference = (procedurePreference) => {
	if (procedurePreference === 'written') {
		return 'Written representation';
	}
	return capitalize(procedurePreference || 'Not answered');
};
