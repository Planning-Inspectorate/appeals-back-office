// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { urlPaths } from '../../support/urlPaths';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('unlink appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it.skip('Unlink the only linked appeal from a child appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, make this the lead appeal for ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'This appeal is now a child appeal of ' + caseRefToLink
				);
				caseDetailsPage.checkStatusOfCase('Child', 1);
				caseDetailsPage.clickManageLinkedAppeals();
				caseDetailsPage.clickLinkByText('Unlink');
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'You have unlinked this appeal from appeal  ' + caseRef
				);
			});
		});
	});

	it.skip('Unlink the only linked appeal from a lead appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLinkAsLead) => {
				cy.createCase().then((unlinkedCaseRefToLink) => {
					happyPathHelper.assignCaseOfficer(caseRef);
					caseDetailsPage.clickAccordionByButton('Overview');
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseRefToLinkAsLead);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, this is a child appeal of ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now a lead appeal of ' + caseRefToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickManageLinkedAppeals();
					caseDetailsPage.clickLinkByText('Unlink');
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'You have unlinked this appeal from appeal  ' + caseRef
					);
				});
			});
		});
	});

	it.skip('unlink an appeal from a lead appeal that has more than 1 linked appeal', () => {
		cy.createCase().then((caseRefToLinkAsLead) => {
			cy.createCase().then((caseRefToLinkAsChild) => {
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
						'This appeal is now a child appeal of ' + caseRefToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseRefToLinkAsSecondChild);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, this is a child appeal of ' + caseRefToLinkAsLead
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now a child appeal of ' + caseRefToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickManageLinkedAppeals();
					caseDetailsPage.clickLinkByText('Unlink');
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'You have unlinked this appeal from appeal  ' + caseRefToLinkAsLead
					);
				});
			});
		});
	});
});
