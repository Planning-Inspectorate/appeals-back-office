import { appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
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
		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { ...appellantCaseDataNotValidated, localPlanningDepartment: lpaList[1].name });
	});
	afterEach(teardown);

	describe('GET change-appeal-details/local-planning-authority', () => {
		it('should render the local planning authority page pre-selected', async () => {
			const response = await request.get(
				`${baseUrl}/1/change-appeal-details/local-planning-authority`
			);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Local planning authority');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST change-appeal-details/local-planning-authority', () => {
		beforeEach(() => {
			nock('http://test/').post('/appeals/1/lpa').reply(200, { success: true });
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		afterEach(() => {
			nock.cleanAll();
		});
		it('should redirect to correct url when lpa field is populated and valid', async () => {
			const response = await request
				.post(`${baseUrl}/1/change-appeal-details/local-planning-authority`)
				.send({ localPlanningAuthority: 2 });

			expect(response.text).toEqual(
				`Found. Redirecting to ${baseUrl}/1/change-appeal-details/local-planning-authority/check-details?backUrl=%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-details%2Flocal-planning-authority`
			);
			expect(response.statusCode).toBe(302);
		});
		it('should redirect to correct url when update local planning authority is clicked', async () => {
			const response = await request
				.post(`${baseUrl}/1/change-appeal-details/local-planning-authority/check-details`)
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
			expect(element.innerHTML).toContain('Local planning authority');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Enter the local planning authority.');
		});
	});

	describe('GET change-appeal-details/local-planning-authority/check-details', () => {
		beforeEach(() => {
			nock('http://test/').post('/appeals/1/lpa').reply(200, { success: true });
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/case-team-email')
				.reply(200, { email: 'test@example.com' });
			nock('http://test/')
				.post('/appeals/notify-preview/lpa-changed-appellant.content.md')
				.reply(200, { renderedHtml: 'appellant preview' });
			nock('http://test/')
				.post('/appeals/notify-preview/lpa-removed.content.md')
				.reply(200, { renderedHtml: 'lpa preview' });
		});

		afterEach(() => {
			nock.cleanAll();
		});
		it('should render the check details page with email previews', async () => {
			await request
				.post(`${baseUrl}/1/change-appeal-details/local-planning-authority`)
				.send({ localPlanningAuthority: 2 });

			const response = await request.get(
				`${baseUrl}/1/change-appeal-details/local-planning-authority/check-details`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and update local planning authority');
			expect(element.innerHTML).toContain('Preview email to appellant');
			expect(element.innerHTML).toContain('Preview email to lpa');
		});
	});
});
