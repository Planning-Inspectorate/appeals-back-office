import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'appealSite',
		'siteAreaSquareMetres',
		'isGreenBelt',
		'ownsAllLand',
		'knowsOtherLandowners',
		'siteAccessRequired',
		'healthAndSafety'
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		'appealSite',
		'siteAreaSquareMetres',
		'isGreenBelt',
		'ownsAllLand',
		'knowsOtherLandowners',
		'siteAccessRequired',
		'healthAndSafety'
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'appealSite',
		'highwayLand',
		'advertInPosition',
		'isGreenBelt',
		'ownsAllLand',
		'knowsOtherLandowners',
		'siteAccessRequired',
		'landownerPermission',
		'healthAndSafety'
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'appealSite',
		'highwayLand',
		'advertInPosition',
		'isGreenBelt',
		'ownsAllLand',
		'knowsOtherLandowners',
		'siteAccessRequired',
		'landownerPermission',
		'healthAndSafety'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'appealSite',
		'siteAreaSquareMetres',
		'isGreenBelt',
		'ownsAllLand',
		'knowsOtherLandowners',
		'siteAccessRequired',
		'healthAndSafety'
	],
	[APPEAL_TYPE.S78]: [
		'appealSite',
		'siteAreaSquareMetres',
		'isGreenBelt',
		'ownsAllLand',
		'knowsOtherLandowners',
		'isPartOfAgriculturalHolding',
		'isTenant',
		'hasOtherTenants',
		'siteAccessRequired',
		'healthAndSafety'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'appealSite',
		'isGreenBelt',
		'siteAccessRequired',
		'healthAndSafety'
	]
};
