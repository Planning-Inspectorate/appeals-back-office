// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { horizonTestAppeals } from '../../support/horizonTestAppeals.js';

const caseDetailsPage = new CaseDetailsPage();

describe('unrelate appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('unrelate an appeal from an appeal that has more than 1 related appeal', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToRelate) => {
				cy.createCase().then((secondCaseRefToRelate) => {
					happyPathHelper.assignCaseOfficer(caseRef);
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(caseRefToRelate);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(secondCaseRefToRelate);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
					caseDetailsPage.clickManageRelatedAppeals();
					caseDetailsPage.clickRemoveRelatedAppealByRef(caseRefToRelate);
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal removed');
				});
			});
		});
	});

	it('unrelate a BO appeal to a Horizon appeal', () => {
		const horizonAppealId =
			Cypress.config('apiBaseUrl').indexOf('test') > -1
				? horizonTestAppeals.horizonAppealTest
				: horizonTestAppeals.horizonAppealMock;

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAddRelatedAppeals();
			caseDetailsPage.fillInput(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			caseDetailsPage.clickManageRelatedAppeals();
			caseDetailsPage.clickRemoveRelatedAppealByRef(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Related appeal removed');
		});
	});
});
