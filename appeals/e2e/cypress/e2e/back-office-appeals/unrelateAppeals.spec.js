// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { urlPaths } from '../../support/urlPaths';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { createApiSubmission } from '../../support/appealsApiClient.js';
import { appealsApiClient } from '../../support/appealsApiClient.js';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';

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
					caseDetailsPage.validateBannerMessage('This appeal is now related to ' + caseRef);
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(secondCaseRefToRelate);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('This appeal is now related to ' + caseRef);
					caseDetailsPage.clickManageRelatedAppeals();
					//caseDetailsPage.removeFirstRelatedAppeal();
					caseDetailsPage.clickRemoveRelatedAppealByRef(caseRefToRelate);
					caseDetailsPage.selectRadioButtonByValue('Yes');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage(
						'You have removed the relationship between this appeal and appeal' +
							secondCaseRefToRelate
					);
				});
			});
		});
	});
});