// @ts-nocheck
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const mockGrounds = [
	{ name: 'a', id: 1, hasText: false },
	{ name: 'b', id: 2, hasText: false },
	{ name: 'c', id: 3, hasText: false },
	{ name: 'd', id: 4, hasText: false },
	{ name: 'e', id: 5, hasText: false },
	{ name: 'f', id: 6, hasText: false },
	{ name: 'g', id: 7, hasText: false },
	{ name: 'h', id: 8, hasText: false },
	{ name: 'i', id: 9, hasText: false },
	{ name: 'j', id: 10, hasText: false },
	{ name: 'k', id: 11, hasText: false }
];

describe('grounds', () => {
	beforeEach(installMockApi);
	afterEach(teardown);
	describe('GET /grounds-and-facts', () => {
		it('should render the change grounds page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200);

			nock('http://test/')
				.get(`/appeals/appellant-case-enforcement-grounds-mismatch-facts`)
				.reply(200, mockGrounds);

			const response = await request.get(
				`${baseUrl}/${appealData.appealId}/appellant-case/incomplete/grounds-facts-check`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Which grounds do not match the facts?</h1></legend>'
			);
			// id =\"grounds-facts\" name=\"groundsFacts\" type=\"checkbox\" value=\"1\">
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-facts" name="groundsFacts" type="checkbox" value="${mockGrounds[0].id}"`
			);

			for (let i = 1; i < mockGrounds.length; i++) {
				expect(unprettifiedElement.innerHTML).toContain(
					`id="grounds-facts-${i + 1}" name="groundsFacts" type="checkbox" value="${mockGrounds[i].id}"`
				);
			}
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /grounds-facts-check', () => {
		it(`should redirect to the date page`, async () => {
			nock('http://test/')
				.get(`/appeals/appellant-case-enforcement-grounds-mismatch-facts`)
				.reply(200, mockGrounds);

			const response = await request
				.post(`${baseUrl}/${appealData.appealId}/appellant-case/incomplete/grounds-facts-check`)
				.send({
					groundsFacts: ['1', '3'],
					'groundsFacts-1': 'reason for ground a',
					'groundsFacts-3': 'reason for ground c'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealData.appealId}/appellant-case/incomplete/date`
			);
		});
		it(`should redirect to the date page when a single ELB specific grounds are selected`, async () => {
			nock('http://test/')
				.get(`/appeals/appellant-case-enforcement-grounds-mismatch-facts`)
				.reply(200, mockGrounds);

			const response = await request
				.post(`${baseUrl}/${appealData.appealId}/appellant-case/incomplete/grounds-facts-check`)
				.send({
					groundsFacts: '10',
					'groundsFacts-10': 'reason for ground j'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealData.appealId}/appellant-case/incomplete/date`
			);
		});

		it(`should redirect to the date page when a nultiple ELB specific grounds are selected`, async () => {
			nock('http://test/')
				.get(`/appeals/appellant-case-enforcement-grounds-mismatch-facts`)
				.reply(200, mockGrounds);

			const response = await request
				.post(`${baseUrl}/${appealData.appealId}/appellant-case/incomplete/grounds-facts-check`)
				.send({
					groundsFacts: ['10', '11'],
					'groundsFacts-10': 'reason for ground j',
					'groundsFacts-11': 'reason for ground k'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealData.appealId}/appellant-case/incomplete/date`
			);
		});
		it('should return validation errors if no reasons are provided', async () => {
			nock('http://test/')
				.get(`/appeals/appellant-case-enforcement-grounds-mismatch-facts`)
				.reply(200, mockGrounds);

			const response = await request
				.post(`${baseUrl}/${appealData.appealId}/appellant-case/incomplete/grounds-facts-check`)
				.send({
					groundsFacts: ['1', '3']
				});
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason for selecting ground (1)</a>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason for selecting ground (3)</a>');
		});
	});
});
