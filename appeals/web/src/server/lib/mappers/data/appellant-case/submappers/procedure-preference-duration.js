import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapProcedurePreferenceDuration = ({ appellantCaseData, currentRoute }) =>
	textSummaryListItem({
		id: 'procedure-preference-duration',
		text: 'How many days would you expect the inquiry to last?',
		editable: !appellantCaseData.isEnforcementChild,
		value: getProcedurePreferenceDuration(appellantCaseData.appellantProcedurePreferenceDuration),
		link: `${currentRoute}/procedure-preference/duration/change`,
		cypressDataName: 'change-procedure-preference-duration'
	});

/**
 * @param {number?} duration
 * @returns {string}
 */
const getProcedurePreferenceDuration = (duration) => {
	const singularOrPluralDays = duration !== 1 ? 'days' : 'day';
	return duration !== null && duration !== undefined
		? `${duration} ${singularOrPluralDays}`
		: 'Not answered';
};
