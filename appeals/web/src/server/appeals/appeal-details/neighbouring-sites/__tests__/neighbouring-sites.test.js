import { appealData } from '#testing/app/fixtures/referencedata.js';
import { behavesLikeAddressForm } from '#testing/app/shared-examples/address-form.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('neighbouring-sites', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /add', () => {
		it('should render getAllNeighbouringSite page for lpa', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(`${baseUrl}/${appealId}/neighbouring-sites/add/lpa`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Add interested party address</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="addressLine1" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="addressLine2" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="town" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="county" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="postCode" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render getAllNeighbouringSite page for inspector', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(
				`${baseUrl}/${appealId}/neighbouring-sites/add/back-office`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Add interested party address</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="addressLine1" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="addressLine2" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="town" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="county" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('name="postCode" type="text"');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /add', () => {
		behavesLikeAddressForm({
			request,
			url: `${baseUrl}/${appealData.appealId}/neighbouring-sites/add/back-office`
		});

		it('should re-direct to the check and confirm page if the data is valid', async () => {
			const appealId = appealData.appealId.toString();

			const validData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/add/back-office`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/neighbouring-sites/add/back-office/check-and-confirm'
			);
		});
	});

	describe('GET /add/check-and-confirm', () => {
		it('should render the check your answers page', async () => {
			const validData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const appealId = appealData.appealId.toString();
			await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/add/back-office`)
				.send(validData);

			const response = await request.get(
				`${baseUrl}/${appealId}/neighbouring-sites/add/back-office/check-and-confirm`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check your answers</h1>');
			expect(element.innerHTML).toContain('Address</dt>');
			expect(element.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /add/check-and-confirm', () => {
		it('should redirect to the appeals details page', async () => {
			const appealReference = '1';

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/${appealReference}/neighbouring-sites`)
				.reply(200, {
					siteId: 1,
					address: {
						addressLine1: '1 Grove Cottage',
						addressLine2: 'Shotesham Road',
						country: 'United Kingdom',
						county: 'Devon',
						postcode: 'NR35 2ND',
						town: 'Woodton'
					}
				});
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=all`)
				.reply(200, appealData)
				.persist();
			await request.post(`${baseUrl}/1/neighbouring-sites/add/back-office`).send({
				addressLine1: '1 Grove Cottage',
				addressLine2: null,
				county: 'Devon',
				postCode: 'NR35 2ND',
				town: 'Woodton'
			});

			const addLinkedAppealCheckAndConfirmPostResponse = await request.post(
				`${baseUrl}/1/neighbouring-sites/add/back-office/check-and-confirm`
			);

			expect(addLinkedAppealCheckAndConfirmPostResponse.statusCode).toBe(302);
			expect(addLinkedAppealCheckAndConfirmPostResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1'
			);
		});

		it('should redirect to the lpa questionnaire page', async () => {
			const appealReference = '1';

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/${appealReference}/neighbouring-sites`)
				.reply(200, {
					siteId: 1,
					address: {
						addressLine1: '1 Grove Cottage',
						addressLine2: 'Shotesham Road',
						country: 'United Kingdom',
						county: 'Devon',
						postcode: 'NR35 2ND',
						town: 'Woodton'
					}
				});
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=all`)
				.reply(200, appealData)
				.persist();
			await request
				.post(`${baseUrl}/1/lpa-questionnaire/2/neighbouring-sites/add/back-office`)
				.send({
					addressLine1: '1 Grove Cottage',
					addressLine2: null,
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

			const addLinkedAppealCheckAndConfirmPostResponse = await request.post(
				`${baseUrl}/1/lpa-questionnaire/2/neighbouring-sites/add/back-office/check-and-confirm`
			);

			expect(addLinkedAppealCheckAndConfirmPostResponse.statusCode).toBe(302);
			expect(addLinkedAppealCheckAndConfirmPostResponse.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/2'
			);
		});
	});

	describe('GET /manage', () => {
		it('should render the manage neighbouring sites page', async () => {
			const appealId = appealData.appealId.toString();
			const address = '1 Grove Cottage, Shotesham Road, Woodton, Devon, NR35 2ND';
			const response = await request.get(`${baseUrl}/${appealId}/neighbouring-sites/manage`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage neighbouring sites</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Neighbouring sites (LPAQ)</caption>');
			expect(unprettifiedElement.innerHTML).toContain('Address</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				`Change<span class="govuk-visually-hidden"> ${address}</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`Remove<span class="govuk-visually-hidden"> ${address}</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Neighbouring sites (inspector and/or third party request)</caption>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Address</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action</th>');
			expect(unprettifiedElement.innerHTML).toContain(
				`Change<span class="govuk-visually-hidden"> ${address}</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`Remove<span class="govuk-visually-hidden"> ${address}</span></a>`
			);
		});
	});

	describe('GET /remove/site/:siteId', () => {
		it('should render the remove neighbouring site page', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(`${baseUrl}/${appealId}/neighbouring-sites/remove/site/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Remove neighbouring site</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Address</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Do you want to remove this site?</legend>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="remove-neighbouring-site" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="remove-neighbouring-site" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /remove/site/:siteId', () => {
		it('should re-render remove neighbouring if user has not selected a radio option', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/remove/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Remove neighbouring site</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Select yes if you want to remove this site</a>');
		});

		it('should redirect to the manage page if you select no', async () => {
			const appealId = appealData.appealId.toString();

			const validData = {
				'remove-neighbouring-site': 'no'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/remove/site/1`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/neighbouring-sites/manage`);
		});

		it('should redirect to the manage page if you select yes and there are more than 1 neighbouring sites', async () => {
			const appealId = appealData.appealId.toString();

			nock('http://test/').delete(`/appeals/${appealId}/neighbouring-sites`).reply(200, {
				siteId: 1
			});

			const validData = {
				'remove-neighbouring-site': 'yes'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/remove/site/1`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.headers.location).toBe(`${baseUrl}/${appealId}/neighbouring-sites/manage`);
		});

		it('should redirect to the details page if you select yes and there 1 or less neighbouring sites', async () => {
			const appealDataWithOneNeighbouringSite = { ...appealData };

			appealDataWithOneNeighbouringSite.appealId = 3;
			appealDataWithOneNeighbouringSite.neighbouringSites = [
				{
					siteId: 1,
					source: 'lpa',
					address: {
						addressLine1: '1 Grove Cottage',
						addressLine2: 'Shotesham Road',
						town: 'Woodton',
						county: 'Devon',
						postCode: 'NR35 2ND'
					}
				}
			];

			nock('http://test/')
				.get(`/appeals/3?include=all`)
				.reply(200, appealDataWithOneNeighbouringSite)
				.persist();

			nock('http://test/').delete(`/appeals/3/neighbouring-sites`).reply(200, {
				siteId: 1
			});

			const validData = {
				'remove-neighbouring-site': 'yes'
			};
			const response = await request
				.post(`${baseUrl}/3/neighbouring-sites/remove/site/1`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.headers.location).toBe(`${baseUrl}/3`);
		});
	});

	describe('GET /change/site/:siteId', () => {
		it('should render the change neighbouring site page', async () => {
			const appealId = appealData.appealId.toString();
			const response = await request.get(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Address line 1</label>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="addressLine1" type="text" value="1 Grove Cottage">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="addressLine2" type="text" value="Shotesham Road">'
			);
			expect(unprettifiedElement.innerHTML).toContain('name="town" type="text" value="Woodton">');
			expect(unprettifiedElement.innerHTML).toContain('name="county" type="text" value="Devon">');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="postCode" type="text" value="NR35 2ND">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change/site/:siteId', () => {
		it('should re-render changeNeighbouringSite page if addressLine1 is null', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: null,
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter address line 1</a>');
		});

		it('should re-render changeNeighbouringSite page if addressLine1 is an empty string', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter address line 1</a>');
		});

		it('should re-render changeNeighbouringSite page if town is null', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: null,
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter town or city</a>');
		});

		it('should re-render changeNeighbouringSite page if town is an empty string', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: '',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter town or city</a>');
		});

		it('should re-render changeNeighbouringSite page if the postcode is null', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: null
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter postcode</a>');
		});

		it('should re-render changeNeighbouringSite page if the postcode is invalid', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: '111'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a full UK postcode</a>');
		});

		it('should re-render changeNeighbouringSite page if the postcode is an empty string', async () => {
			const appealId = appealData.appealId.toString();

			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: ''
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Change neighbouring site address</h1>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter postcode</a>');
		});

		it('should re-direct to the check and confirm page if the data is valid', async () => {
			const appealId = appealData.appealId.toString();

			const validData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(validData);

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/neighbouring-sites/change/site/1/check-and-confirm'
			);
		});
	});

	describe('GET /change/site/:siteId/check-and-confirm', () => {
		it('should render the check your answers page', async () => {
			const validData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const appealId = appealData.appealId.toString();
			const addNeighbouringSiteResponse = await request
				.post(`${baseUrl}/${appealId}/neighbouring-sites/change/site/1`)
				.send(validData)
				.expect(302);

			expect(addNeighbouringSiteResponse.headers.location).toBe(
				`${baseUrl}/${appealId}/neighbouring-sites/change/site/1/check-and-confirm`
			);

			const response = await request.get(
				`${baseUrl}/${appealId}/neighbouring-sites/change/site/1/check-and-confirm`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check your answers</h1>');
			expect(element.innerHTML).toContain('Address</dt>');
			expect(element.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /change/site/:siteId/check-and-confirm', () => {
		it('should redirect to the appeals details page', async () => {
			const appealReference = '1';

			nock.cleanAll();
			nock('http://test/').patch(`/appeals/${appealReference}/neighbouring-sites`).reply(200, {
				siteId: 1
			});
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=all`)
				.reply(200, appealData)
				.persist();

			await request.post(`${baseUrl}/1/neighbouring-sites/change/site/1`).send({
				addressLine1: '2 Grove Cottage',
				addressLine2: null,
				county: 'Devon',
				postCode: 'NR35 2ND',
				town: 'Woodton'
			});

			const response = await request.post(
				`${baseUrl}/1/neighbouring-sites/change/site/1/check-and-confirm`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
