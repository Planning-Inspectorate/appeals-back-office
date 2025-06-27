// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
describe('notify preview tests', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('/appeals/notify-preview/correction-notice-decision.content.md', () => {
		describe('POST', () => {
			test('get notify preview for correction-notice-decision.content.md', async () => {
				const personalisation = {
					appeal_reference_number: `12345`,
					site_address: `2222`,
					lpa_reference: `planningApplicationReference`,
					correction_notice_reason: `correctionNotice`,
					decision_date: `dateISOStringToDisplayDate(file.receivedDate)`
				};
				const response = await request
					.post(`/appeals/notify-preview/correction-notice-decision.content.md`)
					.set('azureAdUserId', azureAdUserId)
					.send(personalisation);

				expect(response.status).toEqual(200);
				expect(response.body).toMatchSnapshot();
			});
		});
	});
});
