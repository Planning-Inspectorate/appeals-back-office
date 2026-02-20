import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	appealData,
	linkableAppealSummaryBackOffice,
	linkableAppealSummaryHorizon
} from '#testing/appeals/appeals.js';
import { createTestEnvironment } from '#testing/index.js';
import {
	LINK_APPEALS_CHANGE_LEAD_OPERATION,
	LINK_APPEALS_UNLINK_OPERATION
} from '@pins/appeals/constants/support.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const linkedAppealsPath = '/linked-appeals';
const linkedAppealsAddUrl = `${baseUrl}/1${linkedAppealsPath}/add`;
const managePath = '/manage';
const unlinkAppealPath = '/unlink-appeal';
const unlinkLeadAppealPath = '/unlink-lead-appeal';
const confirmUnlinkLeadAppealPath = '/confirm-unlink-lead-appeal';
const changeLeadAppealPath = '/change-lead-appeal';
const confirmChangeLeadAppealPath = '/confirm-change-lead-appeal';

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
			address: { addressLine1: '10 Sunny Lane' },
			relationshipId: 1
		},
		{
			appealId: 3,
			appealReference: '76215416',
			isParentAppeal: false,
			linkingDate: new Date('2024-02-09T09:41:13.611Z'),
			appealType: 'Unknown',
			address: { addressLine1: '12 Evening Road' },
			relationshipId: 1,
			externalSource: true,
			externalAppealType: 'CAS planning'
		}
	]
};
const testValidLinkableAppealReference = '1234567';
const testInvalidLinkableAppealReference = '7654321';

