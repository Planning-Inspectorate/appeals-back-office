// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const mockGrounds = [
	{
		id: 1,
		appealType: APPEAL_TYPE.ENFORCEMENT_NOTICE,
		groundRef: 'a',
		groundDescription: 'Ground A'
	},
	{
		id: 2,
		appealType: APPEAL_TYPE.ENFORCEMENT_NOTICE,
		groundRef: 'b',
		groundDescription: 'Ground B'
	},
	{
		id: 3,
		appealType: APPEAL_TYPE.ENFORCMENT_LISTED_BUILDING,
		groundRef: 'c',
		groundDescription: 'Ground C'
	}
];

describe('grounds', () => {
	afterEach(teardown);

	describe('GET /grounds-for-appeal/change', () => {
		it('should render the change grounds page with grounds "a" and "b" for enforcement appeal', async () => {
			const appeal1 = structuredClone(appealData);
			appeal1.appealType = APPEAL_TYPE.ENFORCEMENT_NOTICE;

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}`)
				.query((actualQueryObject) => {
					return Object.prototype.hasOwnProperty.call(actualQueryObject, 'include');
				})
				.reply(200, appeal1);

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}/appellant-cases/${appeal1.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated
				});

			nock('http://test/').get(`/appeals/grounds`).reply(200, mockGrounds);

			const response = await request.get(
				`${baseUrl}/${appeal1.appealId}/appellant-case/grounds-for-appeal/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Choose your grounds of appeal</h1></legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal" name="groundsForAppeal" type="checkbox" value="${mockGrounds[0].id}" aria-describedby="grounds-for-appeal-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal-2" name="groundsForAppeal" type="checkbox" value="${mockGrounds[1].id}" aria-describedby="grounds-for-appeal-2-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change grounds page with only grounds "c" for enforcement listed building appeal', async () => {
			const appeal1 = structuredClone(appealData);
			appeal1.appealType = APPEAL_TYPE.ENFORCMENT_LISTED_BUILDING;

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}`)
				.query((actualQueryObject) => {
					return Object.prototype.hasOwnProperty.call(actualQueryObject, 'include');
				})
				.reply(200, appeal1);

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}/appellant-cases/${appeal1.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated
				});

			nock('http://test/').get(`/appeals/grounds`).reply(200, mockGrounds);

			const response = await request.get(
				`${baseUrl}/${appeal1.appealId}/appellant-case/grounds-for-appeal/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Choose your grounds of appeal</h1></legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal" name="groundsForAppeal" type="checkbox" value="${mockGrounds[2].id}" aria-describedby="grounds-for-appeal-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /grounds-for-appeal/change', () => {
		it(`should call grounds for appeal PATCH endpoint and redirect to the appellant case page if at least one ground is selected`, async () => {
			const appeal1 = structuredClone(appealData);
			appeal1.appealType = APPEAL_TYPE.ENFORCEMENT_NOTICE;

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}`)
				.query((actualQueryObject) => {
					return Object.prototype.hasOwnProperty.call(actualQueryObject, 'include');
				})
				.reply(200, appeal1);

			const mockGroundsForAppealPatchEndpoint = nock('http://test/')
				.patch(`/appeals/${appeal1.appealId}/grounds-for-appeal`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/${appeal1.appealId}/appellant-case/grounds-for-appeal/change`)
				.send({
					groundsForAppeal: ['1', '2']
				});

			expect(mockGroundsForAppealPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appeal1.appealId}/appellant-case`
			);
		});

		it('should render the change grounds page in error with no grounds checked when none are selected', async () => {
			const appeal1 = structuredClone(appealData);
			appeal1.appealType = APPEAL_TYPE.ENFORCEMENT_NOTICE;

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}`)
				.query((actualQueryObject) => {
					return Object.prototype.hasOwnProperty.call(actualQueryObject, 'include');
				})
				.reply(200, appeal1);

			nock('http://test/')
				.get(`/appeals/${appeal1.appealId}/appellant-cases/${appeal1.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appealGrounds: [{ ground: { groundRef: 'a' } }, { ground: { groundRef: 'c' } }]
				});

			nock('http://test/').get(`/appeals/grounds`).reply(200, mockGrounds);

			const response = await request
				.post(`${baseUrl}/${appeal1.appealId}/appellant-case/grounds-for-appeal/change`)
				.send({});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`<h2 class="govuk-error-summary__title"> There is a problem</h2>`
			);

			expect(unprettifiedElement.innerHTML).toContain(
				`<a href="#grounds-for-appeal">Select your grounds of appeal</a>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Choose your grounds of appeal</h1></legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal" name="groundsForAppeal" type="checkbox" value="${mockGrounds[0].id}" aria-describedby="grounds-for-appeal-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`id="grounds-for-appeal-2" name="groundsForAppeal" type="checkbox" value="${mockGrounds[1].id}" aria-describedby="grounds-for-appeal-2-item-hint">`
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});
});
