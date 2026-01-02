import usersService from '#appeals/appeal-users/users-service.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	calculateIncompleteDueDate,
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	oneMonthBefore
} from '#lib/dates.js';
import {
	activeDirectoryUsersData,
	additionalDocumentsFolderInfo,
	appealData,
	appealDataAdvert,
	appealDataCasAdvert,
	appealDataCasPlanning,
	appealDataEnforcementNotice,
	appealDataFullPlanning,
	appealDataListedBuilding,
	appellantCaseDataIncompleteOutcome,
	appellantCaseDataInvalidOutcome,
	appellantCaseDataNotValidated,
	appellantCaseDataOwnsPartLand,
	appellantCaseDataValidOutcome,
	appellantCaseIncompleteReasons,
	appellantCaseInvalidReasons,
	documentFileInfo,
	documentFileMultipleVersionsInfoWithLatestAsLateEntry,
	documentFileVersionsInfo,
	documentFileVersionsInfoChecked,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoVirusFound,
	documentFolderInfo,
	documentRedactionStatuses,
	fileUploadInfo,
	text300Characters,
	text301Characters
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import {
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';

import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const validOutcomePagePath = '/valid';
const invalidOutcomePagePath = '/invalid';
const incompleteOutcomePagePath = '/incomplete';
const updateDueDatePagePath = '/date';
const checkYourAnswersPagePath = '/check-your-answers';
const confirmationPagePath = '/confirmation';
const validDatePagePath = '/date';
const notificationBannerElement = '.govuk-notification-banner';

const invalidReasonsWithoutText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === false
);
const invalidReasonsWithText = appellantCaseInvalidReasons.filter(
	(reason) => reason.hasText === true
);
const incompleteReasonsWithoutText = appellantCaseIncompleteReasons.filter(
	(reason) => reason.hasText === false
);
const incompleteReasonsWithText = appellantCaseIncompleteReasons.filter(
	(reason) => reason.hasText === true
);

const invalidReasonsWithoutTextIds = invalidReasonsWithoutText.map((reason) => reason.id);
const invalidReasonsWithTextIds = invalidReasonsWithText.map((reason) => reason.id);
const incompleteReasonsWithoutTextIds = incompleteReasonsWithoutText.map((reason) => reason.id);
const incompleteReasonsWithTextIds = incompleteReasonsWithText.map((reason) => reason.id);

describe('appellant-case', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
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
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appellant case</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Before you start</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'What type of application is your appeal about?'
			);
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
				.reply(200, appellantCaseDataNotValidated);

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
					...appellantCaseDataNotValidated,
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
					...appellantCaseDataNotValidated,
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
					...appellantCaseDataNotValidated,
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
					...appellantCaseDataNotValidated,
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
					...appellantCaseDataNotValidated,
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
				.reply(200, appellantCaseDataNotValidated);

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
					.reply(200, appellantCaseDataNotValidated);

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
					appealId: 2
				});
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidated,
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
					...appellantCaseDataNotValidated,
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
					.reply(200, appellantCaseDataNotValidated);
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
					}
				];

				beforeEach(() => {
					nock.cleanAll();
					nock('http://test/')
						.get(`/appeals/${appealId}?include=all`)
						.reply(200, {
							...appealData,
							appealId
						})
						.persist();
					nock('http://test/')
						.get(`/appeals/${appealId}/appellant-cases/0`)
						.reply(200, appellantCaseDataNotValidated);
					nock('http://test/')
						.get('/appeals/document-redaction-statuses')
						.reply(200, documentRedactionStatuses)
						.persist();
					nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);
				});

				for (const testCase of testCases) {
					it(`should render a "${testCase.label} added" success banner when uploading a document in the "${testCase.folderPath}" folder to the appellant case`, async () => {
						nock('http://test/')
							.get(`/appeals/${appealId}/document-folders/1`)
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
						.get(`/appeals/${appealId}/document-folders/1`)
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
							...appellantCaseDataNotValidated,
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
					...appellantCaseDataNotValidated,
					documents: {
						...appellantCaseDataNotValidated.documents,
						appellantCaseCorrespondence: {
							...appellantCaseDataNotValidated.documents.appellantCaseCorrespondence,
							documents: [
								...appellantCaseDataNotValidated.documents.appellantCaseCorrespondence.documents,
								{
									id: 'a78446aa-167a-4bef-89b7-18bcb0da11c2',
									name: 'test-doc.jpeg',
									folderId: 3420,
									caseId: 111,
									isLateEntry: false,
									latestDocumentVersion: {
										...appellantCaseDataNotValidated.documents.appellantCaseCorrespondence
											.documents[0].latestDocumentVersion,
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
					...appellantCaseDataNotValidated,
					documents: {
						...appellantCaseDataNotValidated.documents,
						appellantCaseCorrespondence: {
							...appellantCaseDataNotValidated.documents.appellantCaseCorrespondence,
							documents: [
								...appellantCaseDataNotValidated.documents.appellantCaseCorrespondence.documents,
								{
									id: 'a78446aa-167a-4bef-89b7-18bcb0da11c2',
									name: 'test-doc.jpeg',
									folderId: 3420,
									caseId: 111,
									isLateEntry: false,
									latestDocumentVersion: {
										...appellantCaseDataNotValidated.documents.appellantCaseCorrespondence
											.documents[0].latestDocumentVersion,
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
				.reply(200, appellantCaseDataNotValidated);
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

	describe('GET /appellant-case/invalid', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the invalid reason page', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal invalid?</h1>');
			expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /appellant-case/invalid', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the invalid reason page with the expected error message if no invalid reason was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select why the appeal is invalid</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property is an empty string', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property is an empty array', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties are empty strings', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties are empty arays', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the invalid reason page with the expected error message if a single invalid reason with text was provided but the matching text property exceeds the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should re-render the invalid reason page with the expected error message if multiple invalid reasons with text were provided but any of the matching text properties exceed the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should redirect to the check and confirm page if a single invalid reason without text was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithoutTextIds[0]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});

		it('should redirect to the check and confirm page if a single invalid reason with text within the character limit was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithTextIds[0],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons without text were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithoutTextIds
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});

		it('should redirect to the check and confirm page if multiple invalid reasons with text within the character limit were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
					],
					[`invalidReason-${invalidReasonsWithTextIds[1]}`]: [
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength),
						'a'.repeat(textInputCharacterLimits.checkboxTextItemsLength)
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
			);
		});
	});

	describe('GET /appellant-case/incomplete', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the incomplete reason page and content', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Why is the appeal incomplete?</h1>');
			expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');

			// Checkbox content check
			if (!element.textContent) {
				throw new Error('Test setup failed: The main element was not found in the HTML');
			}
			const textContent = element.textContent.replace(/\s+/g, ' ').trim();
			expect(textContent).toContain(
				'Appellant name is not the same on the application form and appeal form'
			);
			expect(textContent).toContain(
				'Attachments and/or appendices have not been included to the full statement of case'
			);
			expect(textContent).toContain("LPA's decision notice is missing");
			expect(textContent).toContain("LPA's decision notice is incorrect or incomplete");
			expect(textContent).toContain(
				'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing'
			);
			expect(textContent).toContain(
				'Agricultural holding certificate and declaration have not been completed on the appeal form'
			);
			expect(textContent).toContain('The original application form is missing');
			expect(textContent).toContain('The original application form is incomplete');
			expect(textContent).toContain('Statement of case and ground of appeal are missing');
			expect(textContent).toContain('Draft statement of common ground is missing');
			expect(textContent).toContain('Other');

			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /appellant-case/incomplete', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the incomplete reason page with the expected error message if no incomplete reason was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select why the appeal is incomplete</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property is an empty string', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property is an empty array', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties are empty strings', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties are empty arrays', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property exceeds the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties exceed the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should redirect to the update due date page if a single incomplete reason without text was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithoutTextIds[0]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});

		it('should redirect to the update due date page a single incomplete reason with text within the character limit was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.defaultInputLength),
						'a'.repeat(textInputCharacterLimits.defaultInputLength)
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});

		it('should redirect to the update due date page if multiple incomplete reasons without text were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithoutTextIds
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});

		it('should redirect to the update due date page if multiple incomplete reasons with text within the character limit were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.defaultInputLength)
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: [
						'a'.repeat(textInputCharacterLimits.defaultInputLength),
						'test reason text 3'
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});
	});

	describe('GET /appellant-case/incomplete/date', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/1?include=all`)
				.reply(200, {
					...appealData,
					appealId: 1
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the update due date page without pre-populated date values if there is no existing due date and applicationDecisionDate is not set', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					documentationSummary: {
						...appealData.documentationSummary,
						appellantCase: {
							...appealData.documentationSummary.appellantCase,
							dueDate: null
						}
					}
				})
				.persist();
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-day" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-month" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-year" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="due-date-day" type="text" value="'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="due-date-month" type="text" value="'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="due-date-year" type="text" value="'
			);
		});

		it('should render the update due date page with pre-populated date values if there is no existing due date and applicationDecisionDate is set', async () => {
			const decisionDate = oneMonthBefore(new Date()).toISOString();
			const expectedDate = calculateIncompleteDueDate(decisionDate, 'Planning appeal');
			const expectedValues = dateISOStringToDayMonthYearHourMinute(expectedDate?.toISOString());

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					appealType: 'Planning appeal',
					documentationSummary: {
						...appealData.documentationSummary,
						appellantCase: {
							...appealData.documentationSummary.appellantCase,
							dueDate: null
						}
					}
				})
				.persist();

			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidated,
					applicationDecisionDate: decisionDate
				});

			const response = await request.get(
				`${baseUrl}/2${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`name="due-date-day" type="text" value="${expectedValues.day}" inputmode="numeric">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`name="due-date-month" type="text" value="${expectedValues.month}" inputmode="numeric">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`name="due-date-year" type="text" value="${expectedValues.year}" inputmode="numeric">`
			);
		});

		it('should render the update due date page with correct pre-populated date values if there is an existing due date', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					documentationSummary: {
						...appealData.documentationSummary,
						appellantCase: {
							...appealData.documentationSummary.appellantCase,
							dueDate: '2024-10-02T10:27:06.626Z'
						}
					}
				})
				.persist();
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="due-date-day" type="text" value="2"');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-month" type="text" value="10"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-year" type="text" value="2024"'
			);
		});
	});

	describe('POST /appellant-case/incomplete/date', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get(`/appeals/1`)
				.reply(200, {
					...appealData,
					appealId: 1
				});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if required data is not present in the session', async () => {
			const response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '',
					'due-date-month': '',
					'due-date-year': ''
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should re-render the update date page with the expected error message if no date was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '',
					'due-date-month': '',
					'due-date-year': ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the appeal due date');
		});

		it('should re-render the update date page with the expected error message if provided date is not in the future', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const monthVariants = [
				{ description: 'numeric month', value: '1' },
				{ description: 'full month name', value: 'January' },
				{ description: 'abbreviated month name', value: 'Jan' }
			];

			for (const variant of monthVariants) {
				const response = await request
					.post(
						`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
					)
					.send({
						'due-date-day': '1',
						'due-date-month': variant.value,
						'due-date-year': '2000'
					});

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot(variant.description);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The appeal due date must be in the future</a>'
				);
			}
		});

		it('should re-render the update date page with the expected error message if an invalid day was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '0',
					'due-date-month': '1',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Appeal due date day must be between 1 and 31</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '32',
					'due-date-month': '1',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Appeal due date day must be between 1 and 31</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': 'first',
					'due-date-month': '1',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Appeal due date day must be a number</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid month was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '0',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Appeal due date month must be between 1 and 12</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '13',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Appeal due date month must be between 1 and 12</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': 'decend',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Appeal due date must be a real date</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid year was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '1',
					'due-date-year': '23'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Appeal due date year must be 4 digits</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '1',
					'due-date-year': 'abc'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Appeal due date year must be a number</a>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Appeal due date year must be a number</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid date was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '29',
					'due-date-month': '2',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Appeal due date must be a real date</a>');
		});

		it('should redirect to the check and confirm page if a valid date was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const monthVariants = ['12', 'December', 'Dec'];
			for (const month of monthVariants) {
				nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });

				const response = await request
					.post(
						`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
					)
					.send({
						'due-date-day': '2',
						'due-date-month': month,
						'due-date-year': '3000'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
				);
			}
		});
	});

	describe('GET /appellant-case/check-your-answers', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should render the 500 error page if required data is not present in the session', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);

			expect(response.statusCode).toBe(500);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should render the check your answers page with the expected content if outcome is "invalid" and required data is present in the session', async () => {
			// post to invalid reason page controller is necessary to set required data in the session
			const invalidReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: [invalidReasonsWithTextIds[0], invalidReasonsWithTextIds[1]],
					[`invalidReason-${invalidReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`invalidReason-${invalidReasonsWithTextIds[1]}`]: [
						'test reason text 1',
						'test reason text 2'
					]
				});

			expect(invalidReasonPostResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Check your answers before confirming your review</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Review outcome</dt><dd class="govuk-summary-list__value"> Invalid</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming this review will inform the relevant parties of the outcome.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});

		it('should render the check your answers page with the expected content if outcome is "incomplete" and required data is present in the session', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			// post to update date page controller is necessary to set updated due date
			const updateDateResponse = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '12',
					'due-date-year': '3000'
				});

			expect(updateDateResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Check your answers before confirming your review</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Review outcome</dt><dd class="govuk-summary-list__value"> Incomplete</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming this review will inform the relevant parties of the outcome.</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/check-your-answers', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/appellant-case-invalid-reasons')
				.reply(200, appellantCaseInvalidReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should send a patch request to the appellant-cases API endpoint and redirect to the appeal details page, if posted outcome was "invalid"', async () => {
			// post to invalid reason page controller is necessary to set required data in the session
			const invalidReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}`)
				.send({
					invalidReason: invalidReasonsWithoutTextIds[0]
				});

			expect(invalidReasonPostResponse.statusCode).toBe(302);

			const mockedAppellantCasesEndpoint = nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'invalid' });

			const response = await request.post(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);

			expect(mockedAppellantCasesEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should send a patch request to the appellant-cases API endpoint and redirect to the appeal details page, if posted outcome was "incomplete"', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithoutTextIds[0]
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const mockedAppellantCasesEndpoint = nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'incomplete' });

			const response = await request.post(
				`${baseUrl}/1${appellantCasePagePath}${checkYourAnswersPagePath}`
			);

			expect(mockedAppellantCasesEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /appellant-case/valid/date', () => {
		it('should render the valid due date page prefilled with the case created date', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Enter valid date for case</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'This is the date all case documentation was received and the appeal was valid.</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="valid-date-day" type="text" value="21" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="valid-date-month" type="text" value="5" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="valid-date-year" type="text" value="2023" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming will inform the relevant parties of the valid date</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/valid/date', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=appellantCase`)
				.reply(200, appealData)
				.persist();
			nock('http://test/').patch(`/appeals/${appealData.appealId}`).reply(200);
			nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'valid' });

			await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: 'valid'
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the valid date page with the expected error message if no date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '',
					'valid-date-month': '',
					'valid-date-year': ''
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the valid date');
		});

		it('should re-render the valid date page with the expected error message if provided date is not in the past', async () => {
			const testCases = [
				{
					description: 'month as number',
					payload: {
						'valid-date-day': '1',
						'valid-date-month': '1',
						'valid-date-year': '3000'
					}
				},
				{
					description: 'month as full name',
					payload: {
						'valid-date-day': '1',
						'valid-date-month': 'January',
						'valid-date-year': '3000'
					}
				},
				{
					description: 'month as abbreviation',
					payload: {
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '3000'
					}
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
					.send(testCase.payload);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot(testCase.description);
				expect(element.innerHTML).toContain('Enter valid date for case</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The valid date must be today or in the past</a>'
				);
			}
		});

		it('should re-render the valid date page with the expected error message if an invalid day was provided', async () => {
			let response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '0',
					'valid-date-month': '1',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			let element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Valid date day must be between 1 and 31</a>');

			response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '32',
					'valid-date-month': '1',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Valid date day must be between 1 and 31</a>');

			response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': 'first',
					'valid-date-month': '1',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date day must be a number</a>');
		});

		describe('should re-render the update date page with the expected error message if an invalid month was provided', () => {
			const testCases = [
				{
					day: '1',
					month: '0',
					year: '3000',
					description: 'month "0"',
					expectedErrorMessageHtml: 'Valid date month must be between 1 and 12</a>'
				},
				{
					day: '1',
					month: '13',
					year: '3000',
					description: 'month "13"',
					expectedErrorMessageHtml: 'Valid date month must be between 1 and 12</a>'
				},
				{
					day: '1',
					month: 'descend',
					year: '3000',
					description: 'month "descend"',
					expectedErrorMessageHtml: 'Valid date must be a real date</a>'
				}
			];
			testCases.forEach(({ day, month, year, description, expectedErrorMessageHtml }) => {
				it(`should re-render the update date page with the expected error message if an invalid ${description} was provided`, async () => {
					const response = await request
						.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
						.send({
							'valid-date-day': day,
							'valid-date-month': month,
							'valid-date-year': year
						});

					expect(response.statusCode).toBe(200);
					const element = parseHtml(response.text);
					expect(element.innerHTML).toMatchSnapshot();

					const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
					expect(unprettifiedErrorSummaryHtml).toContain(expectedErrorMessageHtml);
				});
			});
		});

		it('should re-render the valid date page with the expected error message if an invalid year "23" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '1',
					'valid-date-month': '1',
					'valid-date-year': '23'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date year must be 4 digits</a>');
		});

		it('should re-render the valid date page with the expected error message if an invalid year "abc" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '1',
					'valid-date-month': '1',
					'valid-date-year': 'abc'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date year must be a number</a>');
		});

		it('should re-render the valid date page with the expected error message if an invalid date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '29',
					'valid-date-month': '2',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date must be a real date</a>');
		});

		it('should re-render the valid date page with the expected error message if date was in past but prior to the date the case was received', async () => {
			const cases = [
				{ description: 'numeric month', value: '1' },
				{ description: 'full month name', value: 'January' },
				{ description: 'abbreviated month name', value: 'Jan' }
			];

			for (const caseItem of cases) {
				const response = await request
					.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': caseItem.value,
						'valid-date-year': '2023'
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot(caseItem.description);
				expect(element.innerHTML).toContain('Enter valid date for case</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The valid date must be on or after the date the case was received.</a>'
				);
			}
		});

		it('should redirect to the case details page if a valid date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '22',
					'valid-date-month': '5',
					'valid-date-year': '2023'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /appellant-case/invalid/confirmation', () => {
		it('should render the outcome invalid confirmation page', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${invalidOutcomePagePath}${confirmationPagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal invalid</h1>');
			expect(element.innerHTML).toContain(
				'The appeal has been closed. The relevant parties have been informed.</p>'
			);
			expect(element.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1">Go back to case details</a>'
			);
		});
	});
	describe('GET /appellant-case/add-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it.each([
			[
				'householder',
				APPEAL_TYPE.HOUSEHOLDER,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'full planning',
				APPEAL_TYPE.S78,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'listed building',
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'cas planning',
				APPEAL_TYPE.CAS_PLANNING,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'cas advertisement',
				APPEAL_TYPE.CAS_ADVERTISEMENT,
				'Upload evidence of your agreement to change the description of the advertisement</h1>'
			],
			[
				'advertisement',
				APPEAL_TYPE.ADVERTISEMENT,
				'Upload evidence of your agreement to change the description of the advertisement</h1>'
			]
		])(
			'should render a document upload page with a file upload component, and no late entry tag and associated details component, and no additional documents warning text, if the folder is changedDescription with correct text for %s',
			async (_, appealType, expectedText) => {
				nock.cleanAll(); // need to remove the nocks so we can change the appeal type
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, { ...appealData, appealType: appealType });
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
				nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(expectedText);
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
				expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
				expect(unprettifiedElement.innerHTML).not.toContain(
					'Only upload files to additional documents when no other folder is applicable.'
				);
			}
		);

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with late entry status tag and associated details component, and without additional documents warning text, if the folder is additional documents, and the appellant case validation outcome is valid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});
	});

	describe('GET /appellant-case/add-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a document upload page with a file upload component, and no late entry tag and associated details component, and no additional documents warning text, if the folder is not additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Evidence of your agreement to change the description of development</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with late entry status tag and associated details component, and without additional documents warning text, if the folder is additional documents, and the appellant case validation outcome is valid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render a 500 error page if request body upload-info is in an incorrect format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': ''
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the add document details page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-document-details/2864'
			);
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render a 500 error page if request body upload-info is in an incorrect format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': ''
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should redirect to the add document details page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-document-details/2864/1'
			);
		});
	});

	describe('GET /appellant-case/add-document-details/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is not additional documents or changedDescription', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' })
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Appellant statement documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it.each([
			[
				'householder',
				APPEAL_TYPE.HOUSEHOLDER,
				'Agreement to change the description of development</h1>'
			],
			['full planning', APPEAL_TYPE.S78, 'Agreement to change the description of development</h1>'],
			[
				'listed building',
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				'Agreement to change the description of development</h1>'
			],
			[
				'cas planning',
				APPEAL_TYPE.CAS_PLANNING,
				'Agreement to change the description of development</h1>'
			],
			[
				'cas advertisement',
				APPEAL_TYPE.CAS_ADVERTISEMENT,
				'Agreement to change the description of the advertisement</h1>'
			],
			[
				'advertisement',
				APPEAL_TYPE.ADVERTISEMENT,
				'Agreement to change the description of the advertisement</h1>'
			]
		])(
			'should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is changedDescription and appeal type is %s',
			async (_, appealType, expectedText) => {
				nock.cleanAll(); // need to remove the nocks so we can change the appeal type
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, { ...appealData, appealType: appealType })
					.persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get('/appeals/1/document-folders/1')
					.reply(200, { ...documentFolderInfo, path: 'appellant-case/changedDescription' })
					.persist();

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(expectedText);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			}
		);

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and with a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of valid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
		});
	});

	describe('POST /appellant-case/add-document-details/:folderId/', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/')
				.patch('/appeals/1/documents')
				.reply(200, {
					documents: [
						{
							id: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: '2023-02-01',
							redactionStatus: 2
						}
					]
				});

			addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the document details page with the expected error message if the request body is in an incorrect format', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem with the service</a>');
		});

		it('should re-render the document details page with the expected error message if receivedDate day is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a day</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: 'a',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '0',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is greater than 31', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '32',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a month</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: 'a',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '0',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is greater than 12', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '13',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: ''
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a year</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: 'a'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date year must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate is not a valid date', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '29',
								month: '2',
								year: '2023'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should send a patch request to the appeal documents endpoint and redirect to the check your answers page, if complete and valid document details were provided', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-documents/2864/check-your-answers'
			);
		});
	});

	describe('GET /appellant-case/add-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' })
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is not additional documents or changed description', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated appellant statement document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and with a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of valid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
		});
	});

	describe('POST /appellant-case/add-document-details/:folderId/:documentId', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.patch('/appeals/1/documents')
				.reply(200, {
					documents: [
						{
							id: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: '2023-02-01',
							redactionStatus: 2
						}
					]
				});

			addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the document details page with the expected error message if the request body is in an incorrect format', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem with the service</a>');
		});

		it('should re-render the document details page with the expected error message if receivedDate day is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a day</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: 'a',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '0',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is greater than 31', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '32',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a month</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: 'a',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '0',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is greater than 12', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '13',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: ''
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a year</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: 'a'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date year must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate is not a valid date', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '29',
								month: '2',
								year: '2023'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should send a patch request to the appeal documents endpoint and redirect to the check your answers page, if complete and valid document details were provided', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: {
								day: '1',
								month: '2',
								year: '2023'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-documents/1/1/check-your-answers'
			);
		});
	});

	describe('GET /appellant-case/add-documents/:folderId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents check and confirm page with summary list displaying info on the uploaded document', async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-documents/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-document-details/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should send an API request to create a new document and redirect to the appellant case page', async () => {
			const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents').reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
			expect(mockDocumentsEndpoint.isDone()).toBe(true);
		});

		it('should display a "document added" notification banner on the appellant case page after a document was uploaded', async () => {
			nock('http://test/').post('/appeals/1/documents').reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: notificationBannerElement,
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Success</h3>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence added</p>'
			);
		});
	});

	describe('GET /appellant-case/add-documents/:folderId/:documentId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents check and confirm page with summary list row displaying info on the uploaded document', async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-documents/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-document-details/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/:documentId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should send an API request to update the document, redirect to the appellant case page, and display a "Document updated" notification banner', async () => {
			const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents/1').reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);
			expect(checkYourAnswersResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
			expect(mockDocumentsEndpoint.isDone()).toBe(true);

			const appellantCaseResponse = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

			expect(appellantCaseResponse.statusCode).toBe(200);

			const notificationBannerElementHTML = parseHtml(appellantCaseResponse.text, {
				rootElement: notificationBannerElement
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Success</h3>');
			expect(notificationBannerElementHTML).toContain(
				'Agreement to change description evidence updated</p>'
			);
		});
	});

	describe('GET /appellant-case/manage-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			nock('http://test/')
				.get('/appeals/1?include=appealType')
				.reply(200, { appealType: APPEAL_TYPE.HOUSEHOLDER })
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/99/`
			);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the manage documents listing page with one document item for each document present in the folder, if the folderId is valid', async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' });

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Appellant statement documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Actions</th>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFolderInfo.pdf</span>');
			expect(unprettifiedElement.innerHTML).toContain('sample-20s-documentFolderInfo.mp4</span>');
			expect(unprettifiedElement.innerHTML).toContain('ph0-documentFolderInfo.jpeg</span>');
			expect(unprettifiedElement.innerHTML).toContain('ph1-documentFolderInfo.jpeg</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/1/appellant-case/add-documents/${documentFolderInfo.folderId}" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
			);
		});

		it('should render the manage documents listing page with the expected heading, if the folderId is valid, and the folder is additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/2')
				.reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/2/`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
		});

		it.each([
			[
				'householder',
				APPEAL_TYPE.HOUSEHOLDER,
				'Agreement to change the description of development</h1>'
			],
			['full planning', APPEAL_TYPE.S78, 'Agreement to change the description of development</h1>'],
			[
				'listed building',
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				'Agreement to change the description of development</h1>'
			],
			[
				'cas planning',
				APPEAL_TYPE.CAS_PLANNING,
				'Agreement to change the description of development</h1>'
			],
			[
				'cas advertisement',
				APPEAL_TYPE.CAS_ADVERTISEMENT,
				'Agreement to change the description of the advertisement</h1>'
			],
			[
				'advertisement',
				APPEAL_TYPE.ADVERTISEMENT,
				'Agreement to change the description of the advertisement</h1>'
			]
		])(
			'should render the manage documents listing page with the expected heading, if the folderId is valid, and the folder is changed description for appeal type %s',
			async (_, appealType, expectedText) => {
				nock.cleanAll(); // need to remove the nocks so we can change the appeal type
				// @ts-ignore
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/')
					.get('/appeals/1?include=appealType')
					.reply(200, { appealType: appealType })
					.persist();
				nock('http://test/').get('/appeals/1/document-folders/3').reply(200, documentFolderInfo);

				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}/manage-documents/3/`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(expectedText);
			}
		);
	});

	describe('GET /appellant-case/manage-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo).persist();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/99/1`
			);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render a 404 error page if the documentId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/99`
			);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).toContain('Version</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Document versions</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Version history</span>');
			expect(unprettifiedElement.innerHTML).toContain('Version</th>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Activity</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action</th>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned"', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoNotChecked);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected"', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoVirusFound);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('class="govuk-error-summary"');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'The selected file contains a virus. Upload a different version.</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload a new version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Remove current version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned"', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoChecked);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload a new version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Remove current version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus scanning</strong>');
		});

		it('should render the manage individual document page without late entry tag in the date received row if the latest version of the document is not marked as late entry', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).not.toContain('Late entry</strong>');
		});

		it('should render the manage individual document page with late entry tag in the date received row if the latest version of the document is marked as late entry, and a document history item for each version, with late entry tag in the history item document name column for versions marked as late entry', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileMultipleVersionsInfoWithLatestAsLateEntry);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Late entry</strong>');
		});
	});

	describe('GET /appellant-case/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get('/appeals/1/document-folders/1').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		it('should render the delete document page with the expected content when there is a single document version', async () => {
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfoChecked);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1/1/delete`
			);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span> Removing the only version of a document will delete the document from the case</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="no">'
			);
		});

		it('should render the delete document page with the expected content when there are multiple document versions', async () => {
			const multipleVersionsDocument = structuredClone(documentFileVersionsInfoChecked);
			multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, multipleVersionsDocument);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1/1/delete`
			);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span> Removing the only version of a document will delete the document from the case</strong>'
			);
		});
	});
	describe('change LPA page', () => {
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

		beforeEach(() => {
			nock('http://test/').get('/appeals/local-planning-authorities').reply(200, lpaList);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});
		afterEach(teardown);
		describe('GET /appellant-case/change-appeal-details/local-planning-authority', () => {
			it('should render the local planning authority page', async () => {
				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}/change-appeal-details/local-planning-authority`
				);

				const element = parseHtml(response.text);

				expect(response.text).toContain(
					`<a href="${baseUrl}/1${appellantCasePagePath}" class="govuk-back-link">Back</a>`
				);
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

		describe('POST /appellant-case/change-appeal-details/local-planning-authority', () => {
			beforeEach(() => {
				nock('http://test/').post('/appeals/1/lpa').reply(200, { success: true });
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should redirect to correct url when lpa field is populated and valid', async () => {
				const response = await request
					.post(
						`${baseUrl}/1${appellantCasePagePath}/change-appeal-details/local-planning-authority`
					)
					.send({ localPlanningAuthority: 2 });

				expect(response.text).toEqual(`Found. Redirecting to ${baseUrl}/1${appellantCasePagePath}`);
				expect(response.statusCode).toBe(302);
			});

			it('should re-render the page with an error message if required field is missing', async () => {
				const response = await request
					.post(
						`${baseUrl}/1${appellantCasePagePath}/change-appeal-details/local-planning-authority`
					)
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
});
