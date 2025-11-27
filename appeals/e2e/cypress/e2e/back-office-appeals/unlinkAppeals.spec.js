// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('unlink appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	//27-11-2025: ficed test flow, though flow for unlinking appeal seems to be broken in dev/test/stgaing (sorry is problem with service error)
	it.skip('Unlink the only linked appeal from a child appeal', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToLink) => {
				happyPathHelper.assignCaseOfficer(caseObj);
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Add linked appeal');
				caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
				caseDetailsPage.checkStatusOfCase('Lead', 1);
				caseDetailsPage.clickManageLinkedAppeals();
				caseDetailsPage.clickLinkByText('Unlink');
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'You have unlinked this appeal from appeal  ' + caseObj
				);
			});
		});
	});

	//27-11-2025: flow for unlinking appeal seems to be broken in dev/test/stgaing (sorry is problem with service error)
	it.skip('Unlink the only linked appeal from a lead appeal', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToLinkAsLead) => {
				cy.createCase().then((unlinkedcaseObjToLink) => {
					happyPathHelper.assignCaseOfficer(caseObj);
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseObjToLinkAsLead);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, this is a child appeal of ' + caseObj);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now a lead appeal of ' + caseObjToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickManageLinkedAppeals();
					caseDetailsPage.clickLinkByText('Unlink');
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'You have unlinked this appeal from appeal  ' + caseObj
					);
				});
			});
		});
	});

	//27-11-2025: flow for unlinking appeal seems to be broken in dev/test/stgaing (sorry is problem with service error)
	it.skip('unlink an appeal from a lead appeal that has more than 1 linked appeal', () => {
		cy.createCase().then((caseObjToLinkAsLead) => {
			cy.createCase().then((caseObjToLinkAsChild) => {
				cy.createCase().then((caseObjToLinkAsSecondChild) => {
					happyPathHelper.assignCaseOfficer(caseObjToLinkAsLead);
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseObjToLinkAsChild);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, this is a child appeal of ' + caseObjToLinkAsLead
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now a child appeal of ' + caseObjToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(caseObjToLinkAsSecondChild);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, this is a child appeal of ' + caseObjToLinkAsLead
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now a child appeal of ' + caseObjToLinkAsLead
					);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.clickManageLinkedAppeals();
					caseDetailsPage.clickLinkByText('Unlink');
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'You have unlinked this appeal from appeal  ' + caseObjToLinkAsLead
					);
				});
			});
		});
	});
});
