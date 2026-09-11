// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { AddressSection } from '../../page_objects/addressSection';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeQuestionPage } from '../../page_objects/dateTimeQuestionPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { EstimatedDaysSection } from '../../page_objects/estimatedDaysSection';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import {
	APPLICATION_DECISIONS,
	BANNER_TYPES,
	DEFAULT_OVERVIEW_DETAILS
} from '../../support/consts';
import { happyPathHelper } from '../../support/happyPathHelper';
import { changeAppealProcedureTypeTimetableItems } from '../../support/timetables';
import { formatDateAndTime, getDateAndTimeValues } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();
const overviewSectionPage = new OverviewSectionPage();
const caseHistoryPage = new CaseHistoryPage();
const cyaSection = new CYASection();
const estimatedDaysSection = new EstimatedDaysSection();
const addressSection = new AddressSection();
const dateTimeQuestionPage = new DateTimeQuestionPage();
const currentDate = new Date();
const inquiryAddress = {
	line1: 'e2e Inquiry Test Address',
	line2: 'Inquiry Street',
	town: 'Inquiry Town',
	county: 'Somewhere',
	postcode: 'BS20 1BS'
};
const emptyAddress = {
	line1: '',
	line2: '',
	town: '',
	county: '',
	postcode: ''
};
const defaultEventDateTime = {
	day: '',
	month: '',
	year: '',
	hours: '10',
	minutes: '0'
};

