import { ServiceBusClient } from '@azure/service-bus';

const connectionString =
	'Endpoint=sb://localhost:5672;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;';
const topicName = 'appeal-fo-lpa-questionnaire-submission';

async function main() {
	const sbClient = new ServiceBusClient(connectionString);
	const sender = sbClient.createSender(topicName);

	try {
		console.log(`Sending message to topic: ${topicName}`);
		await sender.sendMessages({
			body: {
				casedata: {
					caseReference: '1000000',
					caseType: 'D',
					lpaQuestionnaireSubmittedDate: new Date().toISOString(),
					siteAccessDetails: null,
					siteSafetyDetails: null,
					nearbyCaseReferences: null,
					neighbouringSiteAddresses: null,
					isCorrectAppealType: true,
					affectedListedBuildingNumbers: null,
					isGreenBelt: false,
					inConservationArea: false,
					newConditionDetails: null,
					notificationMethod: null,
					lpaCostsAppliedFor: false,
					lpaStatement: null
				},
				documents: []
			},
			applicationProperties: { type: 'Create' }
		});
		console.log('Message sent successfully!');
	} catch (err) {
		console.error('Error sending message:', err);
	} finally {
		await sender.close();
		await sbClient.close();
	}
}

main();
