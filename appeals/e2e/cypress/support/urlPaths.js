export const urlPaths = {
	appealsList: '/appeals-service/all-cases',
	personalList: '/appeals-service/personal-list?pageSize=1000&pageNumber=1',
	personalListFilteredEventReadyToSetup:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=event',
	personalListFilteredAwaitingEvent:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=awaiting_event',
	allCases: '/appeals-service/all-cases?pageSize=1000&pageNumber=1',
	caseDetails: '/appeals-service/appeal-details',
	personalListFilteredEvidence:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=evidence',
	personalListFilteredStatement:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=statements'
};

/**
 *
 * @param {string} status - The appeal status to filter by (e.g., 'event', 'awaiting_event', 'evidence', 'statements').
 * @returns
 */
export const getPersonalListURLWithFilter = (status) => {
	return `${urlPaths.personalList}&appealStatusFilter=${status}`;
};
