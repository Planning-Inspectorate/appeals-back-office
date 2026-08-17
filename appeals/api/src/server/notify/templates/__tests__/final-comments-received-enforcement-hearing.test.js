import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';
import { FRONT_OFFICE_DASHBOARD_PATH_STUBS } from '@pins/appeals/constants/common.js';

describe('final-comments-received-enforcement-hearing.md', () => {
	test.each([
		['appellant', FRONT_OFFICE_DASHBOARD_PATH_STUBS.APPELLANT, 'local planning authority'],
		['lpa', FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA, 'appellant']
	])(
		'should call notify sendEmail with the correct data - hearing date set - %s',
		async (_receivingParty, dashboardStub, submittingParty) => {
			const notifySendData = {
				doNotMockNotifySend: true,
				templateName: 'final-comments-received-enforcement-hearing',
				notifyClient: {
					sendEmail: jest.fn()
				},
				recipientEmail: 'test@136s7.com',
				personalisation: {
					appeal_reference_number: 'ABC45678',
					site_address: '10, Test Street',
					lpa_reference: '12345XYZ',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					hearing_date: '15 October 2025',
					hearing_time: '10:00 AM',
					hearing_expected_days: 5,
					inspector_name: 'John Doe',
					hearing_address: '10, Test Street, London, UK',
					front_office_url: '/mock-front-office-url',
					fo_dashboard_stub: dashboardStub,
					submitting_party: submittingParty
				}
			};

			const expectedContent = [
				`We have received the ${submittingParty}'s final comments.`,
				'',
				`You can [view this information in the appeal service](/mock-front-office-url/${dashboardStub}/ABC45678).`,
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Hearing details',
				'',
				'^Date: 15 October 2025',
				'Time: 10:00 AM',
				'Expected days: 5',
				'Inspector: John Doe',
				'Venue address: 10, Test Street, London, UK',
				'',
				'We will contact you if we make any changes to the hearing.',
				'',
				'',
				'The Planning Inspectorate',
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
					subject: `We have received the ${submittingParty}'s final comments: ABC45678`
				}
			);
		}
	);

	test.each([
		['appellant', FRONT_OFFICE_DASHBOARD_PATH_STUBS.APPELLANT, 'local planning authority'],
		['lpa', FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA, 'appellant']
	])(
		'should call notify sendEmail with the correct data - no hearing date set - %s',
		async (_receivingParty, dashboardStub, submittingParty) => {
			const notifySendData = {
				doNotMockNotifySend: true,
				templateName: 'final-comments-received-enforcement-hearing',
				notifyClient: {
					sendEmail: jest.fn()
				},
				recipientEmail: 'test@136s7.com',
				personalisation: {
					appeal_reference_number: 'ABC45678',
					site_address: '10, Test Street',
					lpa_reference: '12345XYZ',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk',
					front_office_url: '/mock-front-office-url',
					fo_dashboard_stub: dashboardStub,
					submitting_party: submittingParty
				}
			};

			const expectedContent = [
				`We have received the ${submittingParty}'s final comments.`,
				'',
				`You can [view this information in the appeal service](/mock-front-office-url/${dashboardStub}/ABC45678).`,
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'We will contact you by email when we set up the hearing.',
				'',
				'',
				'The Planning Inspectorate',
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
					subject: `We have received the ${submittingParty}'s final comments: ABC45678`
				}
			);
		}
	);
});
