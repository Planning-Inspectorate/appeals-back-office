// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { urlPaths } from '../../support/urlPaths';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('link appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Link an unlinked appeal to an unlinked appeal', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, make this the lead appeal for ');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('This appeal is now a child appeal of');
				caseDetailsPage.checkStatusOfCase('Child', 1);
			});
		});
	});
});
