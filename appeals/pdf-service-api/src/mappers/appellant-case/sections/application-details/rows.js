import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	formatBulletedList,
	date as formatDate,
	formatDocumentData,
	formatSentenceCase
} from '../../../../lib/nunjucks-filters/index.js';

export const rowBuilders = {
	applicationDate: (data) => ({
		key: 'What date did you submit your application?',
		text: formatDate(data.applicationDate)
	}),
	siteUseAtTimeOfApplication: (data) => ({
		key: 'What did you use the appeal site for when you made the application?',
		html: formatSentenceCase(data.siteUseAtTimeOfApplication)
	}),
	applicationMadeUnderActSection: (data) => ({
		key: 'What type of lawful development certificate is the appeal about?',
		html: formatSentenceCase(data.applicationMadeUnderActSection)
	}),
	developmentDescription: (data) => ({
		key: [APPEAL_TYPE.CAS_ADVERTISEMENT, APPEAL_TYPE.ADVERTISEMENT].includes(data.appealType)
			? 'Enter the description of the advertisement'
			: `Enter the description of development that you submitted in your application`,
		text: formatSentenceCase(data.developmentDescription?.details)
	}),
	changedDescription: (data) => ({
		key: 'Agreement to change the description of the advertisement',
		text: formatDocumentData(data.changedDescription)
	}),
	otherAppealsList: (data) => ({
		key: 'Are there other appeals linked to your development?',
		html: formatBulletedList(data.otherAppealsList, 'No')
	}),
	developmentType: (data) => ({
		key: 'Development type',
		text: formatSentenceCase(data.developmentType, 'Not provided')
	}),
	applicationDecisionLetter: (data) => ({
		key: 'Decision letter from the local planning authority',
		html: formatDocumentData(data.applicationDecisionLetter)
	})
};
