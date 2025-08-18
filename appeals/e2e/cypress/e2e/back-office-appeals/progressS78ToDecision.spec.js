// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistoryPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

describe('Progress S78 to decision', () => {
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

	it(`Completes a S78 appeal to decision`, { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

			// Display all expected case detail sections for written cases
			caseDetailsPage.verifyCaseDetailsSection(expectedSections);

			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.checkStatusOfCase('Statements', 0);

			happyPathHelper.addThirdPartyComment(caseRef, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseRef, false);
			caseDetailsPage.clickBackLink();

			happyPathHelper.addLpaStatement(caseRef);
			cy.simulateStatementsDeadlineElapsed(caseRef);
			cy.reload();

			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkStatusOfCase('Final comments', 0);

			happyPathHelper.addLpaFinalComment(caseRef);
			cy.loadAppealDetails(caseRef).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				happyPathHelper.addAppellantFinalComment(caseRef, serviceUserId);
			});
			cy.simulateFinalCommentsDeadlineElapsed(caseRef);
			cy.reload();
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Share final comments');
			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

			happyPathHelper.setupSiteVisitFromBanner(caseRef);
			cy.simulateSiteVisit(caseRef).then((caseRef) => {
				cy.reload();
			});
			caseDetailsPage.clickIssueDecision(caseRef);
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
			caseDetailsPage.checkDecisionOutcome('Allowed');
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickViewCaseHistory();

			caseHistoryPage.verifyCaseHistory('completedState', caseRef);

			//caseDetailsPage.viewDecisionLetter('View decision');
		});
	});
});
