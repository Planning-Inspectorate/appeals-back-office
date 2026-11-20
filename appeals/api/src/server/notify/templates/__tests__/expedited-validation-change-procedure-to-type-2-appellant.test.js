import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('expedited-validation-change-procedure-to-type-2-appellant.md', () => {
	test('should call notify sendEmail with the correct data - change to written representations (part 2)', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'expedited-validation-change-procedure-to-type-2-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				appeal_procedure: 'written representations (part 2)',
				due_date: '04 January 2027',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We are reviewing the procedure type for appeal 134526. It will follow the written representations (part 2) procedure.',
			'',
			'You will need to provide additional documents.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# What happens next',
			'',
			'Submit your additional documents to caseofficers@planninginspectorate.gov.uk and to your local planning authority by 04 January 2027.',
			'',
			'• your appeal statement',
			'• all the plans and drawings you submitted with your planning application',
			'• any supporting documents you submitted with your planning application',
			'• any other supporting documents',
			'',
			'Find out more about [the appeal procedures](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide) and the documents you need to submit for each of them.',
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
	});

	it.each(['hearing', 'inquiry'])(
		'should call notify sendEmail with the correct data - change to %s',
		async (newProcedureType) => {
			const notifySendData = {
				doNotMockNotifySend: true,
				templateName: 'expedited-validation-change-procedure-to-type-2-appellant',
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
				'You will need to provide additional documents.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: 134526',
				'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				'Planning application reference: 48269/APP/2021/1482',
				'',
				'# What happens next',
				'',
				'Submit your additional documents to caseofficers@planninginspectorate.gov.uk and to your local planning authority by 04 January 2027.',
				'',
				'• your appeal statement',
				'• your statement of common ground',
				'• all the plans and drawings you submitted with your planning application',
				'• any supporting documents you submitted with your planning application',
				'• any other supporting documents',
				'',
				'Find out more about [the appeal procedures](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide) and the documents you need to submit for each of them.',
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
