import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatSentenceCase, formatYesNoDetails } from '../../../lib/nunjucks-filters/index.js';

function formatOngoingAppeals(otherAppeals) {
	if (!otherAppeals || otherAppeals.length === 0) {
		return 'No';
	}
	return formatYesNoDetails(otherAppeals.map((appeal) => appeal.appealReference || appeal));
}

function formatExtraConditions(hasExtraConditions, extraConditions) {
	return hasExtraConditions ? formatYesNoDetails(extraConditions) : 'No';
}

export function appealProcessSection(templateData) {
	const {
		lpaProcedurePreference,
		lpaProcedurePreferenceDetails,
		lpaProcedurePreferenceDuration,
		otherAppeals = [],
		hasExtraConditions,
		extraConditions = [],
		appealType
	} = templateData;

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

	return {
		heading: 'Appeal process',
		items: [
			// does not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Which procedure do you think is most appropriate for this appeal?',
							text: formatSentenceCase(lpaProcedurePreference, 'N/A')
						},
						{
							key: 'Why would you prefer this procedure?',
							text: formatSentenceCase(lpaProcedurePreferenceDetails, 'N/A')
						},
						{
							key: 'How many days would you expect the inquiry/hearing to last?',
							text: formatSentenceCase(lpaProcedurePreferenceDuration?.toString(), 'N/A')
						}
				  ]
				: []),
			{
				key: 'Are there any other ongoing appeals next to, or close to the site?',
				html: formatOngoingAppeals(otherAppeals)
			},
			{
				key: 'Are there any new conditions?',
				html: formatExtraConditions(hasExtraConditions, extraConditions)
			}
		]
	};
}
