// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Issue Decision', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const issueDecisionCompleteStatus = ['Allowed', 'Dismissed', 'Split Decision'];

	let sampleFiles = caseDetailsPage.sampleFiles;

	issueDecisionCompleteStatus.forEach((issueDecision, index) => {
		it(`Change to ${issueDecision} type`, { tags: tag.smoke }, () => {
			let today = new Date();

			cy.createCase().then((caseRef) => {
				cy.addLpaqSubmissionToCase(caseRef);
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				happyPathHelper.reviewLpaq(caseRef);
				happyPathHelper.setupSiteVisitFromBanner(caseRef);
				cy.simulateSiteVisit(caseRef).then((caseRef) => {
					cy.reload();
				});
				caseDetailsPage.clickIssueDecision(caseRef);
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(issueDecision));
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadSampleFile(sampleFiles.pdf);
				caseDetailsPage.clickButtonByText('Continue');
				dateTimeSection.enterDecisionLetterDate(today);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectCheckbox();
				caseDetailsPage.clickButtonByText('Send Decision');
				caseDetailsPage.checkStatusOfCase('Complete', 0);
				caseDetailsPage.checkDecisionOutcome(issueDecision);
				caseDetailsPage.viewDecisionLetter('View decision letter');
			});
		});
	});
});
