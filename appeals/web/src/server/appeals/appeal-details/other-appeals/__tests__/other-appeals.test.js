import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData, linkableAppeal } from '#testing/appeals/appeals.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const appealDataWithOtherAppeals = {
	...appealData,
	otherAppeals: [
		{
			appealId: 2,
			appealReference: 'TEST-2',
			externalSource: false,
			linkingDate: '2024-02-27T15:44:22.247Z',
			relationshipId: 100
		},
		{
			appealId: null,
			appealReference: 'TEST-3',
			externalSource: true,
			linkingDate: '2024-02-27T15:44:22.247Z',
			relationshipId: 101
		}
	]
};
const testValidLinkableAppealReference = '1234567';
const testInvalidLinkableAppealReference = '7654321';

describe('other-appeals', () => {
	beforeEach(() => {
		nock('http://test/').get('/appeals/1').reply(200, appealDataWithOtherAppeals);
	});
	afterEach(teardown);

	describe('GET /other-appeals/add', () => {
		it('should render the "Enter the appeal reference number" page', async () => {
			const response = await request.get(`${baseUrl}/1/other-appeals/add`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter the appeal reference number</label></h1>');
			expect(element.innerHTML).toContain('name="addOtherAppealsReference" type="text" value="">');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /other-appeals/add', () => {
		it('should re-render the "Enter the appeal reference number" page with error "Enter an appeal reference", if no appeal reference was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: '' });
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter the appeal reference number</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter an appeal reference</a>');
		});

		it('should re-render the "Enter the appeal reference number" page with the expected error, if the provided appeal reference is less than 7 digits', async () => {
			const response = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: '123456' });
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter the appeal reference number</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Appeal reference must be 7 digits</a>');
		});

		it('should re-render the "Enter the appeal reference number" page with the expected error, if the provided appeal reference is greater than 7 digits', async () => {
			const response = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: '12345678' });
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter the appeal reference number</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Appeal reference must be 7 digits</a>');
		});

		it('should re-render the "Enter the appeal reference number" page with error "Enter a valid appeal reference", if the provided appeal reference was invalid', async () => {
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testInvalidLinkableAppealReference}/related`)
				.reply(404);
			const response = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: testInvalidLinkableAppealReference });
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter the appeal reference number</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a valid appeal reference</a>');
		});

		it('should redirect to the "Related appeal details" page if related appeal reference is valid', async () => {
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/related`)
				.reply(200, linkableAppeal);
			const response = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: testValidLinkableAppealReference });
			expect(response.statusCode).toBe(302);
		});
	});

	describe('GET /other-appeals/confirm', () => {
		it('should render the "Related appeal details" page', async () => {
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/related`)
				.reply(200, linkableAppeal);
			const addPageResponse = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: testValidLinkableAppealReference });
			expect(addPageResponse.statusCode).toBe(302);

			nock('http://test/').get('/appeals/1').reply(200, appealDataWithOtherAppeals);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/related`)
				.reply(200, linkableAppeal);

			const response = await request.get(`${baseUrl}/1/other-appeals/confirm`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Related appeal details</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal reference</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Appeal type</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Site address</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Local planning authority (LPA)</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Appellant name</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Agent name</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to relate these appeals?</legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="relateAppealsAnswer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="relateAppealsAnswer" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /other-appeals/confirm', () => {
		it('should re-render the "Related appeal details" page with the error if the answer was not provided', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithOtherAppeals).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/related`)
				.reply(200, linkableAppeal)
				.persist();

			const addPageResponse = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: testValidLinkableAppealReference });
			expect(addPageResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1/other-appeals/confirm`)
				.send({ relateAppealsAnswer: '' });

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Related appeal details</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('You must answer if you want to relate appeals</a>');
		});

		it('should redirect back to appeal details page if the answer was provided (answer no)', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithOtherAppeals).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/related`)
				.reply(200, linkableAppeal);

			const addPageResponse = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: testValidLinkableAppealReference });
			expect(addPageResponse.statusCode).toBe(302);

			await request.get(`${baseUrl}/1/other-appeals/confirm`);

			const confirmationPageResponse = await request
				.post(`${baseUrl}/1/other-appeals/confirm`)
				.send({ relateAppealsAnswer: 'no' });
			expect(confirmationPageResponse.statusCode).toBe(302);
		});

		it('should redirect back to appeal details page if the answer was provided (answer yes)', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithOtherAppeals).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/related`)
				.reply(200, linkableAppeal)
				.persist();
			nock('http://test/').post('/appeals/1/associate-appeal').reply(200);

			const addPageResponse = await request
				.post(`${baseUrl}/1/other-appeals/add`)
				.send({ addOtherAppealsReference: testValidLinkableAppealReference });
			expect(addPageResponse.statusCode).toBe(302);

			await request.get(`${baseUrl}/1/other-appeals/confirm`);

			const confirmationPageResponse = await request
				.post(`${baseUrl}/1/other-appeals/confirm`)
				.send({ relateAppealsAnswer: 'yes' });
			expect(confirmationPageResponse.statusCode).toBe(302);
		});
	});

	describe('GET /other-appeals/manage', () => {
		it('should render the "Manage linked appeals" page', async () => {
			const response = await request.get(`${baseUrl}/1/other-appeals/manage`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage linked appeals</h1>');
			expect(element.innerHTML).toContain('Related appeals</h2>');
			expect(element.innerHTML).toContain('Appeal Reference</th>');
			expect(element.innerHTML).toContain('Appeal type</th>');
			expect(element.innerHTML).toContain('Action</th>');
		});

		it('should render the "Do you want to remove the relationship?" page', async () => {
			const response = await request.get(`${baseUrl}/1/other-appeals/remove/2/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'Do you want to remove the relationship between appeal 2 and appeal 351062?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="removeAppealRelationship" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="removeAppealRelationship" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the "Do you want to remove the relationship?" page with the error if the answer was not provided', async () => {
			const response = await request
				.post(`${baseUrl}/1/other-appeals/remove/2/1`)
				.send({ removeAppealRelationship: '' });

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'Do you want to remove the relationship between appeal 2 and appeal 351062?</h1>'
			);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'You must answer if you want to remove the relationship</a>'
			);
		});

		it('should redirect back to "Manage linked appeals" page if the answer was provided (answer no)', async () => {
			const response = await request
				.post(`${baseUrl}/1/other-appeals/remove/2/1`)
				.send({ removeAppealRelationship: 'no' });

			expect(response.statusCode).toBe(302);
		});

		it('should redirect back to "Manage linked appeals" page if the answer was provided (answer yes)', async () => {
			nock('http://test/').get('/appeals/1').reply(200, appealDataWithOtherAppeals).persist();
			nock('http://test/').delete('/appeals/1/unlink-appeal').reply(200, { success: true });

			const response = await request
				.post(`${baseUrl}/1/other-appeals/remove/2/1`)
				.send({ removeAppealRelationship: 'yes' });

			expect(response.statusCode).toBe(302);
		});
	});
});
