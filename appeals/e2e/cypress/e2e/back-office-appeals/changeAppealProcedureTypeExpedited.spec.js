// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeQuestionPage } from '../../page_objects/dateTimeQuestionPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import {
	APPLICATION_DECISIONS,
	BANNER_TYPES,
	DEFAULT_OVERVIEW_DETAILS
} from '../../support/consts';
import { happyPathHelper } from '../../support/happyPathHelper';
import { formatDateAndTime, getDateAndTimeValues } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();
const overviewSectionPage = new OverviewSectionPage();
const caseHistoryPage = new CaseHistoryPage();
const cyaSection = new CYASection();
const dateTimeQuestionPage = new DateTimeQuestionPage();
const currentDate = new Date();

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
			procedureTypePage.verifyProcedureTypeOptionVisible('written');

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

	it('should change appeal procedure type from Part 1 to Hearing representations in LPAQ stage', () => {
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
			procedureTypePage.verifyProcedureTypeOptionVisible('hearing');

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

	it('should change appeal procedure type from Part 1 to Written representations in Event stage', () => {
		const procedureTypeCaption = (ref) => `Appeal ${ref} - update appeal procedure`;

		setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
			happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('Written representations (Part 1)');
			procedureTypePage.clickButtonByText('Start case');

			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewS78Lpaq(caseObj);

			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);
			overviewSectionPage.verifyCaseOverviewDetails(
				{
					...DEFAULT_OVERVIEW_DETAILS,
					appealProcedure: 'Written representations (Part 1)'
				},
				false
			);

			overviewSectionPage.clickRowChangeLink('case-procedure');
			procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
			procedureTypePage.verifyProcedureTypeOptionVisible('written');

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

						caseDetailsPage.clickButtonByText('Update appeal procedure');
						caseDetailsPage.validateBannerMessage(BANNER_TYPES.success, 'Appeal procedure updated');

						caseDetailsPage.checkStatusOfCase('Statements', 0);
						overviewSectionPage.verifyCaseOverviewDetails(
							{
								...DEFAULT_OVERVIEW_DETAILS,
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

	it('should change appeal procedure type from Part 1 to Written representations in Awaiting Event stage (deleting site visit)', () => {
		const procedureTypeCaption = (ref) => `Appeal ${ref} - update appeal procedure`;

		setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
			happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('Written representations (Part 1)');
			procedureTypePage.clickButtonByText('Start case');

			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewS78Lpaq(caseObj);

			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);
			happyPathHelper.setupSiteVisitFromBanner(caseObj);

			caseDetailsPage.checkStatusOfCase('Awaiting site visit', 0);
			overviewSectionPage.verifyCaseOverviewDetails(
				{
					...DEFAULT_OVERVIEW_DETAILS,
					appealProcedure: 'Written representations (Part 1)'
				},
				false
			);

			overviewSectionPage.clickRowChangeLink('case-procedure');
			procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
			procedureTypePage.verifyProcedureTypeOptionVisible('written');

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

						caseDetailsPage.clickButtonByText('Update appeal procedure');
						caseDetailsPage.validateBannerMessage(BANNER_TYPES.success, 'Appeal procedure updated');

						caseDetailsPage.checkStatusOfCase('Statements', 0);
						caseDetailsPage.elements.siteVisitBanner().should('not.exist');
						overviewSectionPage.verifyCaseOverviewDetails(
							{
								...DEFAULT_OVERVIEW_DETAILS,
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

	it('should change appeal procedure type from Part 1 to Written representations in Issue Determination stage', () => {
		const procedureTypeCaption = (ref) => `Appeal ${ref} - update appeal procedure`;

		setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
			happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('Written representations (Part 1)');
			procedureTypePage.clickButtonByText('Start case');

			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewS78Lpaq(caseObj);

			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);
			happyPathHelper.setupSiteVisitFromBanner(caseObj);

			caseDetailsPage.checkStatusOfCase('Awaiting site visit', 0);
			cy.simulateSiteVisit(caseObj);

			caseDetailsPage.checkStatusOfCase('Issue decision', 0);
			overviewSectionPage.verifyCaseOverviewDetails(
				{
					...DEFAULT_OVERVIEW_DETAILS,
					appealProcedure: 'Written representations (Part 1)'
				},
				false
			);

			overviewSectionPage.clickRowChangeLink('case-procedure');
			procedureTypePage.verifyHeader(procedureTypeCaption(caseObj.reference));
			procedureTypePage.verifyProcedureTypeOptionVisible('written');

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

						caseDetailsPage.clickButtonByText('Update appeal procedure');
						caseDetailsPage.validateBannerMessage(BANNER_TYPES.success, 'Appeal procedure updated');

						caseDetailsPage.checkStatusOfCase('Statements', 0);
						caseDetailsPage.elements.siteVisitBanner().should('not.exist');
						overviewSectionPage.verifyCaseOverviewDetails(
							{
								...DEFAULT_OVERVIEW_DETAILS,
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
});
