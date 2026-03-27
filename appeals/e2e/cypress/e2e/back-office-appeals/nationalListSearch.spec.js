// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';
import { urlPaths } from '../../support/urlPaths';

const listCasesPage = new ListCasesPage();

describe('All cases search', () => {
	let caseObj;
	const fieldId = 'searchTerm';
	const postcode = 'XX12 3XX';
	const errorMessage =
		'Appeal reference, planning application or enforcement reference, or postcode must be between 2 and 50 characters';

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		cy.visit(urlPaths.appealsList);
	});

	let appeal;

	after(() => {
		cy.deleteAppeals(appeal);
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

	it('check Part 1 filter visible', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			cy.assignCaseOfficerViaApi(caseObj);
			cy.validateAppeal(caseObj);
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.startCaseWithProcedureType(caseObj, 'Part 1');
			const testData = { rowIndex: 0, cellIndex: 0, textToMatch: caseObj.reference, strict: true };
			cy.visit(urlPaths.appealsList);
			listCasesPage.filterByAppealProcedure('Part 1');
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('should not show case under Part 1 filter if case type is Y', () => {
		cy.createCase({ caseType: 'Y' }).then((caseObj) => {
			appeal = caseObj;
			cy.visit(urlPaths.appealsList);
			listCasesPage.filterByAppealProcedure('Part 1');
			cy.contains(caseObj.reference).should('not.exist');
		});
	});

	const setupTestCase = () => {
		cy.createCase({ siteAddressPostcode: postcode }).then((ref) => {
			caseObj = ref;
			appeal = caseObj;
		});
	};

	const verify = (message) => {
		listCasesPage.checkErrorMessageDisplays(message);
		listCasesPage.verifyInlineErrorMessage(`${fieldId}-error`);
		listCasesPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(fieldId, 'id', fieldId);
	};
});
