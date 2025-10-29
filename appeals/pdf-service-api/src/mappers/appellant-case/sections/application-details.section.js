import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import {
	formatBulletedList,
	formatDocumentData,
	formatSentenceCase
} from '../../../lib/nunjucks-filters/index.js';

// implements functionality from web/src/server/lib/appeals-formatter
function appealShortReference(reference) {
	if (typeof reference !== 'string') {
		return reference;
	}

	const referenceParts = reference.split(/\/|-/);

	if (referenceParts.length === 1) {
		return reference;
	}
	return referenceParts[referenceParts.length - 1];
}

export function applicationDetailsSection(templateData) {
	const { applicationDate, developmentDescription, otherAppeals, developmentType, appealType } =
		templateData;

	const { applicationDecisionLetter } = templateData.documents || {};

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

	const otherAppealsList =
		otherAppeals?.map((otherAppeal) => appealShortReference(otherAppeal.appealReference)) || [];

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
				html: formatBulletedList(otherAppealsList, 'No')
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
