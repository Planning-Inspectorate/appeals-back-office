export const urlPaths = {
	appealsList: '/appeals-service/all-cases',
	personalList: '/appeals-service/personal-list',
	personalListFilteredEventReadyToSetup:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=event',
	personalListFilteredAwaitingEvent:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=awaiting_event',
	allCases: '/appeals-service/all-cases?pageSize=1000&pageNumber=1',
	caseDetails: '/appeals-service/appeal-details',
	personalListFilteredEvidence:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=evidence',
	personalListFilteredStatement:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=statements',
	personalListFilteredValidation:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=validation',
	personalListFilteredReadyToStart:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=ready_to_start',
	personalListFilteredLpaQuestionnaire:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=2&appealStatusFilter=lpa_questionnaire',
	personalListFilteredSiteVisit:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=site_visit',
	personalListFilteredHearing:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=hearing',
	personalListFilteredInquiry:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=inquiry',
	personalListFilteredDecision:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=decision',
	personalListFilteredExpedited:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=expedited',
	personalListFilteredFinalComments:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=final_comments',
	personalListFilteredEvent:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=event',
	personalListFilteredIssueDetermination:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=issue_determination'
};

/**
 *
 * @param {string} status - The appeal status to filter by (e.g., 'event', 'awaiting_event', 'evidence', 'statements').
 * @returns
 */
export const getPersonalListURLWithFilter = (status) => {
	return `${urlPaths.personalList}&appealStatusFilter=${status}`;
};
