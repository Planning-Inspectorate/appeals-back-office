import config from '#environment/config.js';

/**
 * The complete permission set.
 * @typedef {Object<string, boolean>} CurrentPermissionSet
 * @property {boolean} viewCaseList 						- Can search and view all cases
 * @property {boolean} viewCaseDetails 					- Can view the details of any case
 * @property {boolean} viewAssignedCaseDetails  - Can only view cases user is assigned to
 * @property {boolean} updateStage 							- Can change the information submitted by a third party (e.g. appellant case, LPA questionnaire, statement, comment)
 * @property {boolean} updateCase  							- Can change core case data (e.g. manage linked and related appeals, change type)
 * @property {boolean} setStageOutcome 					- Can validate a stage (e.g. appellant case, LPA questionnaire)
 * @property {boolean} setCaseOutcome 					- Can issue a decision on the case outcome
 * @property {boolean} setEvents 								- Can book site visits and other events
 */

/**
 * @param {string[]} currentUserGroups
 * @returns {CurrentPermissionSet}
 */
export const calculatePermissions = (currentUserGroups) => {
	const isCaseOfficer = currentUserGroups.includes(config.referenceData.appeals.caseOfficerGroupId);
	const isInspector = currentUserGroups.includes(config.referenceData.appeals.inspectorGroupId);
	const isPads = currentUserGroups.includes(config.referenceData.appeals.padsGroupId);
	const isCqtTeam = currentUserGroups.includes(config.referenceData.appeals.customerServiceGroupId);

	const perms = {
		viewCaseList: !isPads,
		viewCaseDetails: !isPads,
		viewAssignedCaseDetails: isPads,
		updateStage: isCaseOfficer,
		updateCase: isCaseOfficer,
		setStageOutcome: isCaseOfficer,
		setCaseOutcome: isCaseOfficer || isInspector,
		setEvents: isCaseOfficer || isInspector,
		reIssueDecisionLetter: isCaseOfficer || isCqtTeam
	};

	return perms;
};

export const permissionNames = {
	viewCaseList: 'viewCaseList',
	viewCaseDetails: 'viewCaseDetails',
	viewAssignedCaseDetails: 'viewAssignedCaseDetails',
	updateStage: 'updateStage',
	updateCase: 'updateCase',
	setStageOutcome: 'setStageOutcome',
	setCaseOutcome: 'setCaseOutcome',
	setEvents: 'setEvents',
	reIssueDecisionLetter: 'reIssueDecisionLetter'
};
