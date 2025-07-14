# Notifications

The api back-end communicates changes to relevant parties by sending email notifications through the [Gov.UK Notify](https://www.notifications.service.gov.uk/) service.

See the [list of email notifications](notifications-and-triggers.md) sent and what triggers them.

In local development, the notifications will not be sent, but simply logged to the Notify system. At runtime, the API still requires a test mailbox to successfully invoke Notify.

You can update the api back-end environment settings in `/appeals/api/.env` to add the following settings:

```shell
TEST_MAILBOX=test@example.com
GOV_NOTIFY_API_KEY=########-####-####-####-############
GOV_NOTIFY_APPEAL_GENERIC_ID=########-####-####-####-############
```

All templates are stored as **nunjucks template/markdown hybrid** files located within the codebase at [Notify Templates](../appeals/api/src/server/notify/templates) as _.content.md and _.subject.md template pairs for the email content and subject line respectively.

When an email is sent, the templates are rendered using nunjucks to generate markdown with the personalisation variables pre-populated prior to sending the contents to Notify with the generic template id `GOV_NOTIFY_APPEAL_GENERIC_ID`.

> [!IMPORTANT]
> The `API GOV_NOTIFY_API_KEY` cannot be publicly disclosed, and needs to be retrieved through the repository owner

When developing locally, it's advantageous to prevent any emails from being sent to notify at all and instead emulate this process and have approximate rendering of these emails in the local temporary email folder `/appeals/api/temp` as \*.html files.

This can be done by adding the following environment setting in `/appeals/api/.env`

```shell
NOTIFY_SEND_MAIL_EMULATOR=true
```

### The following is an example of how to send an email with a template name of 'test-my-email' via Notify within the api of this codebase

- Add two templates to the notify templates folder `/appeals/api/src/server/notify/templates` with one for the content and one for the subject line of the email:

##### test-my-email.subject.md

```markdown
Subject line appeal {{appeal_reference_number}}
```

##### test-my-email.content.md

```markdown
# Appeal {{appeal_reference_number}}

Dear {{first_name}} {{last_name}},
Please see your list of information below:
{{information}}
```

##### An example of how to use the above templates and send an email

```javascript
import { notifySend } from '#notify/notify-send.js';

/**
 *
 * @param {Appeal} appeal
 * @param { import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @returns
 */
export async function sendMyEmail(appeal, notifyClient) {
	const personalisation = {
		appeal_reference_number: appeal.reference,
		first_name: appeal.user.first_name,
		last_name: appeal.user.last_name,
		information: ['Item 1', 'Item 2', 'Item 3']
	};
	const recipientEmail = 'mytestemail@test.com';
	await notifySend({
		templateName: 'test-my-email',
		notifyClient,
		recipientEmail: 'test@136s7.com',
		personalisation
	});
}
```

Don't forget to write tests for the new templates following the convention of the other tests found in `/appeals/api/src/server/notify/templates/__tests__`

A test for the above example would be:

```javascript
describe('appeal-invalid.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'test-my-email',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				first_name: 'John',
				last_name: 'Doe',
				information: ['Item 1', 'Item 2', 'Item 3']
			}
		};

		const expectedContent = [
			'# Appeal 134526',
			'',
			'Dear John Doe,',
			'Please see your list of information below:',
			'- Item 1',
			'- Item 2',
			'- Item 3'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Subject line appeal 134526'
			}
		);
	});
});
```
