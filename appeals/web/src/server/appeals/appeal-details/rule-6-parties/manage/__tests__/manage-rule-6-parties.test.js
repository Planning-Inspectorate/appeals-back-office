// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('manage rule 6 parties', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /rule-6-parties/manage', () => {
		it('should render the manage rule 6 parties page with the expected content', async () => {
			nock('http://test/')
				.get(`/appeals/2?include=appealRule6Parties`)
				.reply(200, {
					...appealData,
					appealId: 2,
					appealRule6Parties: [
						{
							id: 1,
							serviceUser: {
								organisationName: 'Test Organisation',
								email: 'test@example.com'
							}
						},
						{
							id: 2,
							serviceUser: {
								organisationName: 'Test Organisation 2',
								email: 'test2@example.com'
							}
						}
					]
				});

			const response = await request.get(`${baseUrl}/2/rule-6-parties/manage`);
			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text);
			expect(html.innerHTML).toMatchSnapshot();

			expect(html.querySelector('h1').textContent).toBe('Manage rule 6 parties');

			const summaryList = html.querySelector('#rule-6-parties-summary-list');
			const rows = summaryList.querySelectorAll('.govuk-summary-list__row');
			expect(rows.length).toBe(2);

			expect(rows[0].querySelector('.govuk-summary-list__key').textContent.trim()).toBe(
				'Test Organisation'
			);
			expect(rows[0].querySelector('.govuk-summary-list__value').textContent.trim()).toBe(
				'test@example.com'
			);
			expect(
				rows[0].querySelector('.govuk-summary-list__actions a[data-cy="change-rule-6-party-1"]')
					.textContent
			).toBe('Change');
			expect(
				rows[0].querySelector('.govuk-summary-list__actions a[data-cy="change-rule-6-party-1"]')
					.attributes.href
			).toBe(
				'/appeals-service/appeal-details/2/rule-6-parties/change/1?backUrl=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fmanage'
			);
			expect(
				rows[0].querySelector('.govuk-summary-list__actions a[data-cy="remove-rule-6-party-1"]')
					.textContent
			).toBe('Remove');
			expect(
				rows[0].querySelector('.govuk-summary-list__actions a[data-cy="remove-rule-6-party-1"]')
					.attributes.href
			).toBe(
				'/appeals-service/appeal-details/2/rule-6-parties/remove/1?backUrl=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fmanage'
			);

			expect(rows[1].querySelector('.govuk-summary-list__key').textContent.trim()).toBe(
				'Test Organisation 2'
			);
			expect(rows[1].querySelector('.govuk-summary-list__value').textContent.trim()).toBe(
				'test2@example.com'
			);
			expect(
				rows[1].querySelector('.govuk-summary-list__actions a[data-cy="change-rule-6-party-2"]')
					.textContent
			).toBe('Change');
			expect(
				rows[1].querySelector('.govuk-summary-list__actions a[data-cy="change-rule-6-party-2"]')
					.attributes.href
			).toBe(
				'/appeals-service/appeal-details/2/rule-6-parties/change/2?backUrl=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fmanage'
			);
			expect(
				rows[1].querySelector('.govuk-summary-list__actions a[data-cy="remove-rule-6-party-2"]')
					.textContent
			).toBe('Remove');
			expect(
				rows[1].querySelector('.govuk-summary-list__actions a[data-cy="remove-rule-6-party-2"]')
					.attributes.href
			).toBe(
				'/appeals-service/appeal-details/2/rule-6-parties/remove/2?backUrl=%2Fappeals-service%2Fappeal-details%2F2%2Frule-6-parties%2Fmanage'
			);
		});

		it('should have a back link to the appeal details page', async () => {
			nock('http://test/')
				.get(`/appeals/2?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId: 2 });

			const response = await request.get(`${baseUrl}/2/rule-6-parties/manage`);
			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text, { rootElement: 'body' });
			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2'
			);
		});

		it('should have a back link to the original page if specified', async () => {
			nock('http://test/')
				.get(`/appeals/2?include=appealRule6Parties`)
				.reply(200, { ...appealData, appealId: 2 });

			const response = await request.get(`${baseUrl}/2/rule-6-parties/manage?backUrl=/my-cases`);
			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text, { rootElement: 'body' });
			expect(html.querySelector('.govuk-back-link').getAttribute('href')).toBe('/my-cases');
		});
	});
});
