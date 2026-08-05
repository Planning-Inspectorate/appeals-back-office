import {
	appealData,
	appealDataAdvert,
	appealDataCasAdvert,
	appealDataCasPlanning,
	appealDataEnforcementNotice,
	appealDataFullPlanning,
	appealDataLdc,
	appealDataListedBuilding,
	appellantCaseDataIncompleteOutcome,
	appellantCaseDataInvalidOutcome,
	appellantCaseDataNotValidated,
	appellantCaseDataOwnsPartLand,
	appellantCaseDataValidOutcome,
	documentRedactionStatuses,
	enforcementAppealAppellantCaseDataIncompleteOutcome,
	fileUploadInfo,
	text300Characters,
	text301Characters
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml, parseHtmlSelectAll } from '@pins/platform';
import {
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';

import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const notificationBannerElement = '.govuk-notification-banner';
const appellantCaseDataNotValidatedNoEnforcementNotice = {
	...JSON.parse(JSON.stringify(appellantCaseDataNotValidated)),
	enforcementNotice: { isReceived: false, isListedBuilding: false }
};

/**
 * @param {number} appealId
 * @param {number} folderId
 * @returns {string}
 */
const getFolderApiUrl = (appealId, folderId) =>
	`/appeals/${appealId}/document-folders/${folderId}?pageNumber=1&pageSize=100`;

//@ts-ignore
const mapExistsFromAppeal = (appeal) => ({
	id: appeal.appealId,
	appealId: appeal.appealId,
	appealReference: appeal.appealReference
});

describe('appellant-case-main', () => {
	beforeEach(installMockApi);
	afterEach(teardown);
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});

	describe('GET /appellant-case', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/exists')
				.reply(200, mapExistsFromAppeal(appellantCaseDataNotValidatedNoEnforcementNotice))
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the appellant case page with the expected common Before you start content', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Before you start</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What is your appeal about?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Which local planning authority (LPA) do you want to appeal against?'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is the application reference number?');
			expect(unprettifiedElement.innerHTML).toContain('Was your application granted or refused?');
			expect(unprettifiedElement.innerHTML).toContain(
				'What’s the date on the decision letter from the local planning authority?​'
			);
		});

		it('should render the appellant case page with the expected content (Householder)', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain('1. Appellant details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('2. Site details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('3. Application details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('4. Upload documents</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h2>');

			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What date did you submit your application?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Was your application granted or refused?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What’s the date on the decision letter from the local planning authority?​</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority</dt>'
			);
		});

		it.each([
			['Householder', appealData],
			['CAS planning', appealDataCasPlanning],
			['CAS advert', appealDataCasAdvert]
		])(
			'should show Appeal statement in Upload documents for %s appeals submitted before 1 April 2026',
			async (_, testAppealData) => {
				nock('http://test/')
					.get('/appeals/2?include=all')
					.reply(200, {
						...testAppealData,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/appellant-cases/0')
					.reply(200, {
						...appellantCaseDataNotValidatedNoEnforcementNotice,
						applicationDate: '2026-03-31T12:00:00.000Z'
					});

				const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('4. Upload documents</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Appeal statement');
			}
		);

		it.each([
			['Householder', appealData],
			['CAS planning', appealDataCasPlanning],
			['CAS advert', appealDataCasAdvert]
		])(
			'should not show Appeal statement in Upload documents for %s appeals submitted from 1 April 2026 onwards',
			async (_, testAppealData) => {
				nock('http://test/')
					.get('/appeals/2?include=all')
					.reply(200, {
						...testAppealData,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/appellant-cases/0')
					.reply(200, {
						...appellantCaseDataNotValidatedNoEnforcementNotice,
						applicationDate: '2026-04-01T00:00:00.000Z'
					});

				const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('5. Upload documents</h2>');
				expect(unprettifiedElement.innerHTML).not.toContain('Appeal statement');
			}
		);

		it.each([
			['CAS planning', appealDataCasPlanning],
			['CAS advert', appealDataCasAdvert]
		])(
			'should not show Plans, drawings and list of plans in Upload documents for %s appeals submitted from 1 April 2026 onwards',
			async (_, testAppealData) => {
				nock('http://test/')
					.get('/appeals/2?include=all')
					.reply(200, {
						...testAppealData,
						appealId: 2
					});
				nock('http://test/')
					.get('/appeals/2/appellant-cases/0')
					.reply(200, {
						...appellantCaseDataNotValidatedNoEnforcementNotice,
						applicationDate: '2026-04-01T00:00:00.000Z'
					});

				const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).not.toContain('Plans, drawings and list of plans');
				expect(unprettifiedElement.innerHTML).not.toContain('Design and access statement');
			}
		);

		it('should render the appellant case page with the expected content (Full planning appeal / S78)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Design and access statement</dt>');
			expect(unprettifiedElement.innerHTML).toContain('New plans or drawings</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Plans, drawings and list of plans</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Planning obligation</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Is the appeal site part of an agricultural holding?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you a tenant of the agricultural holding?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Are there any other tenants?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Separate ownership certificate and agricultural land declaration</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
		});
		it('should render the appellant case page with the expected content (Listed building planning appeal / S20)', async () => {
			nock('http://test/')
				.get('/appeals/3?include=all')
				.reply(200, {
					...appealDataListedBuilding,
					appealId: 3
				});
			nock('http://test/')
				.get('/appeals/3/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.LISTED_BUILDING
				});

			const response = await request.get(`${baseUrl}/3${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Design and access statement</dt>');
			expect(unprettifiedElement.innerHTML).toContain('New plans or drawings</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Plans, drawings and list of plans</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Planning obligation</dt>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Is the appeal site part of an agricultural holding?</dt>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Are you a tenant of the agricultural holding?</dt>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Are there any other tenants?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Separate ownership certificate and agricultural land declaration</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);
		});

		it('should render the appellant case page with the expected content (CAS planning)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataCasPlanning,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					typeOfPlanningApplication:
						APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain('1. Appellant details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('2. Site details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('3. Application details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('4. Upload documents</h2>');
			expect(unprettifiedElement.innerHTML).not.toContain('Additional documents</h2>');

			expect(unprettifiedElement.innerHTML).toContain(
				'What date did you submit your application?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Enter the description of development that you submitted in your application</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Was your application granted or refused?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What’s the date on the decision letter from the local planning authority?​</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority</dt>'
			);
		});

		it('should render the appellant case page with the expected content (CAS advert)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataCasAdvert,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.ADVERTISEMENT
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');

			expect(unprettifiedElement.innerHTML).toContain('1. Appellant details</h2>');

			expect(unprettifiedElement.innerHTML).toContain('2. Site details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What is the address of the appeal site?');
			expect(unprettifiedElement.innerHTML).toContain('Is the appeal site in a green belt?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant own all of the land involved in the appeal?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?'
			);

			expect(unprettifiedElement.innerHTML).toContain('3. Application details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What date did you submit your application?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of the advertisement'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority'
			);

			expect(unprettifiedElement.innerHTML).toContain('4. Upload documents</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Application form');
			expect(unprettifiedElement.innerHTML).toContain('Appeal statement');
			expect(unprettifiedElement.innerHTML).toContain('Application for an award of appeal costs');
			expect(unprettifiedElement.innerHTML).toContain('Plans, drawings and list of plans');
			expect(unprettifiedElement.innerHTML).not.toContain('Additional documents</h2>');
		});

		it('should render the appellant case page with the expected content (advert) (owns all land)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataAdvert,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.ADVERTISEMENT
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');

			expect(unprettifiedElement.innerHTML).toContain('1. Appellant details</h2>');

			expect(unprettifiedElement.innerHTML).toContain('2. Site details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What is the address of the appeal site?');
			expect(unprettifiedElement.innerHTML).toContain('Is the appeal site in a green belt?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant own all of the land involved in the appeal?</dt><dd class="govuk-summary-list__value"> Fully owned'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?</dt><dd class="govuk-summary-list__value"> No'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?'
			);

			expect(unprettifiedElement.innerHTML).toContain('3. Application details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What date did you submit your application?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of the advertisement'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority'
			);
			expect(unprettifiedElement.innerHTML).toContain('4. Appeal details</h2>');

			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);

			expect(unprettifiedElement.innerHTML).toContain('5. Upload documents</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Application form');
			expect(unprettifiedElement.innerHTML).toContain('Appeal statement');
			expect(unprettifiedElement.innerHTML).toContain('Application for an award of appeal costs');
			expect(unprettifiedElement.innerHTML).toContain('Plans, drawings and list of plans');
			expect(unprettifiedElement.innerHTML).not.toContain('Additional documents</h2>');
		});

		it('should render the appellant case page with the expected content (ldc)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataLdc,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					typeOfPlanningApplication:
						APPEAL_TYPE_OF_PLANNING_APPLICATION.LAWFUL_DEVELOPMENT_CERTIFICATE
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');

			expect(unprettifiedElement.innerHTML).toContain('1. Appellant details</h2>');

			expect(unprettifiedElement.innerHTML).toContain('2. Site details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What is the address of the appeal site?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?'
			);

			expect(unprettifiedElement.innerHTML).toContain('3. Application details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What date did you submit your application?');
			expect(unprettifiedElement.innerHTML).toContain(
				'What type of lawful development certificate is the appeal about?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What did you use the appeal site for when you made the application?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Enter the description of development that you submitted in your application'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of development'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?'
			);

			expect(unprettifiedElement.innerHTML).toContain('4. Appeal details</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);

			expect(unprettifiedElement.innerHTML).toContain('5. Upload documents</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Application form');
			expect(unprettifiedElement.innerHTML).toContain('Appeal statement');
			expect(unprettifiedElement.innerHTML).toContain('Application for an award of appeal costs');
			expect(unprettifiedElement.innerHTML).toContain('Plans, drawings and list of plans');
			expect(unprettifiedElement.innerHTML).toContain('Draft statement of common ground');
			expect(unprettifiedElement.innerHTML).toContain('New plans or drawings');
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents');

			expect(unprettifiedElement.innerHTML).not.toContain('Additional documents</h2>');
		});

		it('should render review outcome form fields and controls when the appeal is in "validation" status', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					appealStatus: APPEAL_CASE_STATUS.VALIDATION
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the outcome of your review?</legend>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="reviewOutcome" type="radio" value="valid">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="reviewOutcome" type="radio" value="invalid">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="reviewOutcome" type="radio" value="incomplete">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		const appealStatusesWithoutValidation = Object.values(APPEAL_CASE_STATUS).filter(
			(status) => status !== APPEAL_CASE_STATUS.VALIDATION
		);

		for (const appealStatus of appealStatusesWithoutValidation) {
			it(`should not render review outcome form fields or controls when the appeal is not in "validation" status (${appealStatus})`, async () => {
				nock('http://test/')
					.get('/appeals/2?include=all')
					.reply(200, {
						...appealData,
						appealId: 2,
						appealStatus
					});
				nock('http://test/')
					.get('/appeals/2/appellant-cases/0')
					.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);

				const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).not.toContain(
					'What is the outcome of your review?</legend>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'name="reviewOutcome" type="radio" value="valid">'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'name="reviewOutcome" type="radio" value="invalid">'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'name="reviewOutcome" type="radio" value="incomplete">'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Continue</button>');
			});
		}

		it('should render the appellant case page with the expected content (Enforcement notice)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataEnforcementNotice,
					appealStatus: 'validation',
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					enforcementNotice: {
						isReceived: true,
						isListedBuilding: true,
						issueDate: '2021-01-01',
						effectiveDate: '2021-01-02',
						contactPlanningInspectorateDate: '2021-01-03',
						reference: '123456789'
					},
					otherAppellants: [
						{
							firstName: 'John',
							lastName: 'Smith',
							email: 'john.test@example.pins.test'
						},
						{
							firstName: 'Malcolm',
							lastName: 'Jones',
							email: 'malcolm.test@example.pins.test'
						}
					],
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the address of the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is your contact address?</dt>');
			expect(unprettifiedElement.innerHTML).toContain('What is your interest in the land?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
			// upload document section
			expect(unprettifiedElement.innerHTML).toContain(
				'Communication with the Planning Inspectorate</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice plan</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Application form</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of development</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Planning obligation</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Application for an award of appeal costs</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the outcome of your review?</legend><div class="govuk-radios"'
			);

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span>'
			);

			expect(unprettifiedElement.innerHTML).toContain(
				'Do not select an outcome until you have reviewed all of the supporting documents and redacted any sensitive information.</strong>'
			);
		});
		it('should render the appellant case page with the expected content (Lead Enforcement notice)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataEnforcementNotice,
					appealStatus: 'validation',
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					enforcementNotice: {
						isReceived: true,
						isListedBuilding: true,
						issueDate: '2021-01-01',
						effectiveDate: '2021-01-02',
						contactPlanningInspectorateDate: '2021-01-03',
						reference: '123456789'
					},
					otherAppellants: [
						{
							firstName: 'John',
							lastName: 'Smith',
							email: 'john.test@example.pins.test'
						},
						{
							firstName: 'Malcolm',
							lastName: 'Jones',
							email: 'malcolm.test@example.pins.test'
						}
					],
					isEnforcementParent: true,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the address of the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is your contact address?</dt>');
			expect(unprettifiedElement.innerHTML).toContain('What is your interest in the land?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
			// upload document section
			expect(unprettifiedElement.innerHTML).toContain(
				'Communication with the Planning Inspectorate</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice plan</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Application form</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of development</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Planning obligation</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Application for an award of appeal costs</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');

			expect(unprettifiedElement.innerHTML).toContain(
				'What is the outcome of your review?</legend><div class="govuk-radios"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Do not select an outcome until you have reviewed all of the supporting documents and redacted any sensitive information for each linked appeal.</strong>'
			);
		});
		it('should render the appellant case page with the expected content (Child Enforcement notice)', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataEnforcementNotice,
					appealStatus: 'validation',
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					enforcementNotice: {
						isReceived: true,
						isListedBuilding: true,
						issueDate: '2021-01-01',
						effectiveDate: '2021-01-02',
						contactPlanningInspectorateDate: '2021-01-03',
						reference: '123456789'
					},
					otherAppellants: [
						{
							firstName: 'John',
							lastName: 'Smith',
							email: 'john.test@example.pins.test'
						},
						{
							firstName: 'Malcolm',
							lastName: 'Jones',
							email: 'malcolm.test@example.pins.test'
						}
					],
					isEnforcementChild: true,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the address of the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is your contact address?</dt>');
			expect(unprettifiedElement.innerHTML).toContain('What is your interest in the land?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
			// upload document section
			expect(unprettifiedElement.innerHTML).toContain(
				'Communication with the Planning Inspectorate</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice plan</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Application form</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of development</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Planning obligation</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Application for an award of appeal costs</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'What is the outcome of your review?</legend><div class="govuk-radios"'
			);

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span>'
			);
		});

		it('should render the appellant case page with the expected content (Enforcement notice) when no enforcement data', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataEnforcementNotice,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					enforcementNotice: {
						isReceived: null,
						isListedBuilding: null,
						issueDate: null,
						effectiveDate: null,
						contactPlanningInspectorateDate: null,
						reference: null
					},
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the address of the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is your contact address?</dt>');
			expect(unprettifiedElement.innerHTML).toContain('What is your interest in the land?</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?</dt>'
			);
			// upload document section
			expect(unprettifiedElement.innerHTML).toContain(
				'Communication with the Planning Inspectorate</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Enforcement notice plan</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Application form</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of development</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'What is the status of your planning obligation?</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Planning obligation</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Application for an award of appeal costs</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Other new supporting documents</dt>');
		});

		it('should render the appellant case page with the expected content (owns part land and knows some owners', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataCasAdvert,
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataOwnsPartLand,
					typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.ADVERTISEMENT
				});

			const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');

			expect(unprettifiedElement.innerHTML).toContain('1. Appellant details</h2>');

			expect(unprettifiedElement.innerHTML).toContain('2. Site details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What is the address of the appeal site?');
			expect(unprettifiedElement.innerHTML).toContain('Is the appeal site in a green belt?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant own all of the land involved in the appeal?</dt><dd class="govuk-summary-list__value"> Partially owned'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Does the appellant know who owns the land involved in the appeal?</dt><dd class="govuk-summary-list__value"> Some'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Will an inspector need to access your land or property?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there any health and safety issues on the appeal site?'
			);

			expect(unprettifiedElement.innerHTML).toContain('3. Application details</h2>');
			expect(unprettifiedElement.innerHTML).toContain('What date did you submit your application?');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change the description of the advertisement'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Are there other appeals linked to your development?'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Decision letter from the local planning authority'
			);

			expect(unprettifiedElement.innerHTML).toContain('4. Upload documents</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Application form');
			expect(unprettifiedElement.innerHTML).toContain('Appeal statement');
			expect(unprettifiedElement.innerHTML).toContain('Application for an award of appeal costs');
			expect(unprettifiedElement.innerHTML).toContain('Plans, drawings and list of plans');
			expect(unprettifiedElement.innerHTML).not.toContain('Additional documents</h2>');
		});

		describe('notification banners', () => {
			it('should render a "LPA application reference" success notification banner when the planning application reference is updated', async () => {
				const appealId = appealData.appealId.toString();
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealData))
					.persist();

				nock('http://test/')
					.get(`/appeals/${appealId}?include=all`)
					.reply(200, {
						...appealData,
						lpaQuestionnaireId: undefined
					})
					.persist();
				nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
					planningApplicationReference: '12345/A/67890'
				});
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);

				const validData = {
					planningApplicationReference: '12345/A/67890'
				};

				await request
					.post(`${baseUrl}/${appealId}/appellant-case/lpa-reference/change`)
					.send(validData);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Appeal updated</p>');
			});

			it('should render a "Application decision date updated" notification banner when the application decision date is updated', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseId = appealData.appellantCaseId;
				const validData = {
					'application-decision-date-day': '11',
					'application-decision-date-month': '06',
					'application-decision-date-year': '2021'
				};

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, { ...validData });

				await request
					.post(`${baseUrl}/${appealId}/appellant-case/application-decision-date/change`)
					.send(validData);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Application decision date changed');
			});

			it('should render a "Green belt status updated" notification banner when the green belt response is changed', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseId = appealData.appellantCaseId;
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

				const validData = {
					greenBeltRadio: 'yes'
				};

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {});

				await request.post(`${appellantCaseUrl}/green-belt/change/appellant`).send(validData);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Green belt status updated');
			});

			it('should render a "Site health and safety risks updated" success notification banner when the planning application reference is updated', async () => {
				const appealId = appealData.appealId;
				const appellantCaseId = appealData.appellantCaseId;
				const validData = {
					safetyRisksRadio: 'yes',
					safetyRisksDetails: 'Details'
				};

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {
						...validData
					});

				await request
					.post(`${baseUrl}/${appealId}/appellant-case/safety-risks/change/appellant`)
					.send(validData);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const element = parseHtml(response.text, { rootElement: notificationBannerElement });
				expect(element.innerHTML).toMatchSnapshot();

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain(
					'Site health and safety risks (appellant answer) updated</p>'
				);
			});

			it('should render a "Site area updated" success notification banner when the site area is updated', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseId = appealData.appellantCaseId.toString();
				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {
						siteAreaSquareMetres: '31.5'
					});

				const validData = {
					siteArea: '31.5'
				};

				await request
					.post(`${baseUrl}/${appealId}/appellant-case/site-area/change`)
					.send(validData);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const element = parseHtml(response.text, { rootElement: notificationBannerElement });
				expect(element.innerHTML).toMatchSnapshot();

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Site area updated</p>');
			});

			it('should render a "Inspector access (appellant) updated" success notification banner when the inspector access (appellant) is updated', async () => {
				const appealId = appealData.appealId;
				const appellantCaseId = appealData.appellantCaseId;
				const validData = {
					inspectorAccessRadio: 'yes',
					inspectorAccessDetails: 'Details'
				};

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {
						...validData
					});

				await request
					.post(`${baseUrl}/${appealId}/appellant-case/inspector-access/change/appellant`)
					.send(validData);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Inspector access (appellant) updated</p>');
			});

			it('should render a success notification banner when a service user was updated', async () => {
				nock('http://test/').patch(`/appeals/1/service-user`).reply(200, {
					serviceUserId: 1
				});
				const validData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					organisationName: 'Jones Inc',
					phoneNumber: '01234 567 890',
					emailAddress: 'jones@mail.com'
				};
				await request.post(`${baseUrl}/1/appellant-case/service-user/change/agent`).send(validData);

				const caseDetailsResponse = await request.get(`${baseUrl}/1/appellant-case`);

				const element = parseHtml(caseDetailsResponse.text);
				expect(element.innerHTML).toMatchSnapshot();

				const notificationBannerElementHTML = parseHtml(caseDetailsResponse.text, {
					rootElement: notificationBannerElement
				}).innerHTML;
				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Agent&#39;s contact details updated</p>');
			});

			it('should render a "Site updated" notification when the site address has been updated', async () => {
				const appealId = appealData.appealId.toString();
				nock('http://test/').patch(`/appeals/${appealId}/addresses/1`).reply(200, {
					addressLine1: '1 Grove Cottage',
					county: 'Devon',
					postcode: 'NR35 2ND',
					town: 'Woodton'
				});
				nock('http://test/')
					.get(`/appeals/${appealData.appealId}/appellant-case`)
					.reply(200, appealData);

				await request.post(`${baseUrl}/${appealId}/appellant-case/site-address/change/1`).send({
					addressLine1: '1 Grove Cottage',
					county: 'Devon',
					postCode: 'NR35 2ND',
					town: 'Woodton'
				});

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Site address updated</p>');
			});

			it('should render an "Appeal is invalid" notification banner with the expected content when the appellant case has been reviewed with an outcome of "invalid"', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealData))
					.persist();

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataInvalidOutcome);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const notificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;

				expect(notificationBannerHTML).toMatchSnapshot();

				const unprettifiedNotificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is invalid</h3>');
				expect(unprettifiedNotificationBannerHTML).toContain('<details class="govuk-details">');
				expect(unprettifiedNotificationBannerHTML).toContain(
					'Incorrect name and/or missing documents</span>'
				);
				expect(unprettifiedNotificationBannerHTML).toContain(
					'Appellant name is not the same on the application form and appeal form</div>'
				);
				expect(unprettifiedNotificationBannerHTML).toContain(
					'Attachments and/or appendices have not been included to the full statement of case</span>'
				);
				expect(unprettifiedNotificationBannerHTML).toContain('test reason 1</div>');
				expect(unprettifiedNotificationBannerHTML).toContain('Other</span>');
				expect(unprettifiedNotificationBannerHTML).toContain('test reason 2</li>');
				expect(unprettifiedNotificationBannerHTML).toContain('test reason 3</li>');
			});

			it('should render an "Appeal is incomplete" notification banner with the expected content when the appellant case has been reviewed with an outcome of "incomplete"', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealData))
					.persist();

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataIncompleteOutcome);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const notificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;

				expect(notificationBannerHTML).toMatchSnapshot();

				const unprettifiedNotificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is incomplete</h3>');
				expect(unprettifiedNotificationBannerHTML).toContain('<details class="govuk-details">');
				expect(unprettifiedNotificationBannerHTML).toContain('Due date</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('2 October 2024</dd>');
				expect(unprettifiedNotificationBannerHTML).toContain(
					'Incorrect name and/or missing documents</span>'
				);
				expect(unprettifiedNotificationBannerHTML).toContain(
					'Appellant name is not the same on the application form and appeal form</div>'
				);
				expect(unprettifiedNotificationBannerHTML).toContain(
					'Attachments and/or appendices have not been included to the full statement of case</span>'
				);
				expect(unprettifiedNotificationBannerHTML).toContain('test reason 1</div>');
				expect(unprettifiedNotificationBannerHTML).toContain('Other</span>');
				expect(unprettifiedNotificationBannerHTML).toContain('test reason 2</li>');
				expect(unprettifiedNotificationBannerHTML).toContain('test reason 3</li>');
			});

			it('should not render an "Appeal is incomplete" notification banner when the appellant case has been reviewed with an outcome of "incomplete" and then re-reviewed with an outcome of "valid"', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealData))
					.persist();

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataIncompleteOutcome);

				const incompleteOutcomeResponse = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const unprettifiedNotificationBannerHTML = parseHtml(incompleteOutcomeResponse.text, {
					rootElement: '.govuk-notification-banner',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is incomplete</h3>');

				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealData))
					.persist();
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataValidOutcome);

				const validOutcomeResponse = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

				const unprettifiedHTML = parseHtml(validOutcomeResponse.text, {
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedHTML).not.toContain('Appeal is incomplete</h3>');
			});

			it('should render a "Planning obligation status updated" notification banner when the planning obligation status is changed', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				await request.post(`${appellantCaseUrl}/planning-obligation/status/change`).send({
					planningObligationStatusRadio: 'finalised'
				});

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Planning obligation status updated');
			});

			it('should render a "Part of agricultural holding updated" notification banner when the part of agricultural holding response is changed', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				await request.post(`${appellantCaseUrl}/agricultural-holding/change`).send({
					partOfAgriculturalHoldingRadio: 'yes'
				});

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Part of agricultural holding updated');
			});

			it('should render a "Tenant of agricultural holding updated" notification banner when the tenant of agricultural holding response is changed', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				await request.post(`${appellantCaseUrl}/agricultural-holding/tenant/change`).send({
					tenantOfAgriculturalHoldingRadio: 'yes'
				});

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain('Tenant of agricultural holding updated');
			});

			it('should render an "Other tenants of agricultural holding updated" notification banner when the other tenants of agricultural holding response is changed', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appealData.appellantCaseId}`)
					.reply(200, {});

				await request.post(`${appellantCaseUrl}/agricultural-holding/other-tenants/change`).send({
					otherTenantsOfAgriculturalHoldingRadio: 'yes'
				});

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
				const notificationBannerElementHTML = parseHtml(response.text, {
					rootElement: notificationBannerElement
				}).innerHTML;

				expect(notificationBannerElementHTML).toMatchSnapshot();
				expect(notificationBannerElementHTML).toContain('Success</h3>');
				expect(notificationBannerElementHTML).toContain(
					'Other tenants of agricultural holding updated'
				);
			});

			it('should render success banners before (above) important banners', async () => {
				const appealId = appealData.appealId.toString();
				const appellantCaseId = appealData.appellantCaseId;
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;

				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealData))
					.persist();

				nock('http://test/').get(`/appeals/${appealId}?include=all`).reply(200, appealData);
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataIncompleteOutcome);

				nock('http://test/')
					.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, {});

				await request.post(`${appellantCaseUrl}/green-belt/change/appellant`).send({
					greenBeltRadio: 'yes'
				});

				nock('http://test/').get(`/appeals/${appealId}?include=all`).reply(200, appealData);
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/0`)
					.reply(200, appellantCaseDataIncompleteOutcome);

				const response = await request.get(`${baseUrl}/${appealId}${appellantCasePagePath}`);

				expect(response.statusCode).toBe(200);

				const firstBannerHtml = parseHtml(response.text, {
					rootElement: `.govuk-notification-banner[data-index='0']`,
					skipPrettyPrint: true
				}).innerHTML;
				expect(firstBannerHtml).toContain(
					'<h3 class="govuk-notification-banner__title" id="govuk-notification-banner-title"> Success</h3>'
				);

				const secondBannerHtml = parseHtml(response.text, {
					rootElement: `.govuk-notification-banner[data-index='1']`,
					skipPrettyPrint: true
				}).innerHTML;
				expect(secondBannerHtml).toContain(
					'<h3 class="govuk-notification-banner__title" id="govuk-notification-banner-title"> Appeal is incomplete</h3>'
				);
			});

			it('should render an "Appeal is incomplete" banner where the enforcement notice appeal is incomplete with "Missing information"', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealDataEnforcementNotice))
					.persist();

				nock('http://test/')
					.get('/appeals/5623?include=all')
					.reply(200, appealDataEnforcementNotice);
				nock('http://test/')
					.get('/appeals/5623/appellant-cases/0')
					.reply(200, enforcementAppealAppellantCaseDataIncompleteOutcome);

				const response = await request.get(`${baseUrl}/5623${appellantCasePagePath}`);

				const notificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;

				expect(notificationBannerHTML).toMatchSnapshot();

				const unprettifiedNotificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is incomplete</h3>');
				expect(unprettifiedNotificationBannerHTML).toContain('Due date</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('2 October 2024</dd>');
				expect(unprettifiedNotificationBannerHTML).toContain('Incomplete reasons</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('Enforcement notice invalid</dd>');
			});

			it('should render an "Appeal is incomplete" banner where the enforcement notice appeal is incomplete with "Ground (a) fee receipt due"', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealDataEnforcementNotice))
					.persist();

				nock('http://test/')
					.get('/appeals/5623?include=all')
					.reply(200, {
						...appealDataEnforcementNotice,
						documentationSummary: {
							appellantCase: {
								dueDate: null
							}
						}
					});
				nock('http://test/')
					.get('/appeals/5623/appellant-cases/0')
					.reply(200, {
						...enforcementAppealAppellantCaseDataIncompleteOutcome,
						enforcementNotice: {
							enforcementNoticeInvalid: 'no',
							groundAFeeDueDate: '2024-01-02'
						}
					});

				const response = await request.get(`${baseUrl}/5623${appellantCasePagePath}`);

				const notificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;

				expect(notificationBannerHTML).toMatchSnapshot();

				const unprettifiedNotificationBannerHTML = parseHtml(response.text, {
					rootElement: '.govuk-notification-banner',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is incomplete</h3>');
				expect(unprettifiedNotificationBannerHTML).toContain('Due date</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('2 January 2024</dd>');
				expect(unprettifiedNotificationBannerHTML).toContain('Incomplete reasons</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('Ground (a) fee receipt due</dd>');
			});

			it('should render both "Appeal is incomplete" banners where the enforcement notice appeal is incomplete with "Missing information" and "Ground (a) fee receipt due"', async () => {
				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/exists')
					.reply(200, mapExistsFromAppeal(appealDataEnforcementNotice))
					.persist();

				nock('http://test/')
					.get('/appeals/5623?include=all')
					.reply(200, appealDataEnforcementNotice);
				nock('http://test/')
					.get('/appeals/5623/appellant-cases/0')
					.reply(200, {
						...enforcementAppealAppellantCaseDataIncompleteOutcome,
						enforcementNotice: {
							enforcementNoticeInvalid: 'no',
							groundAFeeDueDate: '2024-01-02'
						}
					});

				const response = await request.get(`${baseUrl}/5623${appellantCasePagePath}`);
				const notificationBannerHTML = parseHtmlSelectAll(response.text, {
					rootElement: '.govuk-notification-banner'
				}).innerHTML;

				expect(notificationBannerHTML).toMatchSnapshot();

				const unprettifiedNotificationBannerHTML = parseHtmlSelectAll(response.text, {
					rootElement: '.govuk-notification-banner',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is incomplete</h3>');
				expect(unprettifiedNotificationBannerHTML).toContain('Due date</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('2 October 2024</dd>');
				expect(unprettifiedNotificationBannerHTML).toContain('Incomplete reasons</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('Missing information</dd>');
				expect(unprettifiedNotificationBannerHTML).toContain('Appeal is incomplete</h3>');
				expect(unprettifiedNotificationBannerHTML).toContain('Due date</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('2 January 2024</dd>');
				expect(unprettifiedNotificationBannerHTML).toContain('Incomplete reasons</dt>');
				expect(unprettifiedNotificationBannerHTML).toContain('Ground (a) fee receipt due</dd>');
			});

			describe('Document added success banners', () => {
				const appealId = 2;
				const folderId = 1;
				const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;
				const testCases = [
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT}`,
						label: 'Appeal statement'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM}`,
						label: 'Application form'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER}`,
						label: 'Application decision letter'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION}`,
						label: 'Agreement to change description evidence'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`,
						label: 'Appellant withdrawal request'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE}`,
						label: 'Additional documents'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT}`,
						label: 'Design and access statement'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
						label: 'Plans, drawings and list of plans'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS}`,
						label: 'New plans or drawings'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION}`,
						label: 'Planning obligation'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE}`,
						label: 'Ownership certificate and/or land declaration'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS}`,
						label: 'Other new supporting documents'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT}`,
						label: 'Environmental assessment'
					},
					{
						folderPath: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT_APPELLANT}`,
						label: 'Environmental statement'
					}
				];

				beforeEach(() => {
					nock.cleanAll();
					nock('http://test/')
						.get(`/appeals/${appealId}/exists`)
						.reply(200, {
							id: appealId,
							appealId: appealId,
							appealReference: appealData.appealReference
						})
						.persist();
					nock('http://test/')
						.get(`/appeals/${appealId}?include=all`)
						.reply(200, {
							...appealData,
							appealId
						});
					nock('http://test/')
						.get(`/appeals/${appealId}?include=appellantCase`)
						.reply(200, {
							...appealData,
							appealId
						})
						.persist();
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/0`)
						.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);
					nock('http://test/')
						.get('/appeals/document-redaction-statuses')
						.reply(200, documentRedactionStatuses)
						.persist();
					nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);
				});

				for (const testCase of testCases) {
					it(`should render a "${testCase.label} added" success banner when uploading a document in the "${testCase.folderPath}" folder to the appellant case`, async () => {
						nock('http://test/')
							.get(getFolderApiUrl(appealId, folderId))
							.reply(200, {
								caseId: appealId,
								documents: [],
								folderId: folderId,
								path: testCase.folderPath
							})
							.persist();

						const addDocumentsResponse = await request
							.post(`${appellantCaseUrl}/add-documents/${folderId}`)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const postCheckAndConfirmResponse = await request
							.post(`${appellantCaseUrl}/add-documents/${folderId}/check-your-answers`)
							.send({});

						expect(postCheckAndConfirmResponse.statusCode).toBe(302);
						expect(postCheckAndConfirmResponse.text).toBe(
							`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
						);

						const appellantCaseResponse = await request.get(`${appellantCaseUrl}`);

						expect(appellantCaseResponse.statusCode).toBe(200);

						const notificationBannerElementHTML = parseHtml(appellantCaseResponse.text, {
							rootElement: notificationBannerElement
						}).innerHTML;

						expect(notificationBannerElementHTML).toContain('Success</h3>');
						expect(notificationBannerElementHTML).toContain(`${testCase.label} added`);
					});
				}

				it('should render a fallback "Documents added" success banner when uploading a document in an unhandled folder to the appellant case', async () => {
					nock('http://test/')
						.get(getFolderApiUrl(appealId, 1))
						.reply(200, {
							caseId: appealId,
							documents: [],
							folderId: folderId,
							path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/unhandledFolderPath`
						})
						.persist();

					const addDocumentsResponse = await request
						.post(`${appellantCaseUrl}/add-documents/${folderId}`)
						.send({
							'upload-info': fileUploadInfo
						});

					expect(addDocumentsResponse.statusCode).toBe(302);

					const postCheckAndConfirmResponse = await request
						.post(`${appellantCaseUrl}/add-documents/${folderId}/check-your-answers`)
						.send({});

					expect(postCheckAndConfirmResponse.statusCode).toBe(302);
					expect(postCheckAndConfirmResponse.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case`
					);

					const appellantCaseResponse = await request.get(`${appellantCaseUrl}`);

					expect(appellantCaseResponse.statusCode).toBe(200);

					const notificationBannerElementHTML = parseHtml(appellantCaseResponse.text, {
						rootElement: notificationBannerElement
					}).innerHTML;

					expect(notificationBannerElementHTML).toContain('Success</h3>');
					expect(notificationBannerElementHTML).toContain(`Documents added`);
				});
			});
		});

		describe('show more', () => {
			describe('inspector access required', () => {
				it('should not render a "show more" component on the "inspector access required" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appellantCaseId: 3
						});
					nock('http://test/')
						.get('/appeals/1/appellant-cases/3')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							siteAccessRequired: {
								isRequired: true,
								details: text300Characters
							}
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-details',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><span>${text300Characters}</span></dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "inspector access required" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appellantCaseId: 3
						});
					nock('http://test/')
						.get('/appeals/1/appellant-cases/3')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							siteAccessRequired: {
								isRequired: true,
								details: text301Characters
							}
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);

					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-details',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><div class="pins-show-more" data-label="Enter reason" data-mode="html">${text301Characters}</div></dd>`
					);
				});
			});

			describe('potential safety risks', () => {
				it('should not render a "show more" component on the "potential safety risks" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appellantCaseId: 3
						});
					nock('http://test/')
						.get('/appeals/1/appellant-cases/3')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							healthAndSafety: {
								hasIssues: true,
								details: text300Characters
							}
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-details',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><span>${text300Characters}</span></dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "potential safety risks" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appellantCaseId: 3
						});
					nock('http://test/')
						.get('/appeals/1/appellant-cases/3')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							healthAndSafety: {
								hasIssues: true,
								details: text301Characters
							}
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);

					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#site-details',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"><span>Yes</span><br><div class="pins-show-more" data-label="Enter reason" data-mode="html">${text301Characters}</div></dd>`
					);
				});
			});

			describe('original development description', () => {
				it('should not render a "show more" component on the "original development description" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appellantCaseId: 3
						});
					nock('http://test/')
						.get('/appeals/1/appellant-cases/3')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							developmentDescription: {
								details: text300Characters
							}
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#application-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"> ${text300Characters}</dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "original development description" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appellantCaseId: 3
						});
					nock('http://test/')
						.get('/appeals/1/appellant-cases/3')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							developmentDescription: {
								details: text301Characters
							}
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);

					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#application-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<div class="pins-show-more" data-label="Enter the description of development that you submitted in your application" data-mode="text">${text301Characters}</div>`
					);
				});
			});

			describe('reason for preference', () => {
				it('should not render a "show more" component on the "reason for preference" row if the associated value is less than or equal to 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appealId: 2,
							appealType: 'Planning appeal'
						});
					nock('http://test/')
						.get('/appeals/2/appellant-cases/0')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							appellantProcedurePreferenceDetails: text300Characters
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);
					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#appeal-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<dd class="govuk-summary-list__value"> ${text300Characters}</dd>`
					);
					expect(unprettifiedElement.innerHTML).not.toContain('class="pins-show-more"');
				});

				it('should render a "show more" component with the expected HTML on the "reason for preference" row if the associated value is over 300 characters in length', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealData,
							appealId: 2,
							appealType: 'Planning appeal'
						});
					nock('http://test/')
						.get('/appeals/2/appellant-cases/0')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							appellantProcedurePreferenceDetails: text301Characters
						});

					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);

					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#appeal-summary',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<div class="pins-show-more" data-label="Reason for preference details" data-mode="text">${text301Characters}</div>`
					);
				});
			});

			describe('facts for ground', () => {
				const testGroundRef = 'a';
				it('should render a "show more" component with the expected HTML on the "facts for ground" row', async () => {
					nock('http://test/')
						.get('/appeals/2?include=all')
						.reply(200, {
							...appealDataEnforcementNotice,
							appealId: 2
						});
					nock('http://test/')
						.get('/appeals/2/appellant-cases/0')
						.reply(200, {
							...appellantCaseDataNotValidatedNoEnforcementNotice,
							enforcementNotice: {
								isReceived: true
							},
							appealGrounds: [
								{ ground: { groundRef: testGroundRef }, factsForGround: text301Characters }
							],
							typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL
						});
					const response = await request.get(`${baseUrl}/2${appellantCasePagePath}`);

					const unprettifiedElement = parseHtml(response.text, {
						rootElement: '#grounds-and-facts',
						skipPrettyPrint: true
					});

					expect(unprettifiedElement.innerHTML).toContain(
						`<div class="pins-show-more" data-label="Facts for ground (a)" data-mode="text"data-toggle-text-collapsed="Show more"data-toggle-text-expanded="Show less">${text301Characters}</div>`
					);
				});
			});
		});
	});

	describe('GET /appellant-case with unchecked documents', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1/exists')
				.reply(200, mapExistsFromAppeal(appealData))
				.persist();

			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=all`)
				.reply(200, appealData)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});

		it('should render a notification banner when a file is unscanned', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					documents: {
						...appellantCaseDataNotValidatedNoEnforcementNotice.documents,
						appellantCaseCorrespondence: {
							...appellantCaseDataNotValidatedNoEnforcementNotice.documents
								.appellantCaseCorrespondence,
							documents: [
								...appellantCaseDataNotValidatedNoEnforcementNotice.documents
									.appellantCaseCorrespondence.documents,
								{
									id: 'a78446aa-167a-4bef-89b7-18bcb0da11c2',
									name: 'test-doc.jpeg',
									folderId: 3420,
									caseId: 111,
									isLateEntry: false,
									latestDocumentVersion: {
										...appellantCaseDataNotValidatedNoEnforcementNotice.documents
											.appellantCaseCorrespondence.documents[0].latestDocumentVersion,
										virusCheckStatus: 'not_scanned'
									}
								}
							]
						}
					}
				});

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
			const notificationBannerElementHTML = parseHtml(response.text, {
				rootElement: '.govuk-notification-banner'
			}).innerHTML;
			expect(notificationBannerElementHTML).toMatchSnapshot();
			expect(notificationBannerElementHTML).toContain('Virus scan in progress</h1>');
			expect(notificationBannerElementHTML).toContain(
				'Refresh page to see if scan has finished</a>'
			);
		});

		it('should render an error when a file has a virus', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidatedNoEnforcementNotice,
					documents: {
						...appellantCaseDataNotValidatedNoEnforcementNotice.documents,
						appellantCaseCorrespondence: {
							...appellantCaseDataNotValidatedNoEnforcementNotice.documents
								.appellantCaseCorrespondence,
							documents: [
								...appellantCaseDataNotValidatedNoEnforcementNotice.documents
									.appellantCaseCorrespondence.documents,
								{
									id: 'a78446aa-167a-4bef-89b7-18bcb0da11c2',
									name: 'test-doc.jpeg',
									folderId: 3420,
									caseId: 111,
									isLateEntry: false,
									latestDocumentVersion: {
										...appellantCaseDataNotValidatedNoEnforcementNotice.documents
											.appellantCaseCorrespondence.documents[0].latestDocumentVersion,
										virusCheckStatus: 'affected'
									}
								}
							]
						}
					}
				});

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

			const errorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			}).innerHTML;
			expect(errorSummaryHtml).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'One or more documents in this appellant case contains a virus. Upload a different version of each document that contains a virus.</a>'
			);
		});
	});

	describe('POST /appellant-case', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidatedNoEnforcementNotice);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the appellant case page with the expected error message if no review outcome was selected', async () => {
			const response = await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: ''
			});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select the outcome of your review</a>');
		});

		it('should send a patch request to the appellant-cases API endpoint and redirect to the confirmation page if selected review outcome value is "valid"', async () => {
			nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'valid' });

			const response = await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: 'valid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/valid/date'
			);
		});

		it('should redirect to the invalid reason page if selected review outcome value is "invalid"', async () => {
			nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'invalid' });

			const response = await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: 'invalid'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/invalid'
			);
		});

		it('should redirect to the incomplete reason page if selected review outcome value is "incomplete"', async () => {
			nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'incomplete' });

			const response = await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: 'incomplete'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete'
			);
		});
	});
});
