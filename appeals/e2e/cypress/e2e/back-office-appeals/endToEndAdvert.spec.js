// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

describe('Progress Advertisment Appeal to Decision', () => {
	const expectedSections = [
		'Overview',
		'Site',
		'Timetable',
		'Documentation',
		'Costs',
		'Contacts',
		'Team',
		'Case management'
	];

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(`Completes a CAS Advert Appeal to decision`, { tags: tag.smoke }, () => {
		cy.createCase({ ...appealsApiRequests.casAdvertsSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('CAS advert');

			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startCase(caseObj);
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

			// Display all expected case detail sections for written cases
			caseDetailsPage.verifyCaseDetailsSection(expectedSections);

			happyPathHelper.reviewLpaq(caseObj);

			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

			happyPathHelper.setupSiteVisitFromBanner(caseObj);
			cy.simulateSiteVisit(caseObj).then((caseObj) => {
				cy.reload();
			});
			caseDetailsPage.clickIssueDecision(caseObj);
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Allowed'));
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
			caseHistoryPage.verifyCaseHistory('completedState', caseObj.reference);
			caseDetailsPage.checkDecisionOutcome('Allowed');
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});

	it(`Completes a Full Advertisment appeal to decision`, { tags: tag.smoke }, () => {
		cy.createCase({ ...appealsApiRequests.advertsSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('Advertisement');

			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startCase(caseObj, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

			// Display all expected case detail sections for written cases
			caseDetailsPage.verifyCaseDetailsSection(expectedSections);

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
			caseDetailsPage.clickButtonByText('Share final comments');
			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

			happyPathHelper.setupSiteVisitFromBanner(caseObj);
			cy.simulateSiteVisit(caseObj).then((caseObj) => {
				cy.reload();
			});
			caseDetailsPage.clickIssueDecision(caseObj);
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Allowed'));
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
			caseHistoryPage.verifyCaseHistory('completedState', caseObj.reference);
			caseDetailsPage.checkDecisionOutcome('Allowed');
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});
});
