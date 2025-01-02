// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { urlPaths } from '../../support/urlPaths';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('change contacts', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it(`change contact appellant`, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickChangeAppellant();
			caseDetailsPage.inputAppellantEmailAddress('appellant@test.com');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Appellant details updated');
			caseDetailsPage.verifyAppellantEmailAddress('Appellant', 'appellant@test.com');
		});
	});

	it(`change contact agent`, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickChangeAgent();
			caseDetailsPage.inputAgentEmailAddress('agent@test.com');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Agent details updated');
			caseDetailsPage.verifyAppellantEmailAddress('Agent', 'agent@test.com');
		});
	});
});
