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

	it.only('Issue Decision Allowed ', { tags: tag.smoke }, () => {
		let todaysDate = new Date();

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			happyPathHelper.reviewLpaq(caseRef);
			caseDetailsPage.clickIssueDecision(caseRef);
			caseDetailsPage.selectRadioButtonByValue('Allowed');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.uploadOneDocument();
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDecisionLetterDate(todaysDate);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectCheckbox();
			caseDetailsPage.clickButtonByText('Send Decision');
			caseDetailsPage.clickLinkByText('Go back to case details');
			//caseDetailsPage.checkStatusOfCase('Complete', 0);
		});
	});

	it('Issue Decision Dismissed ', { tags: tag.smoke }, () => {
		let todaysDate = new Date();

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			happyPathHelper.reviewLpaq(caseRef);
			caseDetailsPage.clickIssueDecision(caseRef);
			caseDetailsPage.selectRadioButtonByValue('Dismissed');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.uploadOneDocument();
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDecisionLetterDate(todaysDate);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectCheckbox();
			caseDetailsPage.clickButtonByText('Send Decision');
			caseDetailsPage.clickLinkByText('Go back to case details');
			caseDetailsPage.checkStatusOfCase('Complete', 0);
		});
	});

	it('Issue Decision Split Decision ', { tags: tag.smoke }, () => {
		let todaysDate = new Date();

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			happyPathHelper.reviewLpaq(caseRef);
			caseDetailsPage.clickIssueDecision(caseRef);
			caseDetailsPage.selectRadioButtonByValue('Split Decision');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.uploadOneDocument();
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDecisionLetterDate(todaysDate);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectCheckbox();
			caseDetailsPage.clickButtonByText('Send Decision');
			caseDetailsPage.clickLinkByText('Go back to case details');
			caseDetailsPage.checkStatusOfCase('Complete', 0);
		});
	});
});
