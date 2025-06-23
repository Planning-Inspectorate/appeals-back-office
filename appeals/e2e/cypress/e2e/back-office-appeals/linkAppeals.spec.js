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

	// it('Link an unlinked appeal to an unlinked appeal', { tags: tag.smoke }, () => {
	// 	cy.createCase().then((caseRef) => {
	// 		cy.createCase().then((caseRefToLink) => {
	// 			happyPathHelper.assignCaseOfficer(caseRef);
	// 			caseDetailsPage.clickAccordionByButton('Overview');
	// 			caseDetailsPage.clickAddLinkedAppeal();
	// 			caseDetailsPage.fillInput(caseRefToLink);
	// 			caseDetailsPage.clickButtonByText('Continue');
	// 			caseDetailsPage.selectRadioButtonByValue(caseRef);
	// 			caseDetailsPage.clickButtonByText('Continue');
	// 			caseDetailsPage.clickButtonByText('Add linked appeal');
	// 			caseDetailsPage.validateBannerMessage('Success', 'This appeal is now the lead for appeal ' + caseRefToLink);
	// 			caseDetailsPage.checkStatusOfCase('Child', 1);
	// 		});
	// 	});
	// });

	it('click on the first linked appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Add linked appeal');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'This appeal is now the lead for appeal ' + caseRefToLink
				);
				caseDetailsPage.checkStatusOfCase('Child', 1);
				caseDetailsPage.clickLinkedAppeal(caseRefToLink);
				caseDetailsPage.verifyAppealRefOnCaseDetails(caseRefToLink);
			});
		});
	});

	it.skip('link as a child appeal to a new unlinked appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLinkAsChild) => {
				cy.createCase().then((unlinkedCaseRefToLink) => {
					happyPathHelper.assignCaseOfficer(caseRef);
					caseDetailsPage.clickAccordionByButton('Overview');
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseRefToLinkAsChild);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add linked appeal');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now a child appeal of ' + caseRefToLinkAsChild
					);
					caseDetailsPage.checkStatusOfCase('Child', 1);
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(unlinkedCaseRefToLink);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(unlinkedCaseRefToLink);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add linked appeal');
					caseDetailsPage.verifyWarningText("Link this appeal to your case's lead appeal");
				});
			});
		});
	});

	it.skip('link as a lead appeal to a new unlinked appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLinkAsLead) => {
				cy.createCase().then((unlinkedCaseRefToLink) => {
					happyPathHelper.assignCaseOfficer(caseRef);
					caseDetailsPage.clickAccordionByButton('Overview');
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseRefToLinkAsLead);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add linked appeal');
					caseDetailsPage.validateBannerMessage(
						'This appeal is now a lead appeal of ' + caseRefToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(unlinkedCaseRefToLink);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add linked appeal');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now the lead for appeal ' + caseRef
					);
				});
			});
		});
	});

	it.skip('link as a lead appeal to an existing child appeal', () => {
		cy.createCase().then((caseRefToLinkAsLead) => {
			cy.createCase().then((caseRefToLinkAsChild) => {
				cy.createCase().then((caseRefToLinkAsSecondLead) => {
					cy.createCase().then((caseRefToLinkAsSecondChild) => {
						happyPathHelper.assignCaseOfficer(caseRefToLinkAsChild);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsLead);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.selectRadioButtonByValue(
							'Yes, make this the lead appeal for ' + caseRefToLinkAsChild
						);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.validateBannerMessage(
							'Success',
							'This appeal is now a lead appeal of ' + caseRefToLinkAsChild
						);
						caseDetailsPage.checkStatusOfCase('Child', 1);
						happyPathHelper.assignCaseOfficer(caseRefToLinkAsSecondChild);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsSecondLead);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.selectRadioButtonByValue(
							'Yes, make this the lead appeal for ' + caseRefToLinkAsSecondChild
						);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.validateBannerMessage(
							'Success',
							'This appeal is now a lead appeal of ' + caseRefToLinkAsSecondChild
						);
						caseDetailsPage.checkStatusOfCase('Child', 1);
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsChild);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.verifyWarningText(
							'Appeal already linked to another lead appeal. Cannot be linked.'
						);
					});
				});
			});
		});
	});

	it.skip('link as a lead appeal to an existing lead appeal', () => {
		cy.createCase().then((caseRefToLinkAsLead) => {
			cy.createCase().then((caseRefToLinkAsChild) => {
				cy.createCase().then((caseRefToLinkAsSecondLead) => {
					cy.createCase().then((caseRefToLinkAsSecondChild) => {
						happyPathHelper.assignCaseOfficer(caseRefToLinkAsLead);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsChild);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.selectRadioButtonByValue(
							'Yes, this is a child appeal of ' + caseRefToLinkAsLead
						);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.validateBannerMessage(
							'Success',
							'This appeal is now a lead appeal of ' + caseRefToLinkAsLead
						);
						caseDetailsPage.checkStatusOfCase('Lead', 1);
						happyPathHelper.assignCaseOfficer(caseRefToLinkAsSecondLead);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsSecondChild);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.selectRadioButtonByValue(
							'Yes, this is a child appeal of ' + caseRefToLinkAsSecondLead
						);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.validateBannerMessage(
							'Success',
							'This appeal is now a lead appeal of ' + caseRefToLinkAsLead
						);
						caseDetailsPage.checkStatusOfCase('Lead', 1);
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsLead);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.verifyWarningText('Appeals are both lead appeals and cannot be linked');
					});
				});
			});
		});
	});

	it.skip('link as a child appeal to an existing child appeal', () => {
		cy.createCase().then((caseRefToLinkAsLead) => {
			cy.createCase().then((caseRefToLinkAsChild) => {
				cy.createCase().then((caseRefToLinkAsSecondLead) => {
					cy.createCase().then((caseRefToLinkAsSecondChild) => {
						happyPathHelper.assignCaseOfficer(caseRefToLinkAsChild);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsLead);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.selectRadioButtonByValue(
							'Yes, make this the lead appeal for ' + caseRefToLinkAsChild
						);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.validateBannerMessage(
							'Success',
							'This appeal is now a child appeal of ' + caseRefToLinkAsLead
						);
						caseDetailsPage.checkStatusOfCase('Child', 1);
						happyPathHelper.assignCaseOfficer(caseRefToLinkAsSecondChild);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsSecondLead);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.selectRadioButtonByValue(
							'Yes, make this the lead appeal for ' + caseRefToLinkAsSecondChild
						);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.validateBannerMessage(
							'Success',
							'This appeal is now a child appeal of ' + caseRefToLinkAsSecondLead
						);
						caseDetailsPage.checkStatusOfCase('Child', 1);
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(caseRefToLinkAsChild);
						caseDetailsPage.clickButtonByText('Continue');
						caseDetailsPage.verifyWarningText(
							'Appeal already linked to another lead appeal. Cannot be linked.'
						);
					});
				});
			});
		});
	});

	it.skip('link to an appeal that is already linked to this appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, this is a child appeal of ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'This appeal is now a lead appeal of' + caseRefToLink
				);
				caseDetailsPage.checkStatusOfCase('Lead', 1);
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.verifyWarningText('Appeals already linked.');
			});
		});
	});

	it.skip('link a back office appeal to a horizon appeal', () => {
		const horizonAppealId =
			Cypress.config('apiBaseUrl').indexOf('test') > -1
				? horizonTestAppeals.horizonAppealTest
				: horizonTestAppeals.horizonAppealMock;

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Overview');
			caseDetailsPage.clickAddLinkedAppeal();
			caseDetailsPage.fillInput(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes, this is a child appeal of ' + caseRef);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage(
				'Success',
				'This appeal is now a lead appeal of' + horizonAppealId
			);
			caseDetailsPage.checkStatusOfCase('Lead', 1);
		});
	});
});
