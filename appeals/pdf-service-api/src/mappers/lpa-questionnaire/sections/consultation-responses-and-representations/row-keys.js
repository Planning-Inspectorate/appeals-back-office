import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: ['otherPartyRepresentations'],
	[APPEAL_TYPE.CAS_PLANNING]: ['otherPartyRepresentations'],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: ['otherPartyRepresentations', 'consultedBodiesDetails'],
	[APPEAL_TYPE.ADVERTISEMENT]: ['otherPartyRepresentations', 'consultedBodiesDetails'],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'otherPartyRepresentations',
		'consultationResponses',
		'consultedBodiesDetails'
	],
	[APPEAL_TYPE.S78]: [
		'otherPartyRepresentations',
		'consultationResponses',
		'consultedBodiesDetails'
	]
};
