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

describe('Review appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Validate appellant case', { tags: tag.smoke }, () => {
		let dueDate = new Date();

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickReviewAppellantCase();
			caseDetailsPage.selectRadioButtonByValue('Valid');
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterValidDate(dueDate);
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Valid';
			const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
			caseDetailsPage.verifyTableCellText(testData);
		});
	});

	it('Invalidate appellant case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickReviewAppellantCase();
			caseDetailsPage.selectRadioButtonByValue('Invalid');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.chooseCheckboxByText('Documents have not been submitted on time');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Invalid';
			const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('incomplete appellant case', { tags: tag.smoke }, () => {
		let dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 28);

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickReviewAppellantCase();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.chooseCheckboxByText("LPA's decision notice is incorrect or incomplete");
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day.', 1);
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDate(dueDate);
			caseDetailsPage.clickButtonByText('Save and Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Incomplete';
			const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
			caseDetailsPage.verifyTableCellText(testData);
		});
	});

	it('incomplete appellant case reason: add another', () => {
		let dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 28);

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickReviewAppellantCase();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.chooseCheckboxByText("LPA's decision notice is incorrect or incomplete");
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day.', 1);
			caseDetailsPage.clickAddAnother();
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day.', 2);
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterDate(dueDate);
			caseDetailsPage.clickButtonByText('Save and Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Incomplete';
			const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
			caseDetailsPage.verifyTableCellText(testData);
		});
	});
});
