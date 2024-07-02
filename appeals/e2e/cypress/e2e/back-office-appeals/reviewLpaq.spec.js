// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppealsListPage } from '../../page_objects/appealsListPage';
import { UpdateDueDatePage } from '../../page_objects/updateDueDatePage';
import { urlPaths } from '../../support/urlPaths.js';

const appealsListPage = new AppealsListPage();
const updateDueDatePage = new UpdateDueDatePage();

describe('Appeals feature', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it.only('LPAQ test', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);

			cy.addLpaqSubmissionToCase(caseRef).then(() => {
				page.clickAppealByRef(caseRef);
			});
		});
	});

	it('Complete LPAQ', () => {
		// addLpaqSubmissionToCase

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewLpaq(7);
		appealsListPage.selectRadioButtonByValue('Complete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Complete';
		const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('incomplete LPAQ', () => {
		let date = new Date(2024, 11, 19); // TODO Should this stay static or be dynamically calculated?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewLpaq(7);
		appealsListPage.selectRadioButtonByValue('Incomplete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(1);
		appealsListPage.fillInput1('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterDate(date);
		appealsListPage.clickButtonByText('Save and Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Incomplete';
		const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});

	it('incomplete LPAQ add another', () => {
		let date = new Date(2024, 11, 19); // TODO Should this stay static or be dynamically calculated?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(31); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickReviewLpaq(7);
		appealsListPage.selectRadioButtonByValue('Incomplete');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.chooseCheckboxByIndex(1);
		appealsListPage.fillInput1('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.addAnotherButtonLpaq();
		appealsListPage.fillInput2('Hello here is some extra info, have a nice day 7384_+!£ =');
		appealsListPage.clickButtonByText('Continue');
		updateDueDatePage.enterDate(date);
		appealsListPage.clickButtonByText('Save and Continue');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		const status = 'Incomplete';
		const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
		appealsListPage.verifyTableCellText(testData);
	});
});
