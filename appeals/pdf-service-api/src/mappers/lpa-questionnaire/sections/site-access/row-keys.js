import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: ['siteAccessRequired', 'neighbouringSites', 'healthAndSafety'],
	[APPEAL_TYPE.CAS_PLANNING]: ['siteAccessRequired', 'neighbouringSites', 'healthAndSafety'],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'siteAccessRequired',
		'reasonForNeighbourVisits',
		'neighbouringSites',
		'healthAndSafety'
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'siteAccessRequired',
		'reasonForNeighbourVisits',
		'neighbouringSites',
		'healthAndSafety'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'siteAccessRequired',
		'reasonForNeighbourVisits',
		'neighbouringSites',
		'healthAndSafety'
	],
	[APPEAL_TYPE.S78]: [
		'siteAccessRequired',
		'reasonForNeighbourVisits',
		'neighbouringSites',
		'healthAndSafety'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'siteAccessRequired',
		'reasonForNeighbourVisits',
		'neighbouringSites',
		'healthAndSafety'
	]
};
