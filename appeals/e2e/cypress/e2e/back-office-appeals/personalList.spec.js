// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';
import { users } from '../../fixtures/users';
import { PersonalListPage } from '../../page_objects/caseDetails/personalListPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { urlPaths } from '../../support/urlPaths';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();
let caseObj;
const personalListPage = new PersonalListPage();

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});
let appeal;

// afterEach(() => {
// 	cy.deleteAppeals(appeal);
// });

it(`New Reg Appeal Personal list all stages`, () => {
	cy.createCase({
		caseType: 'W'
	}).then((caseObj) => {
		appeal = caseObj;
		cy.addLpaqSubmissionToCase(caseObj);
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.checkStatusOfCase('Assign case officer', 0);
		//Validation
		happyPathHelper.assignCaseOfficer(caseObj);
		caseDetailsPage.checkStatusOfCase('Validation', 0);
		cy.visit(urlPaths.personalListFilteredValidation);
		personalListPage.verifyActionRequiredLink(caseObj.reference, 'Review appellant case');
		personalListPage.verifyDueDate(caseObj.reference, new Date());
		//Ready To Start
		happyPathHelper.reviewAppellantCase(caseObj);
		caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		cy.getBusinessActualDate(new Date(), 5).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredReadyToStart);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Start case');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		happyPathHelper.startCaseWithProcedureType(caseObj, 'written');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
		cy.getBusinessActualDate(new Date(), 5).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredLpaQuestionnaire);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Review LPA questionnaire');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		//Statements
		happyPathHelper.reviewS78Lpaq(caseObj);
		caseDetailsPage.checkStatusOfCase('Statements', 0);
		happyPathHelper.addLpaStatement(caseObj, true);
		cy.simulateStatementsDeadlineElapsed(caseObj);
		cy.reload();
		cy.getBusinessActualDate(new Date(), 25).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredStatement);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Share statements');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});
		//Final Comments
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.shareStatements();
		caseDetailsPage.checkStatusOfCase('Final comments', 0);

		happyPathHelper.addLpaFinalComment(caseObj);
		cy.loadAppealDetails(caseObj).then((appealData) => {
			const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
			happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
		});

		cy.getBusinessActualDate(new Date(), 35).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredFinalComments);
			personalListPage.verifyActionRequiredText(caseObj.reference, 'Awaiting final comments');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		cy.simulateFinalCommentsDeadlineElapsed(caseObj);
		cy.reload();

		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.shareFinalComments();
		caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() - 3);

		cy.visit(urlPaths.personalListFilteredEvent);
		personalListPage.verifyActionRequiredLink(caseObj.reference, 'Set up site visit');
		personalListPage.verifyDueDate(caseObj.reference, dueDate);

		happyPathHelper.viewCaseDetails(caseObj);
		happyPathHelper.setupSiteVisitFromBanner(caseObj);
		cy.visit(urlPaths.personalListFilteredAwaitingEvent);
		personalListPage.verifyActionRequiredText(caseObj.reference, 'Awaiting site visit');
		personalListPage.verifyDueDate(caseObj.reference, happyPathHelper.validVisitDate());

		//Issue Determination
		cy.simulateSiteVisit(caseObj).then((caseObj) => {
			cy.reload();
		});
		cy.getBusinessActualDate(new Date(), 37).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredIssueDetermination);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Issue decision');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});
		caseDetailsPage.checkStatusOfCase('Issue decision', 0);
	});
});

