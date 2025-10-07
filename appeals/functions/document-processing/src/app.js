import { app } from '@azure/functions';
import documentMoveHandler from '../document-move/index.js';
import malwareDetectionHandler from '../malware-detection/index.js';

const appConfig = {
	topicDocumentMove: process.env.SB_TOPIC_NAME_DOCUMENT_MOVE || 'appeal-document-to-move',
	subscriptionDocumentMove:
		process.env.SB_SUBSCRIPTION_NAME_DOCUMENT_MOVE || 'appeal-document-to-move-bo-sub'
};

app.serviceBusTopic('document-move', {
	connection: 'ServiceBusConnection',
	topicName: appConfig.topicDocumentMove,
	subscriptionName: appConfig.subscriptionDocumentMove,
	handler: documentMoveHandler
});

app.eventGrid('malware-detection', {
	handler: malwareDetectionHandler
});
