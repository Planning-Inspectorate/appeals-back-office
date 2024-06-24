// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppealsListPage } from '../../page_objects/appealsListPage';
import { UpdateDueDatePage } from '../../page_objects/updateDueDatePage';
import { urlPaths } from '../../support/url-paths.js';

const appealsListPage = new AppealsListPage();
const updateDueDatePage = new UpdateDueDatePage();

describe('Appeals feature', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Validate appellant case', () => {
		let dueDate = new Date(2024, 5, 10); // TODO Should this stay static or be dynamically calculated?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(10); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewAppellantCase();
		appealsListPage.selectRadioButtonByValue('Valid');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterValidDate(dueDate);
		appealsListPage.clickButtonByText('Submit');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Valid';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('Invalidate appellant case', () => {
		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(11); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewAppellantCase();
		appealsListPage.selectRadioButtonByValue('Invalid');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(1);
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Invalid';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('incomplete appellant case', () => {
		let dueDate = new Date(2024, 11, 30); // TODO Should this stay static or be dynamically calculated?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(12); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewAppellantCase();
		appealsListPage.selectRadioButtonByValue('Incomplete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(3);
		appealsListPage.fillInput1('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterValidDate(dueDate);
		appealsListPage.clickButtonByText('Save and Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Incomplete';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('incomplete appellant case reason: add another', () => {
		let dueDate = new Date(2024, 11, 30); // TODO Should this stay static or be dynamically calculated?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(15); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewAppellantCase();
		appealsListPage.selectRadioButtonByValue('Incomplete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(3);
		appealsListPage.fillInput1('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.addAnotherButton();
		appealsListPage.fillInput2('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterValidDate(dueDate);
		appealsListPage.clickButtonByText('Save and Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Incomplete';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});
});