it.only(`Old Reg Appeal Personal list all stages`, () => {
	cy.createCase({ ...appealsApiRequests.enforcementSubmission.casedata }).then((caseObj) => {
		appeal = caseObj;
		cy.addLpaqSubmissionToCase(caseObj);
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.checkStatusOfCase('Assign case officer', 0);

		//Validation
		happyPathHelper.assignCaseOfficer(caseObj);
		caseDetailsPage.checkStatusOfCase('Validation', 0);
		caseDetailsPage.verifyAppealType('Enforcement notice appeal');
		cy.visit(urlPaths.personalListFilteredValidation);
		personalListPage.verifyActionRequiredLink(caseObj.reference, 'Review appellant case');
		personalListPage.verifyDueDate(caseObj.reference, new Date());

		//Ready To Start
		happyPathHelper.reviewEnforcementAppellantCase(caseObj);
		caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		cy.getBusinessActualDate(new Date(), 5).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredReadyToStart);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Start case');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		//LPA Questionnaire
		happyPathHelper.startCaseWithProcedureType(caseObj, 'written');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
		cy.getBusinessActualDate(new Date(), 10).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredLpaQuestionnaire);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Review LPA questionnaire');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		//Statements
		happyPathHelper.reviewS78Lpaq(caseObj);
		caseDetailsPage.checkStatusOfCase('Statements', 0);
		happyPathHelper.addLpaStatement(caseObj);
		cy.simulateStatementsDeadlineElapsed(caseObj);
		cy.reload();
		cy.getBusinessActualDate(new Date(), 30).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredStatement);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Share statements');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		// //Final Comments
		happyPathHelper.viewCaseDetails(caseObj);

		caseDetailsPage.shareStatements();
		caseDetailsPage.checkStatusOfCase('Final comments', 0);
		happyPathHelper.addLpaFinalComment(caseObj);
		cy.loadAppealDetails(caseObj).then((appealData) => {
			const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
			happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
		});
		cy.getBusinessActualDate(new Date(), 45).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredFinalComments);
			personalListPage.verifyActionRequiredText(caseObj.reference, 'Awaiting final comments');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});

		// //Event
		cy.simulateFinalCommentsDeadlineElapsed(caseObj);
		cy.reload();
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.shareFinalComments();
		caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() - 3);
		cy.visit(urlPaths.personalListFilteredEvent);
		personalListPage.verifyActionRequiredLink(caseObj.reference, 'Set up site visit');
		personalListPage.verifyDueDate(caseObj.reference, dueDate);

		//Awaiting Event
		happyPathHelper.viewCaseDetails(caseObj);
		happyPathHelper.setupSiteVisitFromBanner(caseObj);
		cy.visit(urlPaths.personalListFilteredAwaitingEvent);
		personalListPage.verifyActionRequiredText(caseObj.reference, 'Awaiting site visit');
		personalListPage.verifyDueDate(caseObj.reference, happyPathHelper.validVisitDate());

		//Issue Determination
		cy.simulateSiteVisit(caseObj).then(() => {
			cy.reload();
		});
		cy.getBusinessActualDate(new Date(), 37).then((dueDate) => {
			cy.visit(urlPaths.personalListFilteredIssueDetermination);
			personalListPage.verifyActionRequiredLink(caseObj.reference, 'Issue decision');
			personalListPage.verifyDueDate(caseObj.reference, dueDate);
		});
		caseDetailsPage.checkStatusOfCase('Issue decision', 0);
	});
});

it.skip('Display Review CTA for appellant statement on personal list page', () => {
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
		caseObj = ref;
		appeal = caseObj;
		happyPathHelper.viewCaseDetails(caseObj);

		// Assign Case Officer Via API
		cy.assignCaseOfficerViaApi(caseObj);

		// Validate Appeal Via API
		cy.getBusinessActualDate(new Date(), 0).then((date) => {
			cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
		});

		// Start Inquiry Via API
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			cy.addInquiryViaApi(caseObj, inquiryDate);
		});
		cy.reload();
	});
	cy.addLpaqSubmissionToCase(caseObj);
	cy.reviewLpaqSubmission(caseObj);
	cy.addAppellantStatementToCase(caseObj);

	cy.visit(urlPaths.personalListFilteredStatement);
	personalListPage.verifyActionRequiredLink(caseObj.reference, 'Review appellant statement');
});
