import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { appealTypeToAppealCaseTypeMapper } from '@pins/appeals/utils/appeal-type-case.mapper.js';
import { isExpeditedAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { formatSentenceCase } from '../../../lib/nunjucks-filters/index.js';

/**
 * @param {any} templateData
 */
export function appealDetailsSection(templateData) {
	const {
		appellantProcedurePreference,
		appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount,
		appealType
	} = templateData;

	const isExpeditedAppeal =
		isExpeditedAppealType(appealTypeToAppealCaseTypeMapper(appealType)) ||
		appealType === APPEAL_TYPE.S78_EXPEDITED;

	if (isExpeditedAppeal) return;
	const itemsList = [
		{
			key: 'How would you prefer us to decide your appeal?',
			text: formatSentenceCase(appellantProcedurePreference, 'Not answered')
		},
		{
			key: 'Why would you prefer this appeal procedure?',
			text: formatSentenceCase(appellantProcedurePreferenceDetails, 'Not provided')
		},
		{
			key: 'How many days would you expect the inquiry to last?',
			text: formatSentenceCase(appellantProcedurePreferenceDuration?.toString(), 'Not provided')
		},
		{
			key: 'How many witnesses would you expect to give evidence at the inquiry?',
			text: formatSentenceCase(appellantProcedurePreferenceWitnessCount?.toString(), 'Not provided')
		}
	];
	return {
		heading: 'Appeal details',
		items: itemsList
	};
}
