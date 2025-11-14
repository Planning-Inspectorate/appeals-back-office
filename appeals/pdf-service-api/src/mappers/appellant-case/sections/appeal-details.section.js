import { appealTypeToAppealCaseTypeMapper } from '@pins/appeals/utils/appeal-type-case.mapper.js';
import isExpeditedAppealType from '@pins/appeals/utils/is-expedited-appeal-type.js';
import { formatSentenceCase } from '../../../lib/nunjucks-filters/index.js';

export function appealDetailsSection(templateData) {
	const {
		appellantProcedurePreference,
		appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount,
		appealType
	} = templateData;

	const isExpeditedAppeal = isExpeditedAppealType(appealTypeToAppealCaseTypeMapper(appealType));

	if (isExpeditedAppeal) return;

	return {
		heading: 'Appeal details',
		items: [
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
				text: formatSentenceCase(
					appellantProcedurePreferenceWitnessCount?.toString(),
					'Not provided'
				)
			}
		]
	};
}
