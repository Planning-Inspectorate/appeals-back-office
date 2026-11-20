import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('expedited-validation-change-procedure-to-type-2-lpa.md', () => {
	it.each(['written representations (part 2)', 'hearing', 'inquiry'])(
		'should call notify sendEmail with the correct data - change to %s',
		async (newProcedureType) => {
			const notifySendData = {
				doNotMockNotifySend: true,
				templateName: 'expedited-validation-change-procedure-to-type-2-lpa',
				notifyClient: {
					sendEmail: jest.fn()
				},
				recipientEmail: 'test@136s7.com',
				personalisation: {
					lpa_reference: '48269/APP/2021/1482',
					appeal_reference_number: '134526',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					appeal_procedure: newProcedureType,
					due_date: '04 January 2027',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				}
			};

			const expectedContent = [
				`We are reviewing the procedure type for appeal 134526. It will follow the ${newProcedureType} procedure.`,
				'',
				'We have asked the appellant to submit additional documents.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: 134526',
				'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				'Planning application reference: 48269/APP/2021/1482',
				'',
				'# What happens next',
				'',
				'[Find out more about your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
				'',
				'We will send you an email when you can view information from other parties in the appeals service.',
				'',
				'Planning Inspectorate',
				'caseofficers@planninginspectorate.gov.uk'
			].join('\n');

			await notifySend(notifySendData);

			expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
				{
					id: 'mock-appeal-generic-id'
				},
				'test@136s7.com',
				{
					content: expectedContent,
					subject: 'We are reviewing the procedure type for appeal 134526'
				}
			);
		}
	);
});
