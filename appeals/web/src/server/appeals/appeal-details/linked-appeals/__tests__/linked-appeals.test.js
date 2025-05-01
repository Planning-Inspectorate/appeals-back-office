import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import {
	appealData,
	documentFileInfo,
	inspectorDecisionData,
	linkableAppealSummaryBackOffice,
	linkableAppealSummaryHorizon
} from '#testing/appeals/appeals.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const linkedAppealsPath = '/linked-appeals';
const managePath = '/manage';
const unlinkAppealPath = '/unlink-appeal';

const leadAppealDataWithLinkedAppeals = {
	...appealData,
	isParentAppeal: true,
	isChildAppeal: false,
	linkedAppeals: [
		{
			appealId: 2,
			appealReference: 'APP/Q9999/D/21/725284',
			isParentAppeal: false,
			linkingDate: new Date('2024-02-09T09:41:13.611Z'),
			appealType: 'Householder',
			relationshipId: 1
		},
		{
			appealId: 3,
			appealReference: '76215416',
			isParentAppeal: false,
			linkingDate: new Date('2024-02-09T09:41:13.611Z'),
			appealType: 'Unknown',
			relationshipId: 1,
			externalSource: true,
			externalAppealType: 'Commercial'
		}
	]
};
const childAppealDataWithLinkedAppeals = {
	...appealData,
	isParentAppeal: false,
	isChildAppeal: true,
	linkedAppeals: [
		{
			appealId: 3,
			appealReference: 'APP/Q9999/D/21/725284',
			isParentAppeal: true,
			linkingDate: new Date('2024-02-09T09:41:13.611Z'),
			appealType: 'Householder',
			relationshipId: 3048
		}
	]
};
const testValidLinkableAppealReference = '1234567';
const testInvalidLinkableAppealReference = '7654321';

