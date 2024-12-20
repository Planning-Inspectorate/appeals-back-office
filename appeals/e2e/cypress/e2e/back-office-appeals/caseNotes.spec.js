// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { urlPaths } from '../../support/urlPaths.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('add case notes', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('add a case note of more than 300 characters', () => {
		let text = Cypress._.repeat('Here is a case note that is more than 300 characters ', 6);
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickCaseNotes();
			caseDetailsPage.inputCaseNotes(text);
			expect(text).to.have.length(318);
			caseDetailsPage.clickButtonByText('Add case note');
			caseDetailsPage.checkErrorMessageDisplays('Case note must be 300 characters or less');
		});
	});

	it('add a case note of less than 300 characters', () => {
		let text = 'Here is a case note that is less than 300 characters';
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickCaseNotes();
			caseDetailsPage.inputCaseNotes(text);
			expect(text).to.have.length(52);
			caseDetailsPage.clickButtonByText('Add case note');
			caseDetailsPage.clickCaseNotes();
			caseDetailsPage.checkCaseNoteAdded(text);
		});
	});
});
