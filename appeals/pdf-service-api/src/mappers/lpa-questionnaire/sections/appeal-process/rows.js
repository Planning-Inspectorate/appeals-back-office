import { formatSentenceCase, formatYesNoDetails } from '../../../../lib/nunjucks-filters/index.js';

function formatOngoingAppeals(otherAppeals) {
	if (!otherAppeals || otherAppeals.length === 0) {
		return 'No';
	}
	return formatYesNoDetails(otherAppeals.map((appeal) => appeal.appealReference || appeal));
}

function formatExtraConditions(hasExtraConditions, extraConditions) {
	return hasExtraConditions ? formatYesNoDetails(extraConditions) : 'No';
}

export const rowBuilders = {
	lpaProcedurePreference: (data) => ({
		key: 'Which procedure do you think is most appropriate for this appeal?',
		text: formatSentenceCase(data.lpaProcedurePreference, 'N/A')
	}),

	lpaProcedurePreferenceDetails: (data) => ({
		key: 'Why would you prefer this procedure?',
		text: formatSentenceCase(data.lpaProcedurePreferenceDetails, 'N/A')
	}),

	lpaProcedurePreferenceDuration: (data) => ({
		key: 'How many days would you expect the inquiry/hearing to last?',
		text: formatSentenceCase(data.lpaProcedurePreferenceDuration?.toString(), 'N/A')
	}),

	anySignificantChangesLpa: (data) => {
		if (data.anySignificantChangesLpa !== 'Yes') {
			return {
				key: 'Have there been any significant changes that would affect the application?',
				html: 'No'
			};
		}

		const details = [];
		if (data.anySignificantChangesLpa_localPlanSignificantChanges) {
			details.push(`Local plan: ${data.anySignificantChangesLpa_localPlanSignificantChanges}`);
		}
		if (data.anySignificantChangesLpa_nationalPolicySignificantChanges) {
			details.push(
				`National policy: ${data.anySignificantChangesLpa_nationalPolicySignificantChanges}`
			);
		}
		if (data.anySignificantChangesLpa_courtJudgementSignificantChanges) {
			details.push(
				`Court judgment: ${data.anySignificantChangesLpa_courtJudgementSignificantChanges}`
			);
		}
		if (data.anySignificantChangesLpa_otherSignificantChanges) {
			details.push(`Other: ${data.anySignificantChangesLpa_otherSignificantChanges}`);
		}

		if (details.length === 0) {
			return {
				key: 'Have there been any significant changes that would affect the application?',
				html: 'Yes'
			};
		}

		return {
			key: 'Have there been any significant changes that would affect the application?',
			html: formatYesNoDetails(details)
		};
	},

	otherAppeals: (data) => ({
		key: 'Are there any other ongoing appeals next to, or close to the site?',
		html: formatOngoingAppeals(data.otherAppeals || [])
	}),

	hasExtraConditions: (data) => ({
		key: 'Are there any new conditions?',
		html: formatExtraConditions(data.hasExtraConditions, data.extraConditions || [])
	})
};
