// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import {
	APPEAL_PAYLOAD_TYPES,
	APPLICATION_DECISIONS,
	BANNER_TYPES,
	DEFAULT_OVERVIEW_DETAILS,
	PLANNING_APPLICATION_TYPES,
	SUCCESS_MESSAGES
} from '../../support/consts';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();
const overviewSectionPage = new OverviewSectionPage();
const caseHistoryPage = new CaseHistoryPage();

describe('Expedited (part1)) appeals', () => {
	const baseProcedureTypesItems = [
		{ name: 'hearing', visible: true },
		{ name: 'inquiry', visible: true }
	];

	const expectedProcedureTypesExpedited = [
		...baseProcedureTypesItems,
		{ name: 'writtenPart1', visible: true },
		{ name: 'writtenPart2', visible: true }
	];

	const expectedProcedureTypesNonExpedited = [
		...baseProcedureTypesItems,
		{ name: 'written', visible: true },
		{ name: 'writtenPart1', visible: false },
		{ name: 'writtenPart2', visible: false }
	];

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	let caseObj;
	let appeal;
	const appealTypeS78 = 'S78';

	const setupTestCase = ({
		appealType = 'S78FullAppealSubmission',
		caseType = 'W',
		applicationDate = '2026-04-01T00:00:00.000Z',
		applicationDecision = APPLICATION_DECISIONS.GRANTED,
		additionalDocs = []
	} = {}) => {
		const basePayload = appealsApiRequests[appealType].casedata;
		const payload = {
			...basePayload,
			caseType,
			applicationDate,
			applicationDecision,
			planningObligation: true,
			eiaScreeningRequired: true
		};

		cy.writeLog(`** Creating case with payload: ${JSON.stringify(payload)} **`);

		cy.login(users.appeals.caseAdmin);
		return cy
			.createCase(
				{
					...payload
				},
				additionalDocs
			)
			.then((ref) => {
				caseObj = ref;
				appeal = caseObj;
				happyPathHelper.assignCaseOfficer(caseObj);
			});
	};

	const checkAppealDetails = (caseObj, expectedExpedited, typeOfPlanningApplication) => {
		// check whether the appeal is set as expedited in appeal details
		cy.loadAppealDetails(caseObj).then((appealDetails) => {
			cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
			expect(appealDetails?.isS78Expedited).to.equal(expectedExpedited);

			// check the appellant case payload to ensure the isS78Expedited flag is set as expected
			cy.loadAppellantCaseDetails(appealDetails?.appealId, appealDetails?.appellantCaseId).then(
				(appellantCaseDetails) => {
					cy.writeLog(`** appellantCaseDetails ** ${JSON.stringify(appellantCaseDetails)}`);
					expect(appellantCaseDetails?.isS78Expedited).to.equal(expectedExpedited);
					expect(appellantCaseDetails?.typeOfPlanningApplication).to.equal(
						typeOfPlanningApplication
					);
				}
			);
		});
	};

	describe('Appeals valid for expedited process', () => {
		it('S78 appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// start case and check that the procedure type and questionnaire response due date is set correctly
				procedureTypePage.selectProcedureType('Written representations (Part 1)');
				procedureTypePage.clickButtonByText('Start case');

				// check that the case overview details are set correctly, including appeal procedure
				overviewSectionPage.verifyCaseOverviewDetails(
					{
						...DEFAULT_OVERVIEW_DETAILS,
						relatedAppeals: 'No',
						appealProcedure: 'Written representations (Part 1)'
					},
					false
				);

				// check for expected validation banner on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.success, SUCCESS_MESSAGES.appealStarted);

				// Verify Case History
				caseDetailsPage.clickViewCaseHistory();
				caseHistoryPage.verifyCaseHistoryValue(
					'appeal startedappeal procedure: written representations (part 1)'
				);

				// check is set as expedited in appeal details
				checkAppealDetails(caseObj, true, PLANNING_APPLICATION_TYPES.FULL);
			});
		});

		it('S78 outline planning appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({ appealType: APPEAL_PAYLOAD_TYPES.OUTLINE_PLANNING_APPEAL_SUBMISSION }).then(
				() => {
					// approve appellant case as valid and set a due date for the questionnaire response
					happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

					// check for expected validation banners on the case details page
					caseDetailsPage.validateBannerMessage(
						BANNER_TYPES.important,
						SUCCESS_MESSAGES.appealValid
					);
					caseDetailsPage.validateBannerMessage(
						BANNER_TYPES.success,
						SUCCESS_MESSAGES.appealValidated
					);

					// check that part 1 is available as a procedure type option when starting case
					caseDetailsPage.clickReadyToStartCase();
					procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

					// check is set as expedited in appeal details
					checkAppealDetails(caseObj, true, PLANNING_APPLICATION_TYPES.OUTLINE);
				}
			);
		});

		it('S78 reserved matters appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({ appealType: APPEAL_PAYLOAD_TYPES.RESERVED_MATTERS_APPEAL_SUBMISSION }).then(
				() => {
					// approve appellant case as valid and set a due date for the questionnaire response
					happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

					// check for expected validation banners on the case details page
					caseDetailsPage.validateBannerMessage(
						BANNER_TYPES.important,
						SUCCESS_MESSAGES.appealValid
					);
					caseDetailsPage.validateBannerMessage(
						BANNER_TYPES.success,
						SUCCESS_MESSAGES.appealValidated
					);

					// check that part 1 is available as a procedure type option when starting case
					caseDetailsPage.clickReadyToStartCase();
					procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

					// check is set as expedited in appeal details
					checkAppealDetails(caseObj, true, PLANNING_APPLICATION_TYPES.RESERVED_MATTERS);
				}
			);
		});

		it('S78 prior approval appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({
				appealType: APPEAL_PAYLOAD_TYPES.PRIOR_APPROVAL_APPEAL_SUBMISSION,
				applicationDecision: APPLICATION_DECISIONS.REFUSED
			}).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				checkAppealDetails(caseObj, true, PLANNING_APPLICATION_TYPES.PRIOR_APPROVAL);
			});
		});

		it('S78 appeal submitted after 01-04-2026 should be set as expedited', () => {
			setupTestCase({ applicationDate: '2026-04-02T00:00:00.000Z' }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				checkAppealDetails(caseObj, true, PLANNING_APPLICATION_TYPES.FULL);
			});
		});

		it('S78 appeal submitted on 01-04-2026 as refused should be set as expedited', () => {
			setupTestCase({ applicationDecision: APPLICATION_DECISIONS.REFUSED }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				checkAppealDetails(caseObj, true, PLANNING_APPLICATION_TYPES.FULL);
			});
		});
	});

	describe('Appeals not valid for expedited process', () => {
		it('S78 appeal submitted before 01-04-2026 should not be set as expedited', () => {
			setupTestCase({ applicationDate: '2026-03-01T00:00:00.000Z' }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is not available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesNonExpedited);

				// check is set as non-expedited in appeal details
				checkAppealDetails(caseObj, false, PLANNING_APPLICATION_TYPES.FULL);
			});
		});

		it('S78 appeal submitted on 01-04-2026 as not received should not be set as expedited', () => {
			setupTestCase({ applicationDecision: APPLICATION_DECISIONS.NOT_RECEIVED }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is not available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesNonExpedited);

				// check is set as non-expedited in appeal details
				checkAppealDetails(caseObj, false, PLANNING_APPLICATION_TYPES.FULL);
			});
		});

		it('S78 prior approval appeal submitted on 01-04-2026 as not received should not be set as expedited', () => {
			setupTestCase({
				applicationDecision: APPLICATION_DECISIONS.NOT_RECEIVED,
				appealType: APPEAL_PAYLOAD_TYPES.PRIOR_APPROVAL_APPEAL_SUBMISSION
			}).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage(BANNER_TYPES.important, SUCCESS_MESSAGES.appealValid);
				caseDetailsPage.validateBannerMessage(
					BANNER_TYPES.success,
					SUCCESS_MESSAGES.appealValidated
				);

				// check that part 1 is not available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesNonExpedited);

				// check is set as non-expedited in appeal details
				checkAppealDetails(caseObj, false, PLANNING_APPLICATION_TYPES.PRIOR_APPROVAL);
			});
		});
	});
});
