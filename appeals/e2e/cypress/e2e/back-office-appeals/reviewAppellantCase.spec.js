// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppealsListPage } from '../../page_objects/appealsListPage';
import { UpdateDueDatePage } from '../../page_objects/updateDueDatePage';
const appealsListPage = new AppealsListPage();
const updateDueDatePage = new UpdateDueDatePage();

describe('Appeals feature', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Validate appellant case', () => {
		cy.visit('/appeals-service/all-cases');
		appealsListPage.clickAppealFromList(10);
		appealsListPage.clickReviewAppellantCase(3);
		appealsListPage.selectRadioButtonByValue('Valid');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.validDateDay('10'),
			updateDueDatePage.validDateMonth('6'),
			updateDueDatePage.validDateYear('2024'),
			appealsListPage.clickButtonByText('Submit');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Valid';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('Invalidate appellant case', () => {
		cy.visit('/appeals-service/all-cases');
		appealsListPage.clickAppealFromList(11);
		appealsListPage.clickReviewAppellantCase(3);
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
		cy.visit('/appeals-service/all-cases');
		appealsListPage.clickAppealFromList(12);
		appealsListPage.clickReviewAppellantCase(3);
		appealsListPage.selectRadioButtonByValue('Incomplete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(3);
		appealsListPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterDateDay('30');
		updateDueDatePage.enterDateMonth('12');
		updateDueDatePage.enterDateYear('2024');
		appealsListPage.clickButtonByText('Save and Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Incomplete';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('incomplete appellant case reason: add another', () => {
		cy.visit('/appeals-service/all-cases');
		appealsListPage.clickAppealFromList(15);
		appealsListPage.clickReviewAppellantCase(3);
		appealsListPage.selectRadioButtonByValue('Incomplete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(3);
		appealsListPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.addAnotherButton();
		appealsListPage.fillInput1('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterDateDay('30');
		updateDueDatePage.enterDateMonth('12');
		updateDueDatePage.enterDateYear('2024');
		appealsListPage.clickButtonByText('Save and Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Incomplete';
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});
});
