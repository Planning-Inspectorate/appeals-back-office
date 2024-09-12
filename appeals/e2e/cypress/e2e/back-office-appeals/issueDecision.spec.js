// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Issue Decision', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const issueDecisionCompleteStatus = ['Allowed', 'Dismissed', 'Split Decision'];

	issueDecisionCompleteStatus.forEach((issueDecision, index) => {
		it(`Change to ${issueDecision} type`, { tags: tag.smoke }, () => {
			let todaysDate = new Date();

			cy.createCase().then((caseRef) => {
				cy.addLpaqSubmissionToCase(caseRef);
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				happyPathHelper.reviewLpaq(caseRef);
				caseDetailsPage.clickIssueDecision(caseRef);
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(issueDecision));
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadOneDocument();
				caseDetailsPage.clickButtonByText('Continue');
				dateTimeSection.enterDecisionLetterDate(todaysDate);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectCheckbox();
				caseDetailsPage.clickButtonByText('Send Decision');
				caseDetailsPage.clickLinkByText('Go back to case details');
			});
		});
	});
});
