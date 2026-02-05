// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

describe('add case notes', () => {
	let caseObj;
	const maxCharacters = 500;
	const caseNoteText = 'Here is a case note that is more than 500 characters.';
	const invalidCaseNote = caseNoteText.repeat(10).substring(0, maxCharacters + 1);
	const validCaseNote = caseNoteText.repeat(10).substring(0, maxCharacters);

	before(() => {
		cy.createCase().then((ref) => {
			caseObj = ref;
			appeal = caseObj;
			cy.login(users.appeals.caseAdmin);
			cy.assignCaseOfficerViaApi(ref);
			happyPathHelper.viewCaseDetails(ref);
		});
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.clickCaseNotes();
	});

	let appeal;

	after(() => {
		cy.deleteAppeals(appeal);
	});

	it('add a case note of more than 500 characters', () => {
		caseDetailsPage.inputCaseNotes(invalidCaseNote);
		caseDetailsPage.clickButtonByText('Add case note');
		caseDetailsPage.checkErrorMessageDisplays('Case note must be 500 characters or less');
	});

	it('add a case note of less than 500 characters', () => {
		caseDetailsPage.inputCaseNotes(validCaseNote);
		caseDetailsPage.clickButtonByText('Add case note');
		caseDetailsPage.checkCaseNoteAdded(validCaseNote);
	});
});
