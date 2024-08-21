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

describe('Review LPAQ', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Complete LPAQ', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Complete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickLinkByText('Go back to case details');

			const status = 'Complete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('incomplete LPAQ', { tags: tag.smoke }, () => {
		let futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 28);

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.chooseCheckboxByText('Other documents or information are missing');
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 1);
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDate(futureDate);
			caseDetailsPage.clickButtonByText('Save and Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickLinkByText('Go back to case details');

			const status = 'Incomplete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('incomplete LPAQ add another', { tags: tag.smoke }, () => {
		let futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 28);

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.chooseCheckboxByText('Other documents or information are missing');
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 1);
			caseDetailsPage.clickAddAnother();
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 2);
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDate(futureDate);
			caseDetailsPage.clickButtonByText('Save and Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickLinkByText('Go back to case details');

			const status = 'Incomplete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});
});
