import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import {
	formatDocumentData,
	formatSentenceCase,
	formatYesNo
} from '../../../lib/nunjucks-filters/index.js';

export function applicationDetailsSection(templateData) {
	const { applicationDate, developmentDescription, otherAppeals, developmentType, appealType } =
		templateData;

	const { applicationDecisionLetter } = templateData.documents || {};

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

	return {
		heading: 'Application details',
		items: [
			{ key: 'What date did you submit your application?', text: formatDate(applicationDate) },
			{
				key: 'Enter the description of development that you submitted in your application',
				text: formatSentenceCase(developmentDescription?.details)
			},
			{
				key: 'Are there other appeals linked to your development?',
				text: formatYesNo(otherAppeals?.length > 0)
			},
			// Development type will not appear for householder
			// Decision letter appears here for Householder, for other appeal types appears in upload documents
			...(!isHASAppeal
				? [{ key: 'Development type', text: formatSentenceCase(developmentType, 'Not provided') }]
				: [
						{
							key: 'Decision letter from the local planning authority',
							html: formatDocumentData(applicationDecisionLetter)
						}
				  ])
		]
	};
}
