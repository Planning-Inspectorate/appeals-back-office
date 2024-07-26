// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { urlPaths } from '../../support/urlPaths';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';

const listCasesPage = new ListCasesPage();
describe('All cases search', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Case admin user should be able to view Search all cases page', { tags: tag.smoke }, () => {
		cy.visit(urlPaths.appealsList);
		listCasesPage.verifySectionHeader('Search all cases');
	});

	it('Case admin user should be able to use search using appeal id', () => {
		cy.createCase().then((caseRef) => {
			const testData = { rowIndex: 0, cellIndex: 0, textToMatch: caseRef, strict: true };
			cy.visit(urlPaths.appealsList);
			listCasesPage.nationalListSearch(caseRef);
			listCasesPage.verifyTableCellText(testData);
			listCasesPage.clearSearchResults();
		});
	});

	it('Case admin user should be able to use search using postcode with spaces', () => {
		const postcode = 'XX12 3XX';
		let requestBody = appealsApiRequests.caseSubmission;
		requestBody.casedata.siteAddressPostcode = postcode;

		cy.createCase(requestBody).then((caseRef) => {
			const testData = { rowIndex: 0, cellIndex: 1, textToMatch: postcode, strict: false };
			cy.visit(urlPaths.appealsList);
			listCasesPage.nationalListSearch(postcode);
			listCasesPage.verifyTableCellText(testData);
			listCasesPage.clearSearchResults();
		});
	});

	it('Case admin user should see error validation if not enough characters are entered', () => {
		cy.visit(urlPaths.appealsList);
		listCasesPage.nationalListSearch('9');
		listCasesPage.validateErrorMessage('Search query must be between 2 and 8 characters');
	});

	it('Case admin user should see error validation if too many characters are entered', () => {
		cy.visit(urlPaths.appealsList);
		listCasesPage.nationalListSearch('999999999');
		listCasesPage.validateErrorMessage('Search query must be between 2 and 8 characters');
	});
});
