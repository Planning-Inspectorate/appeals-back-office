import { ServiceBusClient } from '@azure/service-bus';

const connectionString =
	'Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;';
const topicName = 'appeal-has';
const subscriptionName = 'front-office-listener';

async function main() {
	console.log(`Connecting to Service Bus Emulator...`);
	console.log(`Topic: ${topicName}, Subscription: ${subscriptionName}`);

	const sbClient = new ServiceBusClient(connectionString);
	const receiver = sbClient.createReceiver(topicName, subscriptionName);

	console.log(`Listening for messages...`);

	try {
		const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });

		if (messages.length > 0) {
			console.log('\n✅ Message received from Emulator!');
			console.log('--------------------------------------------------');
			console.log('Message ID:', messages[0].messageId);
			console.log('Body:', JSON.stringify(messages[0].body, null, 2));
			console.log('--------------------------------------------------');
		} else {
			console.log('\n⚠️ No messages found in the subscription.');
			console.log(
				"This might mean they were already consumed or the broadcast didn't reach this specific subscription."
			);
		}
	} catch (err) {
		console.error('Error receiving messages:', err);
	} finally {
		await receiver.close();
		await sbClient.close();
	}
}

main().catch((err) => {
	console.error('Error running script:', err);
	process.exit(1);
});
