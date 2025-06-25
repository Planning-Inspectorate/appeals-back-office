import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData, lpaQuestionnaireData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const validListedBuilding = '1234567';
const invalidListedBuilding = '9999999';

describe('changed-listed-buildings', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
			.reply(200, {
				...lpaQuestionnaireData
			});
		nock('http://test/').get(`/appeals/listed-buildings/${validListedBuilding}`).reply(200, {});
		nock('http://test/').get(`/appeals/listed-buildings/${invalidListedBuilding}`).reply(404, {});
	});
	afterEach(teardown);

	describe('GET /add', () => {
		it('should render the add changed listed building page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');
		});
	});

	describe('POST /add', () => {
		it('should re-render the add changed listed building page with an error when listed building is empty', async () => {
			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send({});
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Provide a listed building entry list number</a>');
		});

		it('should re-render the add changed listed building page with an error when listed building is less than seven digits', async () => {
			const invalidData = {
				changedListedBuilding: '12345'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the add changed listed building page with an error when listed building is more than seven digits', async () => {
			const invalidData = {
				changedListedBuilding: '12345678'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the add changed listed building page with an error when listed building contains a special character', async () => {
			const invalidData = {
				changedListedBuilding: '*123456'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the add changed listed building page with an error when listed building contains a letter', async () => {
			const invalidData = {
				changedListedBuilding: 'A123456'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the add changed listed building page with an error when listed building is seven digits but not in historic england', async () => {
			const invalidData = {
				changedListedBuilding: invalidListedBuilding
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- add changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a real listed building entry number</a>');
		});

		it('should redirect to the check-and-confirm page when data is valid', async () => {
			const validData = {
				changedListedBuilding: validListedBuilding
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1/changed-listed-buildings/add/check-and-confirm'
			);
		});
	});

	describe('GET /add/check-and-confirm', () => {
		it('should render the add changed listed building check and confirm page', async () => {
			const validData = {
				changedListedBuilding: validListedBuilding
			};

			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(validData);

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add/check-and-confirm`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Check details and add changed listed building</h1>');

			const summaryListHtml = parseHtml(response.text, {
				rootElement: '.govuk-summary-list',
				skipPrettyPrint: true
			}).innerHTML;
			expect(summaryListHtml).toContain('Changed listed building</dt>');
			expect(summaryListHtml).toContain(
				`<a href="https://historicengland.org.uk/listing/the-list/list-entry/${validListedBuilding}" class="govuk-link" target="_blank">${validListedBuilding}</a>`
			);
			expect(elementInnerHtml).toContain('Add changed listed building</button>');
		});
	});

	describe('POST /add/check-and-confirm', () => {
		it('should redirect to the lpa questionnaire page', async () => {
			const validData = {
				changedListedBuilding: validListedBuilding
			};
			nock('http://test/').post(`/appeals/${appealId}/listed-buildings`).reply(200, {});

			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add`
				)
				.send(validData);

			const response = await request.post(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add/check-and-confirm`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});
	});

	describe('GET /manage', () => {
		it('should render the manage changed listed buildings page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/manage`
			);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toContain('Changed listed buildings</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(unprettifiedElement).toContain('Listed building number</th>');
			expect(unprettifiedElement).toContain('Action</th>');
			expect(unprettifiedElement).toContain(
				'Change<span class="govuk-visually-hidden"> listed building 1234569</span></a>'
			);
			expect(unprettifiedElement).toContain(
				'Remove<span class="govuk-visually-hidden"> listed building 1234569</span></a>'
			);
		});
	});

	describe('GET /change/:listedBuildingId', () => {
		it('should render the change listed building page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
			);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');
		});
	});

	describe('POST /change/:listedBuildingId', () => {
		it('should re-render the change listed building page when the listed building is empty', async () => {
			const invalidData = {
				changedListedBuilding: null
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');
		});

		it('should re-render the change changed listed building page with an error when listed building is less than seven digits', async () => {
			const invalidData = {
				changedListedBuilding: '12345'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the change changed listed building page with an error when listed building is more than seven digits', async () => {
			const invalidData = {
				changedListedBuilding: '12345678'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the change changed listed building page with an error when listed building contains a special character', async () => {
			const invalidData = {
				changedListedBuilding: '*123456'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the change changed listed building page with an error when listed building contains a letter', async () => {
			const invalidData = {
				changedListedBuilding: 'A123456'
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(invalidData);

			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Listed building entry number must be 7 digits</a>');
		});

		it('should re-render the change changed listed building page with an error when listed building is seven digits but not in historic england', async () => {
			const invalidData = {
				changedListedBuilding: invalidListedBuilding
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(invalidData);
			expect(response.statusCode).toBe(200);
			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('- update changed listed building</span>');
			expect(elementInnerHtml).toContain('Changed listed building entry number</h1>');
			expect(elementInnerHtml).toContain('This is a 7 digit number from Historic England</div>');

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(errorSummaryHtml).toContain('There is a problem</h2>');
			expect(errorSummaryHtml).toContain('Enter a real listed building entry number</a>');
		});

		it('should redirect to to the check and confirm page if the data is valid', async () => {
			const validData = {
				changedListedBuilding: validListedBuilding
			};

			const response = await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1/changed-listed-buildings/change/1/check-and-confirm'
			);
		});
	});

	describe('GET /change/:listedBuildingId/check-and-confirm', () => {
		it('should render the check and confirm page', async () => {
			const validData = {
				changedListedBuilding: validListedBuilding
			};
			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(validData);
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1/check-and-confirm`
			);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();

			expect(elementInnerHtml).toContain('Check details and update changed listed building</h1>');
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
			expect(unprettifiedElement).toContain('Changed listed building</dt>');
			expect(unprettifiedElement).toContain(
				`<a href="https://historicengland.org.uk/listing/the-list/list-entry/${validListedBuilding}" class="govuk-link" target="_blank">${validListedBuilding}</a>`
			);
			expect(elementInnerHtml).toContain('Update changed listed building</button>');
		});
	});

	describe('POST /change/:listedBuildingId/check-and-confirm', () => {
		it('should redirect to lpa questionnaire', async () => {
			const validData = {
				changedListedBuilding: validListedBuilding
			};

			nock('http://test/').patch(`/appeals/${appealId}/listed-buildings/1`).reply(200, {});

			await request
				.post(
					`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1`
				)
				.send(validData);
			const response = await request.post(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/1/check-and-confirm`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1'
			);
		});
	});

	describe('GET /remove/:listedBuildingId', () => {
		it('should render the remove changed listed building page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/remove/1`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(response.statusCode).toBe(200);
			expect(elementInnerHtml).toContain(
				'Confirm that you want to remove the changed listed building</h1>'
			);
			expect(elementInnerHtml).toContain('Remove changed listed building</button>');
		});
	});

	describe('POST /remove/:listedBuildingId', () => {
		it('should redirect to manage listed building', async () => {
			nock('http://test/').delete(`/appeals/${appealId}/listed-buildings`).reply(200, {});
			const response = await request.post(
				`${baseUrl}/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/remove/1`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/1`
			);
		});
	});
});
