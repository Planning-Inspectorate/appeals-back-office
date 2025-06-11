// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { urlPaths } from '../../support/urlPaths';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { horizonTestAppeals } from '../../support/horizonTestAppeals.js';

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
				caseDetailsPage.validateBannerMessage(
					'Success',
					`This appeal is now related to ${caseRefToLink}`
				);
			});
		});
	});
	it('relate an unrelated appeal to a related appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((firstCaseRefToLink) => {
				cy.createCase().then((secondCaseRefToLink) => {
					happyPathHelper.assignCaseOfficer(caseRef);
					caseDetailsPage.clickAccordionByButton('Overview');
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(firstCaseRefToLink);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						`This appeal is now related to ${firstCaseRefToLink}`
					);
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(secondCaseRefToLink);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						`This appeal is now related to ${secondCaseRefToLink}`
					);
				});
			});
		});
	});
	it('relate a BO appeal to a Horizon appeal', () => {
		const horizonAppealId =
			Cypress.config('apiBaseUrl').indexOf('test') > -1
				? horizonTestAppeals.horizonAppealTest
				: horizonTestAppeals.horizonAppealMock;

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Overview');
			caseDetailsPage.clickAddRelatedAppeals();
			caseDetailsPage.fillInput(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage(
				'Success',
				`This appeal is now related to ${horizonAppealId}`
			);
		});
	});
});