describe('linked-appeals', () => {
	beforeEach(() => {
		nock('http://test/').get('/appeals/1').reply(200, leadAppealDataWithLinkedAppeals);
	});
	afterEach(teardown);

	describe('GET /linked-appeals/manage', () => {
		it('should render the manage linked appeals page with the expected content when the appeal is a lead', async () => {
			nock('http://test/').get('/appeals/1').reply(200, leadAppealDataWithLinkedAppeals);
			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}/${managePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage linked appeals</h1>');
			expect(element.innerHTML).toContain('Child appeals of');
			expect(element.innerHTML).not.toContain('Lead appeal of');
			expect(element.innerHTML).not.toContain('Other child appeals of');
		});
		it('should render the manage linked appeals page with the expected content when the appeal is a child', async () => {
			nock('http://test/').get('/appeals/2').reply(200, childAppealDataWithLinkedAppeals);
			nock('http://test/').get('/appeals/3').reply(200, leadAppealDataWithLinkedAppeals);
			const response = await request.get(`${baseUrl}/2${linkedAppealsPath}/${managePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage linked appeals</h1>');
			expect(element.innerHTML).toContain('Lead appeal of');
			expect(element.innerHTML).toContain('Other child appeals of');
			expect(element.innerHTML).not.toContain('Child appeals of');
		});
	});

	describe('GET /linked-appeals/add', () => {
		it('should render the add linked appeal reference page with the expected content, and a back link to the case details page', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);

			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}/add`);
			const element = parseHtml(response.text, { rootElement: 'body' });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal reference</label></h1>');
			expect(element.innerHTML).toContain('name="appeal-reference" type="text">');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /linked-appeals/add', () => {
		it('should re-render the add linked appeal reference page with the expected error message if no reference was provided', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add`).send({
				'appeal-reference': ''
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal reference</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter an appeal reference</a>');
		});

		it('should re-render the add linked appeal reference page with the expected error message if the provided appeal reference is less than 7 digits', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add`).send({
				'appeal-reference': '123456'
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal reference</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Appeal reference must be 7 digits</a>');
		});

		it('should re-render the add linked appeal reference page with the expected error message if the provided appeal reference is greater than 7 digits', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add`).send({
				'appeal-reference': '12345678'
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal reference</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Appeal reference must be 7 digits</a>');
		});

		it('should re-render the add linked appeal reference page with the expected error message if the reference was provided but no matching appeal was found', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testInvalidLinkableAppealReference}`)
				.reply(404);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add`).send({
				'appeal-reference': testInvalidLinkableAppealReference
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain('Appeal reference</label></h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a valid appeal reference</a>');
		});

		it('should redirect to the check and confirm page if the reference was provided and a matching appeal was found', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add`).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);
		});

		it('should redirect to a drop out page if the appeal cannot be linked', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(409);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add`).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/already-linked'
			);
		});
	});

	describe('GET /linked-appeals/add/check-and-confirm', () => {
		it('should render the change lead appeal page', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference
				});
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({
					'appeal-reference': testValidLinkableAppealReference
				});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);

			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}/add/lead-appeal`);
			const element = parseHtml(response.text, { rootElement: 'body' });

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Which is the lead appeal?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(`<span>${appealData.appealReference}</span>`);
			expect(unprettifiedElement.innerHTML).toContain(
				`${linkableAppealSummaryBackOffice.appealType}</span>`
			);
		});
	});

	describe('GET /linked-appeals/add/lead-appeal', () => {
		it('should render the change lead appeal page', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference
				});
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({ 'appeal-reference': testValidLinkableAppealReference });

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);

			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}/add/lead-appeal`);
			const element = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain('Which is the lead appeal?</h1>');
			expect(element.innerHTML).toContain(`<span>${appealData.appealReference}</span>`);
			expect(element.innerHTML).toContain(`${linkableAppealSummaryBackOffice.appealType}</span>`);
		});
	});

	describe('POST /linked-appeals/add/lead-appeal', () => {
		it('should update the lead appeal on the confirm page after submit', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					appealReference: testValidLinkableAppealReference
				});

			const addResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({ 'appeal-reference': testValidLinkableAppealReference });

			expect(addResponse.statusCode).toBe(302);

			const leadAppealResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add/lead-appeal`)
				.send({ 'lead-appeal': testValidLinkableAppealReference });

			expect(leadAppealResponse.statusCode).toBe(302);
			expect(leadAppealResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/check-and-confirm'
			);

			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}/add/check-and-confirm`);

			const element = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain(
				`<dt class="govuk-summary-list__key"> Which is the lead appeal?</dt><dd class="govuk-summary-list__value"><span>${testValidLinkableAppealReference}</span>`
			);
		});

		it('should reload the page and show an error if no option is selected', async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					appealReference: testValidLinkableAppealReference
				});

			const addResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({ 'appeal-reference': testValidLinkableAppealReference });

			expect(addResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add/lead-appeal`);

			const element = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(response.statusCode).toBe(200);
			expect(element.innerHTML).toContain('Select the lead appeal</a>');
		});
	});

	describe('POST /linked-appeals/add/check-and-confirm', () => {
		it('should re-render the check and confirm page with the expected error message if the API endpoint returns a 400 (validation) error', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					appealReference: testValidLinkableAppealReference
				});
			nock('http://test/')
				.post('/appeals/1/link-appeal')
				.reply(400, {
					errors: {
						body: 'The appeals cannot be linked as the lead or child are already linked to other appeals.'
					}
				});

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({
					'appeal-reference': testValidLinkableAppealReference
				});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);

			const leadAppealResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add/lead-appeal`)
				.send({ 'lead-appeal': testValidLinkableAppealReference });

			expect(leadAppealResponse.statusCode).toBe(302);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add/check-and-confirm`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toContain('Check details and add linked appeal');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain(
				'The appeals cannot be linked as the lead or child are already linked to other appeals.</a>'
			);
		});

		it('should call the link-appeal endpoint to link the candidate as lead of the target, and redirect to the case details page for the target appeal, if the candidate is a back office appeal, and the "lead" radio option was selected', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);
			nock('http://test/').post('/appeals/1/link-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({
					'appeal-reference': testValidLinkableAppealReference
				});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should call the link-appeal endpoint to link the candidate as child of the target, and redirect to the case details page for the target appeal, if the candidate is a back office appeal, and the "child" radio option was selected', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryBackOffice);
			nock('http://test/').post('/appeals/1/link-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({
					'appeal-reference': testValidLinkableAppealReference
				});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should call the link-legacy-appeal endpoint to link the candidate as lead of the target, and redirect to the case details page for the target appeal, if the candidate is a legacy (Horizon) appeal, and the "lead" radio option was selected', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryHorizon.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryHorizon.appealId,
					appealReference: linkableAppealSummaryHorizon.appealReference,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryHorizon);
			nock('http://test/').post('/appeals/1/link-legacy-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({
					'appeal-reference': testValidLinkableAppealReference
				});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should call the link-legacy-appeal endpoint to link the candidate as child of the target, and redirect to the case details page for the target appeal, if the candidate is a legacy (Horizon) appeal, and the "child" radio option was selected', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryHorizon.appealId}`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryHorizon.appealId,
					appealReference: linkableAppealSummaryHorizon.appealReference,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}`)
				.reply(200, linkableAppealSummaryHorizon);
			nock('http://test/').post('/appeals/1/link-legacy-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/add`)
				.send({
					'appeal-reference': testValidLinkableAppealReference
				});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/add/lead-appeal'
			);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}/add/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /change-appeal-type/unlink-appeal', () => {
		it('should render the unlink-appeal page', async () => {
			nock('http://test/').get('/appeals/1').reply(200, leadAppealDataWithLinkedAppeals).persist();
			const response = await request.get(
				`${baseUrl}/1${linkedAppealsPath}/${unlinkAppealPath}/1/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'Do you want to unlink the appeal 725284 from appeal 351062?</h1>'
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="unlinkAppeal" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="unlinkAppeal" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change-appeal-type/unlink-appeal', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1').reply(200, inspectorDecisionData).persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(teardown);

		it('should redirect to the unlink appeal page if the selected confirmation value is "no"', async () => {
			const response = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/${unlinkAppealPath}/1/2/1`)
				.send({
					unlinkAppeal: 'no'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/linked-appeals/manage'
			);
		});

		it('should redirect to appeal details page when confirmation value is "yes"', async () => {
			nock('http://test/').delete('/appeals/1/unlink-appeal').reply(200, { success: true });
			const response = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/${unlinkAppealPath}/2/1/1`)
				.send({
					unlinkAppeal: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should re-render the unlink appeal page with the expected error message if yes or no are not selected', async () => {
			const response = await request
				.post(`${baseUrl}/1${linkedAppealsPath}/${unlinkAppealPath}/2/1/1`)
				.send({
					unlinkAppeal: ''
				});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'Do you want to unlink the appeal 725284 from appeal 351062?</h1>'
			);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Please choose an option</a>');
		});
	});
});
