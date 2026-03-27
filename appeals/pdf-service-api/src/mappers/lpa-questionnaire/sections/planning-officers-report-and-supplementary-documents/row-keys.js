import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
export const rowKeys = {
	[APPEAL_TYPE.HOUSEHOLDER]: [
		'planningOfficerReport',
		'plansDrawings',
		'developmentPlanPolicies',
		'supplementaryPlanning',
		'emergingPlan'
	],
	[APPEAL_TYPE.CAS_PLANNING]: [
		'planningOfficerReport',
		'developmentPlanPolicies',
		'supplementaryPlanning',
		'emergingPlan'
	],
	[APPEAL_TYPE.CAS_ADVERTISEMENT]: [
		'planningOfficerReport',
		'wasApplicationRefusedDueToHighwayOrTraffic',
		'didAppellantSubmitCompletePhotosAndPlans',
		'developmentPlanPolicies',
		'supplementaryPlanning',
		'emergingPlan',
		'otherRelevantPolicies'
	],
	[APPEAL_TYPE.ADVERTISEMENT]: [
		'planningOfficerReport',
		'wasApplicationRefusedDueToHighwayOrTraffic',
		'didAppellantSubmitCompletePhotosAndPlans',
		'developmentPlanPolicies',
		'supplementaryPlanning',
		'emergingPlan',
		'otherRelevantPolicies'
	],
	[APPEAL_TYPE.PLANNED_LISTED_BUILDING]: [
		'planningOfficerReport',
		'developmentPlanPolicies',
		'supplementaryPlanning',
		'emergingPlan',
		'otherRelevantPolicies',
		'hasInfrastructureLevy',
		'communityInfrastructureLevy',
		'isInfrastructureLevyFormallyAdopted',
		'infrastructureLevyAdoptedDate',
		'infrastructureLevyExpectedDate'
	],
	[APPEAL_TYPE.S78]: [
		'planningOfficerReport',
		'developmentPlanPolicies',
		'supplementaryPlanning',
		'emergingPlan',
		'otherRelevantPolicies',
		'hasInfrastructureLevy',
		'communityInfrastructureLevy',
		'isInfrastructureLevyFormallyAdopted',
		'infrastructureLevyAdoptedDate',
		'infrastructureLevyExpectedDate'
	],
	[APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE]: [
		'planningOfficerReport',
		'hasInfrastructureLevy',
		'communityInfrastructureLevy',
		'isInfrastructureLevyFormallyAdopted',
		'infrastructureLevyAdoptedDate',
		'infrastructureLevyExpectedDate',
		'otherRelevantMatters'
	]
};
