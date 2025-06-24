// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { urlPaths } from '../../support/urlPaths';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { createApiSubmission } from '../../support/appealsApiClient.js';
import { appealsApiClient } from '../../support/appealsApiClient.js';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';
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
					caseDetailsPage.clickAccordionByButton('Overview');
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(caseRefToRelate);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now related to ' + caseRef
					);
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(secondCaseRefToRelate);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'This appeal is now related to ' + caseRef
					);
					caseDetailsPage.clickManageRelatedAppeals();
					caseDetailsPage.clickRemoveRelatedAppealByRef(caseRefToRelate);
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'You have removed the relationship between this appeal and appeal' + caseRefToRelate
					);
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
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(horizonAppealId);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'This appeal is now related to ' + caseRef
				);
				caseDetailsPage.clickManageRelatedAppeals();
				caseDetailsPage.clickRemoveRelatedAppealByRef(horizonAppealId);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'You have removed the relationship between this appeal and appeal' + horizonAppealId
				);
			});
		});
	});
});
