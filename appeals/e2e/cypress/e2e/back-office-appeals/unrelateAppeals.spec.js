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

	let cases = [];

	afterEach(() => {
		cy.deleteAppeals(cases);
	});

	it('unrelate an appeal from an appeal that has more than 1 related appeal', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToRelate) => {
				cy.createCase().then((secondcaseObjToRelate) => {
					cases = [caseObj, caseObjToRelate, secondcaseObjToRelate];
					happyPathHelper.assignCaseOfficer(caseObj);
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(caseObjToRelate.reference);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, relate this appeal to ' + caseObj.reference
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(secondcaseObjToRelate.reference);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, relate this appeal to ' + caseObj.reference
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
					caseDetailsPage.clickManageRelatedAppeals();
					caseDetailsPage.clickRemoveRelatedAppealByRef(caseObjToRelate.reference);
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

		cy.createCase().then((caseObj) => {
			cases = [caseObj];
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickAddRelatedAppeals();
			caseDetailsPage.fillInput(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
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
