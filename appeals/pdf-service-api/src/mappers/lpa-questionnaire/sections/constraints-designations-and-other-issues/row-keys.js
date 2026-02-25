import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'isCorrectAppealType',
		'appealUnderActSection',
		'planningPermission',
		'lpaEnforcementNotice',
		'relatedApplications',
		'lpaConsiderAppealInvalid'
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		'isCorrectAppealType',
		'affectsListedBuilding',
		'conservationMap',
		'isGreenBelt'
	],
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'isCorrectAppealType',
		'affectsListedBuilding',
		'conservationMap',
		'isGreenBelt'
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'isCorrectAppealType',
		'affectsListedBuilding',
		'affectsScheduledMonument',
		'conservationMap',
		'hasProtectedSpecies',
		'isSiteInAreaOfSpecialControlAdverts',
		'isGreenBelt',
		'isAonbNationalLandscape',
		'designatedSiteNames'
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'isCorrectAppealType',
		'changesListedBuilding',
		'affectsListedBuilding',
		'affectsScheduledMonument',
		'conservationMap',
		'hasProtectedSpecies',
		'isSiteInAreaOfSpecialControlAdverts',
		'isGreenBelt',
		'isAonbNationalLandscape',
		'designatedSiteNames'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'isCorrectAppealType',
		'changesListedBuilding',
		'affectsListedBuilding',
		'preserveGrantLoan',
		'affectsScheduledMonument',
		'conservationMap',
		'hasProtectedSpecies',
		'isGreenBelt',
		'isAonbNationalLandscape',
		'designatedSiteNames',
		'treePreservationPlan',
		'isGypsyOrTravellerSite',
		'definitiveMapStatement',
		'historicEnglandConsultation'
	],
	[APPEAL_TYPE.S78]: [
		'isCorrectAppealType',
		'changesListedBuilding',
		'affectsListedBuilding',
		'affectsScheduledMonument',
		'conservationMap',
		'hasProtectedSpecies',
		'isGreenBelt',
		'isAonbNationalLandscape',
		'designatedSiteNames',
		'treePreservationPlan',
		'isGypsyOrTravellerSite',
		'definitiveMapStatement'
	]
};