describe('Change appeal procedure type - Expedited', () => {
	let caseObj;
	let appeal;

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

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('should change appeal procedure type from Part 1 to Written representations in LPAQ stage', () => {
		const procedureTypeCaption = (ref) => `Appeal ${ref} - update appeal procedure`;

		setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
			happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('Written representations (Part 1)');
			procedureTypePage.clickButtonByText('Start case');

			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			overviewSectionPage.verifyCaseOverviewDetails(
				{
					...DEFAULT_OVERVIEW_DETAILS,
					relatedAppeals: 'No',
					appealProcedure: 'Written representations (Part 1)'
				},
				false
			);

			overviewSectionPage.clickRowChangeLink('case-procedure');
			procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
			procedureTypePage.verifyDisplayedProcedureTypes([
				{ name: 'written', visible: true },
				{ name: 'hearing', visible: true },
				{ name: 'inquiry', visible: true }
			]);

			procedureTypePage.selectProcedureType('Written representations');

			cy.get('#lpa-questionnaire-due-date-day').should('not.exist');

			cy.loadAppealDetails(caseObj).then((appealDetails) => {
				const startDate = new Date(appealDetails.startedAt);

				cy.getBusinessActualDate(startDate, 25).then((statementsAndIpDate) => {
					cy.getBusinessActualDate(startDate, 35).then((finalCommentsDate) => {
						const lpaStatementDueDate = statementsAndIpDate;
						const ipCommentsDueDate = statementsAndIpDate;
						const finalCommentsDueDate = finalCommentsDate;

						dateTimeSection.verifyPrepopulatedTimeTableDueDates(
							'lpaStatementDueDate',
							getDateAndTimeValues(lpaStatementDueDate)
						);
						dateTimeSection.verifyPrepopulatedTimeTableDueDates(
							'ipCommentsDueDate',
							getDateAndTimeValues(ipCommentsDueDate)
						);
						dateTimeSection.verifyPrepopulatedTimeTableDueDates(
							'finalCommentsDueDate',
							getDateAndTimeValues(finalCommentsDueDate)
						);

						dateTimeSection.clickButtonByText('Continue');

						cyaSection.verifyCheckYourAnswers('Appeal procedure', 'Written representations');
						cy.contains('dt.govuk-summary-list__key', 'LPA questionnaire due').should('not.exist');
						cyaSection.verifyCheckYourAnswers(
							'Statements due',
							formatDateAndTime(lpaStatementDueDate).date
						);
						cyaSection.verifyCheckYourAnswers(
							'Interested party comments due',
							formatDateAndTime(ipCommentsDueDate).date
						);
						cyaSection.verifyCheckYourAnswers(
							'Final comments due',
							formatDateAndTime(finalCommentsDueDate).date
						);

						cy.contains(
							'p',
							"We’ll send an email to the appellant and LPA to tell them that we've changed the procedure."
						).should('be.visible');

						caseDetailsPage.clickButtonByText('Update appeal procedure');

						caseDetailsPage.validateBannerMessage(BANNER_TYPES.success, 'Appeal procedure updated');

						overviewSectionPage.verifyCaseOverviewDetails(
							{
								...DEFAULT_OVERVIEW_DETAILS,
								relatedAppeals: 'No',
								appealProcedure: 'Written representations (Part 2)'
							},
							false
						);

						caseDetailsPage.clickViewCaseHistory();
						cy.location('pathname').should('include', '/audit');
						caseHistoryPage.verifyCaseHistoryValue(
							'Appeal procedure updated to written representations'
						);
					});
				});
			});
		});
	});

	it('should change appeal procedure type from Part 1 to Hearing in LPAQ stage', () => {
		const procedureTypeCaption = (ref) => `Appeal ${ref} - update appeal procedure`;

		setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
			happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('Written representations (Part 1)');
			procedureTypePage.clickButtonByText('Start case');

			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			overviewSectionPage.verifyCaseOverviewDetails(
				{
					...DEFAULT_OVERVIEW_DETAILS,
					relatedAppeals: 'No',
					appealProcedure: 'Written representations (Part 1)'
				},
				false
			);

			overviewSectionPage.clickRowChangeLink('case-procedure');
			procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
			procedureTypePage.verifyDisplayedProcedureTypes([
				{ name: 'written', visible: true },
				{ name: 'hearing', visible: true },
				{ name: 'inquiry', visible: true }
			]);

			procedureTypePage.selectProcedureType('Hearing');
			dateTimeQuestionPage.selectDateTimeOption('Yes');
			dateTimeQuestionPage.clickButtonByText('Continue');

			cy.getBusinessActualDate(currentDate, 1).then((date) => {
				dateTimeSection.enterEventDate(date);
				dateTimeSection.clickButtonByText('Continue');
			});

			cy.get('#lpa-questionnaire-due-date-day').should('not.exist');

			cy.loadAppealDetails(caseObj).then((appealDetails) => {
				const startDate = new Date(appealDetails.startedAt);

				cy.getBusinessActualDate(startDate, 25).then((statementsAndIpDate) => {
					const lpaStatementDueDate = statementsAndIpDate;
					const ipCommentsDueDate = statementsAndIpDate;

					dateTimeSection.verifyPrepopulatedTimeTableDueDates(
						'lpaStatementDueDate',
						getDateAndTimeValues(lpaStatementDueDate)
					);
					dateTimeSection.verifyPrepopulatedTimeTableDueDates(
						'ipCommentsDueDate',
						getDateAndTimeValues(ipCommentsDueDate)
					);

					dateTimeSection.clickButtonByText('Continue');

					cyaSection.verifyCheckYourAnswers('Appeal procedure', 'Hearing');
					cy.contains('dt.govuk-summary-list__key', 'LPA questionnaire due').should('not.exist');
					cyaSection.verifyCheckYourAnswers(
						'Statements due',
						formatDateAndTime(lpaStatementDueDate).date
					);
					cyaSection.verifyCheckYourAnswers(
						'Interested party comments due',
						formatDateAndTime(ipCommentsDueDate).date
					);

					cy.contains(
						'p',
						"We’ll send an email to the appellant and LPA to tell them that we've changed the procedure."
					).should('be.visible');

					caseDetailsPage.clickButtonByText('Update appeal procedure');

					caseDetailsPage.validateBannerMessage(BANNER_TYPES.success, 'Appeal procedure updated');

					overviewSectionPage.verifyCaseOverviewDetails(
						{
							...DEFAULT_OVERVIEW_DETAILS,
							relatedAppeals: 'No',
							appealProcedure: 'Hearing'
						},
						false
					);

					caseDetailsPage.clickViewCaseHistory();
					cy.location('pathname').should('include', '/audit');
					caseHistoryPage.verifyCaseHistoryValue('Appeal procedure updated to hearing');
				});
			});
		});
	});

	it.only('should change appeal procedure type from Part 1 to Inquiry in LPAQ stage', () => {
		const procedureTypeCaption = (ref) => `Appeal ${ref} - update appeal procedure`;

		setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
			happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('Written representations (Part 1)');
			procedureTypePage.clickButtonByText('Start case');

			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			overviewSectionPage.verifyCaseOverviewDetails(
				{
					...DEFAULT_OVERVIEW_DETAILS,
					relatedAppeals: 'No',
					appealProcedure: 'Written representations (Part 1)'
				},
				false
			);

			overviewSectionPage.clickRowChangeLink('case-procedure');
			procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
			procedureTypePage.verifyDisplayedProcedureTypes([
				{ name: 'written', visible: true },
				{ name: 'hearing', visible: true },
				{ name: 'inquiry', visible: true }
			]);

			procedureTypePage.selectProcedureType('Inquiry');

			// enter inquiry date
			cy.getBusinessActualDate(currentDate, 1).then((date) => {
				// verify prepopulated values
				dateTimeSection.verifyPrepopulatedEventValues(defaultEventDateTime);
				dateTimeSection.enterEventDate(date);
				dateTimeSection.clickButtonByText('Continue');

				// verify estimated days is not prepopulated and enter estimated days
				estimatedDaysSection.selectEstimatedDaysOption('Yes');
				estimatedDaysSection.verifyPrepopulatedValue('', true);
				estimatedDaysSection.enterEstimatedDays(6);
				estimatedDaysSection.clickButtonByText('Continue');

				// verify address is not prepopulated and enter address
				addressSection.selectAddressOption('Yes');
				addressSection.clickButtonByText('Continue');

				addressSection.verifyPrepopulatedValues(emptyAddress);
				addressSection.enterAddress(inquiryAddress);
				addressSection.clickButtonByText('Continue');

				// verify previous date values are prepopulated for timetable
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
					const startDate = new Date(appealDetails.startedAt);
					cy.getBusinessActualDate(startDate, 25).then((statementsAndIpDate) => {
						const lpaStatementDueDate = statementsAndIpDate;
						const ipCommentsDueDate = statementsAndIpDate;
						dateTimeSection.verifyPrepopulatedTimeTableDueDates(
							'lpaStatementDueDate',
							getDateAndTimeValues(lpaStatementDueDate)
						);
						dateTimeSection.verifyPrepopulatedTimeTableDueDates(
							'ipCommentsDueDate',
							getDateAndTimeValues(ipCommentsDueDate)
						);

						// enter statement of common ground, POE and case management date, ensure is business day
						cy.getBusinessActualDate(ipCommentsDueDate, 10).then((date) => {
							const proofOfEvidenceDate = date;
							dateTimeSection.enterDueDates(
								changeAppealProcedureTypeTimetableItems.slice(1),
								proofOfEvidenceDate,
								0
							);

							// proceed to cya page and check answers
							dateTimeSection.clickButtonByText('Continue');

							cyaSection.verifyCheckYourAnswers('Appeal procedure', 'Inquiry');
							cy.contains('dt.govuk-summary-list__key', 'LPA questionnaire due').should(
								'not.exist'
							);
							cyaSection.verifyCheckYourAnswers(
								'Statements due',
								formatDateAndTime(lpaStatementDueDate).date
							);
							cyaSection.verifyCheckYourAnswers(
								'Statement of common ground due',
								formatDateAndTime(proofOfEvidenceDate).date
							);
							cyaSection.verifyCheckYourAnswers(
								'Proof of evidence and witnesses due',
								formatDateAndTime(proofOfEvidenceDate).date
							);
							cyaSection.verifyCheckYourAnswers(
								'Case management conference due',
								formatDateAndTime(proofOfEvidenceDate).date
							);

							caseDetailsPage.clickButtonByText('Update appeal procedure');
							overviewSectionPage.verifyCaseOverviewDetails(
								{
									...DEFAULT_OVERVIEW_DETAILS,
									relatedAppeals: 'No',
									appealProcedure: 'Inquiry'
								},
								false
							);
							caseDetailsPage.clickViewCaseHistory();
							caseHistoryPage.verifyCaseHistoryValue('Appeal procedure updated to inquiry');
						});
					});
				});
			});
		});
	});
});
