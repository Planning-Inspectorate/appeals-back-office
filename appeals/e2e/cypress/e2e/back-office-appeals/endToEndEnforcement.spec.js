// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

describe('Progress Enforcement Appeal to Decision', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(`Completes an Enforcement Appeal to decision`, () => {
		cy.createCase({ ...appealsApiRequests.enforcementSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('Enforcement notice appeal');

			happyPathHelper.reviewEnforcementAppeallantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startCaseWithProcedureType(caseObj, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);

			happyPathHelper.addThirdPartyComment(caseObj, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseObj, false);
			caseDetailsPage.clickBackLink();

			happyPathHelper.addLpaStatement(caseObj);
			cy.simulateStatementsDeadlineElapsed(caseObj);
			cy.reload();

			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkStatusOfCase('Final comments', 0);

			happyPathHelper.addLpaFinalComment(caseObj);
			cy.loadAppealDetails(caseObj).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
			});
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			cy.reload();
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Share final comment');
			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

			happyPathHelper.setupSiteVisitFromBanner(caseObj);
			cy.simulateSiteVisit(caseObj).then((caseObj) => {
				cy.reload();
			});
			caseDetailsPage.clickIssueDecision(caseObj);
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Notice upheld'));
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.uploadSampleFile(caseDetailsPage.sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue Decision');
			caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
			caseDetailsPage.checkStatusOfCase('Complete', 0);
			caseDetailsPage.checkDecisionOutcome('Notice upheld');
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});

	it(`Completes an Enforcement Listed Building Appeal to decision`, () => {
		cy.createCase({ ...appealsApiRequests.enforcementListedSubmission.casedata }).then(
			(caseObj) => {
				appeal = caseObj;
				cy.addLpaqSubmissionToCase(caseObj);
				happyPathHelper.assignCaseOfficer(caseObj);
				caseDetailsPage.checkStatusOfCase('Validation', 0);

				caseDetailsPage.verifyAppealType(
					'Enforcement listed building and conservation area appeal'
				);

				happyPathHelper.reviewEnforcementAppeallantCase(caseObj);
				caseDetailsPage.checkStatusOfCase('Ready to start', 0);

				happyPathHelper.startCaseWithProcedureType(caseObj, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

				happyPathHelper.reviewS78Lpaq(caseObj);
				caseDetailsPage.checkStatusOfCase('Statements', 0);

				happyPathHelper.addThirdPartyComment(caseObj, true);
				caseDetailsPage.clickBackLink();
				happyPathHelper.addThirdPartyComment(caseObj, false);
				caseDetailsPage.clickBackLink();

				happyPathHelper.addLpaStatement(caseObj);
				cy.simulateStatementsDeadlineElapsed(caseObj);
				cy.reload();

				caseDetailsPage.basePageElements.bannerLink().click();
				caseDetailsPage.clickButtonByText('Share interested party comments and statements');
				caseDetailsPage.checkStatusOfCase('Final comments', 0);

				happyPathHelper.addLpaFinalComment(caseObj);
				cy.loadAppealDetails(caseObj).then((appealData) => {
					const serviceUserId = (
						(appealData?.appellant?.serviceUserId ?? 0) + 200000000
					).toString();
					happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
				});
				cy.simulateFinalCommentsDeadlineElapsed(caseObj);
				cy.reload();
				caseDetailsPage.basePageElements.bannerLink().click();
				caseDetailsPage.clickButtonByText('Share final comment');
				caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

				happyPathHelper.setupSiteVisitFromBanner(caseObj);
				cy.simulateSiteVisit(caseObj).then((caseObj) => {
					cy.reload();
				});
				caseDetailsPage.clickIssueDecision(caseObj);
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Notice upheld'));
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadSampleFile(caseDetailsPage.sampleFiles.pdf);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('No');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('No');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Issue Decision');
				caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
				caseDetailsPage.checkStatusOfCase('Complete', 0);
				caseDetailsPage.checkDecisionOutcome('Notice upheld');
				caseDetailsPage.viewDecisionLetter('View decision');
			}
		);
	});
});
