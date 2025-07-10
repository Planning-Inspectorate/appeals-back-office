// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { urlPaths } from '../../support/urlPaths';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { horizonTestAppeals } from '../../support/horizonTestAppeals.js';

const caseDetailsPage = new CaseDetailsPage();

describe('link appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Link an unlinked appeal to an unlinked appeal (from lead)', { tags: tag.smoke }, () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(leadCase);

				//link appeal
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(childCase);
				caseDetailsPage.clickButtonByText('Continue');

				//select lead appeal
				caseDetailsPage.selectRadioButtonByValue(leadCase);
				caseDetailsPage.clickButtonByText('Continue');

				//CYA
				caseDetailsPage.clickButtonByText('Add linked appeal');

				//case details
				caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
				caseDetailsPage.checkStatusOfCase('Lead', 1);
			});
		});
	});

	it('Link an unlinked appeal to an unlinked appeal (from child)', { tags: tag.smoke }, () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(childCase);

				//link appeal
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(leadCase);
				caseDetailsPage.clickButtonByText('Continue');

				//select lead appeal
				caseDetailsPage.selectRadioButtonByValue(leadCase);
				caseDetailsPage.clickButtonByText('Continue');

				//CYA
				caseDetailsPage.clickButtonByText('Add linked appeal');

				//case details
				caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
				caseDetailsPage.checkStatusOfCase('Child', 1);
			});
		});
	});

	it('click on the first linked appeal', () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(leadCase);
				caseDetailsPage.clickAccordionByButton('Overview');

				//link appeal
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(childCase);
				caseDetailsPage.clickButtonByText('Continue');

				//select lead appeal
				caseDetailsPage.selectRadioButtonByValue(leadCase);
				caseDetailsPage.clickButtonByText('Continue');

				//CYA
				caseDetailsPage.clickButtonByText('Add linked appeal');

				//case details
				caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				//child appeal
				caseDetailsPage.clickLinkedAppeal(childCase);
				caseDetailsPage.verifyAppealRefOnCaseDetails(childCase);
			});
		});
	});

	it('As a lead appeal with a child, link another unlinked case', () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase1) => {
				cy.createCase().then((childCase2) => {
					happyPathHelper.assignCaseOfficer(leadCase);
					caseDetailsPage.clickAccordionByButton('Overview');

					//link appeal
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(childCase1);
					caseDetailsPage.clickButtonByText('Continue');

					//select lead appeal
					caseDetailsPage.selectRadioButtonByValue(leadCase);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add linked appeal');

					//CYA
					caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');

					//case details
					caseDetailsPage.checkStatusOfCase('Lead', 1);

					//link appeal
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(childCase2);
					caseDetailsPage.clickButtonByText('Continue');

					//select lead appeal
					caseDetailsPage.selectRadioButtonByValue(leadCase);
					caseDetailsPage.clickButtonByText('Continue');

					//CYA
					caseDetailsPage.clickButtonByText('Add linked appeal');

					//case details
					caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
					caseDetailsPage.elements.linkedAppeal().should('have.length', 2);
				});
			});
		});
	});

	it.only('link a back office appeal to a horizon appeal', () => {
		const horizonAppealId =
			Cypress.config('apiBaseUrl').indexOf('test') > -1
				? horizonTestAppeals.horizonAppealTest
				: horizonTestAppeals.horizonAppealMock;

		cy.createCase().then((leadCase) => {
			happyPathHelper.assignCaseOfficer(leadCase);
			caseDetailsPage.clickAccordionByButton('Overview');

			//link appeal
			caseDetailsPage.clickAddLinkedAppeal();
			caseDetailsPage.fillInput(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');

			//select lead appeal
			caseDetailsPage.selectRadioButtonByValue(leadCase);
			caseDetailsPage.clickButtonByText('Continue');

			//CYA
			caseDetailsPage.clickButtonByText('Add linked appeal');
			caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
			caseDetailsPage.checkStatusOfCase('Lead', 1);
		});
	});
});
