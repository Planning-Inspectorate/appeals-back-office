export const urlPaths = {
	appealsList: '/appeals-service/all-cases',
	personalList: '/appeals-service/personal-list?pageSize=1000&pageNumber=1',
	personalListFilteredEventReadyToSetup:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=event',
	personalListFilteredAwaitingEvent:
		'/appeals-service/personal-list?pageSize=1000&pageNumber=1&appealStatusFilter=awaiting_event'
};
