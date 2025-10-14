import { app } from '@azure/functions';
import listedBuildingHandler from '../listed-building/index.js';

const appConfig = {
	topicListedBuilding: process.env.SB_TOPIC_NAME_LISTED_BUILDING || 'listed-building',
	subscriptionListedBuilding:
		process.env.SB_SUBSCRIPTION_NAME_LISTED_BUILDING || 'listed-building-bo-sub'
};

app.serviceBusTopic('listed-building', {
	connection: 'ServiceBusConnection',
	topicName: appConfig.topicListedBuilding,
	subscriptionName: appConfig.subscriptionListedBuilding,
	handler: listedBuildingHandler
});
