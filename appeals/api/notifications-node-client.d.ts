declare module 'notifications-node-client' {
	export class NotifyClient {
		constructor(apiKey: string);
		sendEmail(
			templateId: string,
			emailAddress: string,
			personalisation: Record<string, string | string[] | undefined>
		);
	}
}
