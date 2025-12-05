// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const mockGrounds = [
	{
		groundRef: 'a',
		groundDescription: 'Ground A'
	},
	{
		groundRef: 'b',
		groundDescription: 'Ground B'
	},
	{
		groundRef: 'c',
		groundDescription: 'Ground C'
	}
];

describe('grounds', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /grounds-for-appeal/change', () => {
		it('should render the change grounds page with grounds "a" and "c" checked', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appealGrounds: [{ ground: { groundRef: 'a' } }, { ground: { groundRef: 'c' } }]
				});

			nock('http://test/').get(`/appeals/grounds`).reply(200, mockGrounds);

			const response = await request.get(
				`${baseUrl}/${appealData.appealId}/appellant-case/grounds-for-appeal/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Choose your grounds of appeal</h1></legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal" name="groundsForAppeal" type="checkbox" value="${mockGrounds[0].groundRef}" checked aria-describedby="grounds-for-appeal-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal-2" name="groundsForAppeal" type="checkbox" value="${mockGrounds[1].groundRef}" aria-describedby="grounds-for-appeal-2-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal-3" name="groundsForAppeal" type="checkbox" value="${mockGrounds[2].groundRef}" checked aria-describedby="grounds-for-appeal-3-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /grounds-for-appeal/change', () => {
		it(`should call grounds for appeal PATCH endpoint and redirect to the appellant case page if at least one ground is selected`, async () => {
			const mockGroundsForAppealPatchEndpoint = nock('http://test/')
				.patch(`/appeals/${appealData.appealId}/grounds-for-appeal`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/${appealData.appealId}/appellant-case/grounds-for-appeal/change`)
				.send({
					groundsForAppeal: ['a', 'c']
				});

			expect(mockGroundsForAppealPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealData.appealId}/appellant-case`
			);
		});

		it('should render the change grounds page in error with no grounds checked when none are selected', async () => {
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}/appellant-cases/${appealData.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appealGrounds: [{ ground: { groundRef: 'a' } }, { ground: { groundRef: 'c' } }]
				});

			nock('http://test/').get(`/appeals/grounds`).reply(200, mockGrounds);

			const response = await request
				.post(`${baseUrl}/${appealData.appealId}/appellant-case/grounds-for-appeal/change`)
				.send({});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Choose your grounds of appeal</h1></legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal" name="groundsForAppeal" type="checkbox" value="${mockGrounds[0].groundRef}" aria-describedby="grounds-for-appeal-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal-2" name="groundsForAppeal" type="checkbox" value="${mockGrounds[1].groundRef}" aria-describedby="grounds-for-appeal-2-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal-3" name="groundsForAppeal" type="checkbox" value="${mockGrounds[2].groundRef}" aria-describedby="grounds-for-appeal-3-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});
});
