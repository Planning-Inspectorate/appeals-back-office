import { formatSentenceCase } from '../../../lib/nunjucks-filters/index.js';

export function appealDetailsSection(templateData) {
	const {
		appealType,
		appellantProcedurePreference,
		appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount
	} = templateData;

	return {
		heading: 'Appeal details',
		items: [
			{
				key: 'What type of application is your appeal about?',
				text: formatSentenceCase(appealType, 'Not provided')
			},
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
