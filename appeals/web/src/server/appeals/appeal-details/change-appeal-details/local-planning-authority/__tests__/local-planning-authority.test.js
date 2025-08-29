import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();

const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const lpaList = [
	{
		id: 1,
		lpaCode: 'Q1111',
		name: 'System Test Borough Council 2',
		email: 'test@example.com'
	},
	{
		id: 2,
		lpaCode: 'MAID',
		name: 'Maidstone Borough Council',
		email: 'test2@example.com'
	},
	{
		id: 3,
		lpaCode: 'BARN',
		name: 'Barnsley Metropolitan Borough Council',
		email: 'test3@example.com'
	},
	{
		id: 4,
		lpaCode: 'Q9999',
		name: 'System Test Borough Council',
		email: 'test4@example.com'
	}
];

describe('change-appeal-details/local-planning-authority', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/').get('/appeals/local-planning-authorities').reply(200, lpaList);
	});
	afterEach(teardown);

	describe('GET change-appeal-details/local-planning-authority', () => {
		it('should render the local planning authority page', async () => {
			const response = await request.get(
				`${baseUrl}/1/change-appeal-details/local-planning-authority`
			);
			const element = parseHtml(response.text);

			expect(response.text).toContain(`<a href="${baseUrl}/1" class="govuk-back-link">Back</a>`);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Local planning authority');
			expect(element.innerHTML).not.toContain(lpaList[0].name);
			expect(element.innerHTML).toContain(lpaList[1].name);
			expect(element.innerHTML).toContain(lpaList[2].name);
			expect(element.innerHTML).not.toContain(lpaList[3].name);
			expect(element.innerHTML).not.toContain(`checked`);
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST change-appeal-details/local-planning-authority', () => {
		beforeEach(() => {
			nock('http://test/').post('/appeals/1/lpa').reply(200, { success: true });
		});

		afterEach(() => {
			nock.cleanAll();
		});
		it('should redirect to correct url when lpa field is populated and valid', async () => {
			const response = await request
				.post(`${baseUrl}/1/change-appeal-details/local-planning-authority`)
				.send({ localPlanningAuthority: 2 });

			expect(response.text).toEqual(`Found. Redirecting to ${baseUrl}/1`);
			expect(response.statusCode).toBe(302);
		});

		it('should re-render the page with an error message if required field is missing', async () => {
			const response = await request
				.post(`${baseUrl}/1/change-appeal-details/local-planning-authority`)
				.send({});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Local planning authority</h1>');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Select the local planning authority');
		});
	});
});
