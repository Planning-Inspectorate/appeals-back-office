import { app } from '@azure/functions';
import appellantCaseHandler from '../appellant-case/index.js';
import questionnaireHandler from '../questionnaire/index.js';
import representationHandler from '../representation/index.js';

const appConfig = {
	topicAppealSubmission:
		process.env.SB_TOPIC_NAME_APPEAL_FO_APPELLANT_SUBMISSION || 'appeal-fo-appellant-submission',
	subscriptionAppealSubmission:
		process.env.SB_SUBSCRIPTION_NAME_APPEAL_FO_APPELLANT_SUBMISSION ||
		'appeal-fo-appellant-submission-bo-sub',
	topicQuestionnaireSubmission:
		process.env.SB_TOPIC_NAME_APPEAL_FO_LPA_QUESTIONNAIRE_SUBMISSION ||
		'appeal-fo-lpa-questionnaire-submission',
	subscriptionQuestionnaireSubmission:
		process.env.SB_SUBSCRIPTION_NAME_APPEAL_FO_LPA_QUESTIONNAIRE_SUBMISSION ||
		'appeal-fo-lpa-questionnaire-submission-bo-sub',
	topicRepresentationSubmission:
		process.env.SB_TOPIC_NAME_APPEAL_FO_REPRESENTATION_SUBMISSION ||
		'appeal-fo-representation-submission',
	subscriptionRepresentationSubmission:
		process.env.SB_SUBSCRIPTION_NAME_APPEAL_FO_REPRESENTATION_SUBMISSION ||
		'appeal-fo-representation-submission-bo-sub'
};

app.serviceBusTopic('appellant-case', {
	connection: 'ServiceBusConnection',
	topicName: appConfig.topicAppealSubmission,
	subscriptionName: appConfig.subscriptionAppealSubmission,
	handler: appellantCaseHandler
});

app.serviceBusTopic('questionnaire', {
	connection: 'ServiceBusConnection',
	topicName: appConfig.topicQuestionnaireSubmission,
	subscriptionName: appConfig.subscriptionQuestionnaireSubmission,
	handler: questionnaireHandler
});

app.serviceBusTopic('representation', {
	connection: 'ServiceBusConnection',
	topicName: appConfig.topicRepresentationSubmission,
	subscriptionName: appConfig.subscriptionRepresentationSubmission,
	handler: representationHandler
});
