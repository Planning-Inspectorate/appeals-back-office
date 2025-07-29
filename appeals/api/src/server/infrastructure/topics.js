import config from '#config/config.js';

export const producers = {
	boCaseData: config.serviceBusOptions.topicAppealHas,
	boCaseDataS78: config.serviceBusOptions.topicAppealS78,
	boDocument: config.serviceBusOptions.topicAppealDocument,
	boServiceUser: config.serviceBusOptions.topicAppealServiceUser,
	boEventData: config.serviceBusOptions.topicAppealEvent,
	boEventEstimate: config.serviceBusOptions.topicAppealEventEstimate,
	boBlobMove: config.serviceBusOptions.topicDocumentMove,
	boRepresentation: config.serviceBusOptions.topicAppealRepresentation
};

export const consumers = {
	foCaseData: 'appeal-fo-appellant-submission',
	foLpaQuestionnaire: 'appeal-fo-lpa-response-submission',
	odwEmployee: 'employee',
	odwCaseData: '',
	odwDocuments: ''
};