describe('linked-appeals', () => {
	beforeEach(() => {
		nock.cleanAll();
	});
	afterEach(teardown);

	describe('GET /linked-appeals/manage', () => {
		it('should render the manage linked appeals page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals);
			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}${managePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Linked appeals</h1>');
			expect(element.innerHTML).toContain('>Change lead appeal</a>');
			expect(element.innerHTML).toContain(
				`>${appealShortReference(leadAppealDataWithLinkedAppeals.appealReference)}</a> (lead)`
			);
		});
	});

	describe('GET /linked-appeals/add', () => {
		it('should render the add linked appeal reference page with the expected content, and a back link to the case details page', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);

			const response = await request.get(linkedAppealsAddUrl);
			const element = parseHtml(response.text, { rootElement: 'body' });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal reference</label></h1>');
			expect(element.innerHTML).toContain('name="appeal-reference" type="text">');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /linked-appeals/add', () => {
		it('should re-render the add linked appeal reference page with the expected error message if no reference was provided', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(linkedAppealsAddUrl).send({
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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(linkedAppealsAddUrl).send({
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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(linkedAppealsAddUrl).send({
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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testInvalidLinkableAppealReference}/linked`)
				.reply(404);

			const response = await request.post(linkedAppealsAddUrl).send({
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

		it('should re-render the add linked appeal reference page with the expected error message if the reference is the same as appeal being linked to', async () => {
			const appealReference = '6000123';
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealData, appealReference });
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testInvalidLinkableAppealReference}/linked`)
				.reply(404);

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': appealShortReference(appealReference)
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

		it.each([
			['2', '2345678'],
			['3', '3456789'],
			['4', '4567890']
		])(
			'should re-render the add linked appeal reference page with the expected error message if the provided appeal reference is a horizon appeal (starting with %s)',
			async (_, appealReference) => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
				nock('http://test/')
					.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
					.reply(200, linkableAppealSummaryBackOffice);

				const response = await request.post(linkedAppealsAddUrl).send({
					'appeal-reference': appealReference
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
			}
		);

		it('should redirect to the check and confirm page if the reference was provided, a matching appeal was found, is unlinked, and the current appeal is already a lead', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealData, isParentAppeal: true });
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/check-and-confirm?backUrl=${encodeURIComponent(
					linkedAppealsAddUrl
				)}`
			);
		});

		it('should redirect to the check and confirm page if the reference was provided, a matching appeal was found, is already a lead, and the current appeal is unlinked', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					childAppeals: [{ appealId: 2, type: 'linked' }]
				});

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/check-and-confirm?backUrl=${encodeURIComponent(
					linkedAppealsAddUrl
				)}`
			);
		});

		it('should redirect to the lead appeal page if the reference was provided, a matching appeal was found, and neither appeals are already linked', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`);
		});

		it('should redirect to a drop out page if either appeal is already linked as a child', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(409);

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(`Found. Redirecting to ${linkedAppealsAddUrl}/already-linked`);
		});

		it('should redirect to a drop out page if both appeals are already linked as lead appeals', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealData, isParentAppeal: true });
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					childAppeals: [{ appealId: 2, type: 'linked' }]
				});

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(`Found. Redirecting to ${linkedAppealsAddUrl}/already-linked`);
		});

		it('should redirect to a drop out page if the appeal cannot be linked due to an invalid case status', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(432);

			const response = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/invalid-case-status`
			);
		});
	});

	describe('GET /linked-appeals/add/check-and-confirm', () => {
		it('should render the change lead appeal page', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference
				});
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const response = await request.get(`${linkedAppealsAddUrl}/lead-appeal`);
			const element = parseHtml(response.text, { rootElement: 'body' });

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Which is the lead appeal?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(`<span>${appealData.appealReference}</span>`);
			expect(unprettifiedElement.innerHTML).toContain(
				`${appealData.appealSite.addressLine1}</span>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<span>${linkableAppealSummaryBackOffice.appealReference}</span>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`${linkableAppealSummaryBackOffice.siteAddress.addressLine1}</span>`
			);
		});

		it('should render the check and confirm page when a lead appeal has been chosen and both appeals are currently unlinked', async () => {
			const testNewValidLinkableAppealReference = '1234765';
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealData, appealReference: testNewValidLinkableAppealReference })
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference
				});
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const selectLeadAppealResponse = await request
				.post(`${linkedAppealsAddUrl}/lead-appeal`)
				.send({
					'lead-appeal': testNewValidLinkableAppealReference
				});

			expect(selectLeadAppealResponse.statusCode).toBe(302);
			expect(selectLeadAppealResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/check-and-confirm`
			);

			const response = await request.get(`${linkedAppealsAddUrl}/check-and-confirm`);
			const element = parseHtml(response.text, { rootElement: 'body' });

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Check details and add linked appeal</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<span>${testNewValidLinkableAppealReference}</span>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`${appealData.appealSite.addressLine1}</span>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Which is the lead appeal?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<span>${linkableAppealSummaryBackOffice.appealReference}</span>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`${linkableAppealSummaryBackOffice.siteAddress.addressLine1}</span>`
			);
		});

		it('should render the check and confirm page when a lead appeal has been chosen as it is already linked', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...appealData, isParentAppeal: true })
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference
				});
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/check-and-confirm?backUrl=${encodeURIComponent(
					linkedAppealsAddUrl
				)}`
			);

			const response = await request.get(`${linkedAppealsAddUrl}/check-and-confirm`);
			const element = parseHtml(response.text, { rootElement: 'body' });

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Check details and add linked appeal</h1>');
			expect(unprettifiedElement.innerHTML).not.toContain('Which is the lead appeal?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<span>${linkableAppealSummaryBackOffice.appealReference}</span>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`${linkableAppealSummaryBackOffice.siteAddress.addressLine1}</span>`
			);
		});
	});

	describe('GET /linked-appeals/add/lead-appeal', () => {
		it('should render the change lead appeal page', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
				.reply(200, {
					...appealData,
					appealId: linkableAppealSummaryBackOffice.appealId,
					appealReference: linkableAppealSummaryBackOffice.appealReference
				});
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);

			const addLinkedAppealReferenceResponse = await request
				.post(linkedAppealsAddUrl)
				.send({ 'appeal-reference': testValidLinkableAppealReference });

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const response = await request.get(`${linkedAppealsAddUrl}/lead-appeal`);
			const element = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(element.innerHTML).toMatchSnapshot();

			expect(element.innerHTML).toContain('Which is the lead appeal?</h1>');
			expect(element.innerHTML).toContain(`<span>${appealData.appealReference}</span>`);
			expect(element.innerHTML).toContain(`${appealData.appealSite.addressLine1}</span>`);
			expect(element.innerHTML).toContain(
				`<span>${linkableAppealSummaryBackOffice.appealReference}</span>`
			);
			expect(element.innerHTML).toContain(
				`${linkableAppealSummaryBackOffice.siteAddress.addressLine1}</span>`
			);
		});
	});

	describe('POST /linked-appeals/add/lead-appeal', () => {
		it('should update the lead appeal on the confirm page after submit', async () => {
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					appealReference: testValidLinkableAppealReference
				});

			const addResponse = await request
				.post(linkedAppealsAddUrl)
				.send({ 'appeal-reference': testValidLinkableAppealReference });

			expect(addResponse.statusCode).toBe(302);

			const leadAppealResponse = await request
				.post(`${linkedAppealsAddUrl}/lead-appeal`)
				.send({ 'lead-appeal': testValidLinkableAppealReference });

			expect(leadAppealResponse.statusCode).toBe(302);
			expect(leadAppealResponse.text).toBe(
				`Found. Redirecting to ${linkedAppealsAddUrl}/check-and-confirm`
			);

			const response = await request.get(`${linkedAppealsAddUrl}/check-and-confirm`);

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
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, {
					...linkableAppealSummaryBackOffice,
					appealReference: testValidLinkableAppealReference
				});

			const addResponse = await request
				.post(linkedAppealsAddUrl)
				.send({ 'appeal-reference': testValidLinkableAppealReference });

			expect(addResponse.statusCode).toBe(302);

			const response = await request.post(`${linkedAppealsAddUrl}/lead-appeal`);

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
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
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
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
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

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);

			const leadAppealResponse = await request
				.post(`${linkedAppealsAddUrl}/lead-appeal`)
				.send({ 'lead-appeal': testValidLinkableAppealReference });

			expect(leadAppealResponse.statusCode).toBe(302);

			const response = await request.post(`${linkedAppealsAddUrl}/check-and-confirm`);

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
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
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
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);
			nock('http://test/').post('/appeals/1/link-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const response = await request.post(`${linkedAppealsAddUrl}/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should call the link-appeal endpoint to link the candidate as child of the target, and redirect to the case details page for the target appeal, if the candidate is a back office appeal, and the "child" radio option was selected', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryBackOffice.appealId}?include=all`)
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
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryBackOffice);
			nock('http://test/').post('/appeals/1/link-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const response = await request.post(`${linkedAppealsAddUrl}/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should call the link-legacy-appeal endpoint to link the candidate as lead of the target, and redirect to the case details page for the target appeal, if the candidate is a legacy (Horizon) appeal, and the "lead" radio option was selected', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryHorizon.appealId}?include=all`)
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
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryHorizon);
			nock('http://test/').post('/appeals/1/link-legacy-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const response = await request.post(`${linkedAppealsAddUrl}/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should call the link-legacy-appeal endpoint to link the candidate as child of the target, and redirect to the case details page for the target appeal, if the candidate is a legacy (Horizon) appeal, and the "child" radio option was selected', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...appealData,
					isParentAppeal: false,
					isChildAppeal: false,
					linkedAppeals: []
				})
				.persist();
			nock('http://test/')
				.get(`/appeals/${linkableAppealSummaryHorizon.appealId}?include=all`)
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
				.get(`/appeals/linkable-appeal/${testValidLinkableAppealReference}/linked`)
				.reply(200, linkableAppealSummaryHorizon);
			nock('http://test/').post('/appeals/1/link-legacy-appeal').reply(200, {});

			const addLinkedAppealReferenceResponse = await request.post(linkedAppealsAddUrl).send({
				'appeal-reference': testValidLinkableAppealReference
			});

			expect(addLinkedAppealReferenceResponse.statusCode).toBe(302);
			expect(addLinkedAppealReferenceResponse.text).toEqual(
				`Found. Redirecting to ${linkedAppealsAddUrl}/lead-appeal`
			);

			const response = await request.post(`${linkedAppealsAddUrl}/check-and-confirm`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /linked-appeals/unlink-appeal', () => {
		it('should render the unlink-appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();
			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}${unlinkAppealPath}/2`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`Appeal 351062 (lead)</span>`);
			expect(element.innerHTML).toContain(
				`Confirm that you want to unlink linked appeal 725284</h1>`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /linked-appeals/unlink-appeal', () => {
		it('should redirect to linked appeals manage page when there are multiple children', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...leadAppealDataWithLinkedAppeals,
					linkedAppeals: [{ appealId: 2 }, { appealId: 3 }]
				})
				.persist();
			nock('http://test/')
				.post('/appeals/2/update-linked-appeals', (body) => {
					// Assert required fields exist
					expect(body).toEqual({ operation: LINK_APPEALS_UNLINK_OPERATION });
					return true; // IMPORTANT: return true to match
				})
				.reply(200);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}${unlinkAppealPath}/2`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${baseUrl}/1${linkedAppealsPath}/manage`
			);
		});

		it('should redirect to appeal details page when there is only one child', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, { ...leadAppealDataWithLinkedAppeals, linkedAppeals: [{ appealId: 2 }] })
				.persist();
			nock('http://test/')
				.post('/appeals/2/update-linked-appeals', (body) => {
					// Assert required fields exist
					expect(body).toEqual({ operation: LINK_APPEALS_UNLINK_OPERATION });
					return true; // IMPORTANT: return true to match
				})
				.reply(200);

			const response = await request.post(`${baseUrl}/1${linkedAppealsPath}${unlinkAppealPath}/2`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(`Found. Redirecting to ${baseUrl}/1`);
		});
	});

	describe('GET /linked-appeals/unlink-lead-appeal', () => {
		it('should render the unlink lead appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();
			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}${unlinkLeadAppealPath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`Appeal 351062 (lead) - unlink lead appeal</span>`);
			expect(element.innerHTML).toContain(`Which is the new lead appeal?</h1>`);

			expect(element.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="lead-appeal">725284</label>'
			);
			expect(element.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="lead-appeal-2">76215416</label>'
			);
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /linked-appeals/unlink-lead-appeal', () => {
		it('should redirect to confirm unlink lead appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...leadAppealDataWithLinkedAppeals,
					linkedAppeals: [{ appealId: 2 }, { appealId: 3 }]
				})
				.persist();

			const response = await request
				.post(`${baseUrl}/1${linkedAppealsPath}${unlinkLeadAppealPath}`)
				.send({ leadAppeal: 2 });

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${baseUrl}/1${linkedAppealsPath}/confirm-unlink-lead-appeal`
			);
		});
	});

	describe('GET /linked-appeals/confirm-unlink-lead-appeal', () => {
		it('should render the confirm unlink lead appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();

			// prime the session variable leadAppeal
			await request
				.post(`${baseUrl}/1${linkedAppealsPath}${unlinkLeadAppealPath}`)
				.send({ leadAppeal: 2 });

			const response = await request.get(
				`${baseUrl}/1${linkedAppealsPath}${confirmUnlinkLeadAppealPath}`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`Appeal 351062 (lead) - unlink lead appeal</span>`);
			expect(element.innerHTML).toContain(`Which is the new lead appeal?</dt>`);
			expect(element.innerHTML).toContain(
				`<span>725284</span><span>10 Sunny Lane</span><span>Householder</span>`
			);
			expect(element.innerHTML).toContain('Unlink lead appeal</button>');
		});
	});

	describe('POST /linked-appeals/confirm-unlink-lead-appeal', () => {
		it('should redirect to manage linked appeals page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();
			nock('http://test/')
				.post('/appeals/1/update-linked-appeals', (body) => {
					// Assert required fields exist
					expect(body).toEqual({
						operation: LINK_APPEALS_UNLINK_OPERATION,
						appealRefToReplaceLead: '725284'
					});
					return true; // IMPORTANT: return true to match
				})
				.reply(200);

			// prime the session variable leadAppeal
			await request
				.post(`${baseUrl}/1${linkedAppealsPath}${unlinkLeadAppealPath}`)
				.send({ leadAppeal: 2 });

			const response = await request.post(
				`${baseUrl}/1${linkedAppealsPath}${confirmUnlinkLeadAppealPath}`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${baseUrl}/2${linkedAppealsPath}/manage`
			);
		});
	});

	describe('GET /linked-appeals/change-lead-appeal', () => {
		it('should render the change lead appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();
			const response = await request.get(`${baseUrl}/1${linkedAppealsPath}${changeLeadAppealPath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`Appeal 351062 (lead) - update lead appeal</span>`);
			expect(element.innerHTML).toContain(`Which is the new lead appeal?</h1>`);

			expect(element.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="lead-appeal">725284</label>'
			);
			expect(element.innerHTML).toContain(
				'<label class="govuk-label govuk-radios__label" for="lead-appeal-2">76215416</label>'
			);
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /linked-appeals/change-lead-appeal', () => {
		it('should redirect to confirm change lead appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, {
					...leadAppealDataWithLinkedAppeals,
					linkedAppeals: [{ appealId: 2 }, { appealId: 3 }]
				})
				.persist();

			const response = await request
				.post(`${baseUrl}/1${linkedAppealsPath}${changeLeadAppealPath}`)
				.send({ leadAppeal: 2 });

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${baseUrl}/1${linkedAppealsPath}/confirm-change-lead-appeal`
			);
		});
	});

	describe('GET /linked-appeals/confirm-change-lead-appeal', () => {
		it('should render the confirm change lead appeal page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();

			// prime the session variable leadAppeal
			await request
				.post(`${baseUrl}/1${linkedAppealsPath}${changeLeadAppealPath}`)
				.send({ leadAppeal: 2 });

			const response = await request.get(
				`${baseUrl}/1${linkedAppealsPath}${confirmChangeLeadAppealPath}`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`Appeal 351062 (lead) - update lead appeal</span>`);
			expect(element.innerHTML).toContain(`Which is the new lead appeal?</dt>`);
			expect(element.innerHTML).toContain(
				`<span>725284</span><span>10 Sunny Lane</span><span>Householder</span>`
			);
			expect(element.innerHTML).toContain('Update lead appeal</button>');
		});
	});

	describe('POST /linked-appeals/confirm-change-lead-appeal', () => {
		it('should redirect to manage linked appeals page', async () => {
			nock('http://test/')
				.get('/appeals/1?include=all')
				.reply(200, leadAppealDataWithLinkedAppeals)
				.persist();
			nock('http://test/')
				.post('/appeals/1/update-linked-appeals', (body) => {
					// Assert required fields exist
					expect(body).toEqual({
						operation: LINK_APPEALS_CHANGE_LEAD_OPERATION,
						appealRefToReplaceLead: '725284'
					});
					return true; // IMPORTANT: return true to match
				})
				.reply(200);

			// prime the session variable leadAppeal
			await request
				.post(`${baseUrl}/1${linkedAppealsPath}${changeLeadAppealPath}`)
				.send({ leadAppeal: 2 });

			const response = await request.post(
				`${baseUrl}/1${linkedAppealsPath}${confirmChangeLeadAppealPath}`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				`Found. Redirecting to ${baseUrl}/2${linkedAppealsPath}/manage`
			);
		});
	});
});
