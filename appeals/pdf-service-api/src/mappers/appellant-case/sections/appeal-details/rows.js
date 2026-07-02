import { formatSentenceCase } from '../../../../lib/nunjucks-filters/index.js';

export const rowBuilders = {
	appellantProcedurePreference: (data) => ({
		key: 'How would you prefer us to decide your appeal?',
		text: formatSentenceCase(data.appellantProcedurePreference, 'Not answered')
	}),
	appellantProcedurePreferenceDetails: (data) => ({
		key: 'Why would you prefer this appeal procedure?',
		html: formatSentenceCase(data.appellantProcedurePreferenceDetails, 'Not provided')
	}),
	appellantProcedurePreferenceDuration: (data) => ({
		key: 'How many days would you expect the inquiry to last?',
		html: formatSentenceCase(data.appellantProcedurePreferenceDuration?.toString(), 'Not provided')
	}),
	appellantProcedurePreferenceWitnessCount: (data) => ({
		key: 'How many witnesses would you expect to give evidence at the inquiry?',
		text: formatSentenceCase(
			data.appellantProcedurePreferenceWitnessCount?.toString(),
			'Not provided'
		)
	})
};
