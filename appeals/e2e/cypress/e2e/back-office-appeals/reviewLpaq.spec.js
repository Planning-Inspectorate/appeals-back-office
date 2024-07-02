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

	it('Complete LPAQ', () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef).then(() => {
				cy.visit(urlPaths.appealsList);
				appealsListPage.clickAppealByRef(caseRef);
				appealsListPage.clickReviewLpaq();
				appealsListPage.selectRadioButtonByValue('Complete');
				appealsListPage.clickButtonByText('Confirm');
				appealsListPage.clickLinkByText('Go back to case details');
				const status = 'Complete';
				const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
				appealsListPage.verifyTableCellText(testData);
			});
		});
	});

	it('incomplete LPAQ', () => {
		let date = new Date(2024, 11, 19); // TODO Should this stay static or be dynamically calculated?

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef).then(() => {
				cy.visit(urlPaths.appealsList);
				appealsListPage.clickAppealByRef(caseRef);
				appealsListPage.clickReviewLpaq();
				appealsListPage.selectRadioButtonByValue('Incomplete');
				appealsListPage.clickButtonByText('Confirm');
				appealsListPage.chooseCheckboxByIndex(1);
				appealsListPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 1);
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
	});

	it('incomplete LPAQ add another', () => {
		let date = new Date(2024, 11, 19); // TODO Should this stay static or be dynamically calculated?

		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef).then(() => {
				cy.visit(urlPaths.appealsList);
				appealsListPage.clickAppealByRef(caseRef);
				appealsListPage.clickReviewLpaq();
				appealsListPage.selectRadioButtonByValue('Incomplete');
				appealsListPage.clickButtonByText('Confirm');
				appealsListPage.chooseCheckboxByIndex(1);
				appealsListPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 1);
				appealsListPage.addAnotherButtonLpaq();
				appealsListPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 2);
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
	});
});
