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

describe('related appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('relate an unrelated appeal to an unrelated appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('This appeal is now related to ' + caseRef);
			});
		});
	});
	it('relate an unrelated appeal to a related appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				cy.createCase().then((caseRefToLink2) => {
					happyPathHelper.assignCaseOfficer(caseRef);
					caseDetailsPage.clickAccordionByButton('Overview');
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(caseRefToLink);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('This appeal is now related to ' + caseRef);
					//cy.createCase().then((caseRefToLink) => {
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(caseRefToLink2);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('This appeal is now related to ' + caseRef);
				});
			});
		});
	});
});
