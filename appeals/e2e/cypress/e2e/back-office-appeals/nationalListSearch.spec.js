// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { tag } from '../../support/tag';
import { urlPaths } from '../../support/urlPaths';

const listCasesPage = new ListCasesPage();

describe('All cases search', () => {
	let caseObj;
	const fieldId = 'searchTerm';
	const postcode = 'XX12 3XX';
	const errorMessage =
		'Appeal reference, planning application reference or postcode must be between 2 and 50 characters';

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		cy.visit(urlPaths.appealsList);
	});

	it('Case admin user should be able to use search using appeal id', { tags: tag.smoke }, () => {
		const testData = { rowIndex: 0, cellIndex: 0, textToMatch: caseObj.reference, strict: true };
		listCasesPage.verifySectionHeader('Search all cases');
		listCasesPage.nationalListSearch(caseObj.reference);
		listCasesPage.verifyTableCellText(testData);
		listCasesPage.clearSearchResults();
	});

	it(
		'Case admin user should be able to use search using postcode with spaces',
		{ tags: tag.smoke },
		() => {
			const testData = { rowIndex: 0, cellIndex: 2, textToMatch: postcode, strict: false };
			listCasesPage.nationalListSearch(postcode);
			listCasesPage.verifyTableCellText(testData);
			listCasesPage.clearSearchResults();
		}
	);

	it('Case admin user should see error validation if not enough characters are entered', () => {
		listCasesPage.nationalListSearch('9');
		verify(errorMessage);
	});

	it('Case admin user should see error validation if too many characters are entered', () => {
		const searchTerm = '99999999999'.repeat(5).substring(0, 51);
		listCasesPage.nationalListSearch(searchTerm);
		verify(errorMessage);
	});

	const setupTestCase = () => {
		cy.createCase({ siteAddressPostcode: postcode }).then((ref) => {
			caseObj = ref;
		});
	};

	const verify = (message) => {
		listCasesPage.checkErrorMessageDisplays(message);
		listCasesPage.verifyInlineErrorMessage(`${fieldId}-error`);
		listCasesPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(fieldId, 'id', fieldId);
	};
});
