// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

describe('change contacts', () => {
	let caseRef;

	before(() => {
		cy.createCase().then((ref) => {
			caseRef = ref;
			cy.login(users.appeals.caseAdmin);
			happyPathHelper.assignCaseOfficer(ref);
		});
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickCaseNotes();
	});

	it(`change contact appellant`, () => {
		caseDetailsPage.clickChangeAppellant();
		caseDetailsPage.inputAppellantEmailAddress('appellant@test.com');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage('Success', 'Appellant contact details updated');
		caseDetailsPage.verifyAppellantEmailAddress('Appellant', 'appellant@test.com');
	});

	it(`change contact agent`, () => {
		caseDetailsPage.clickChangeAgent();
		caseDetailsPage.inputAgentEmailAddress('agent@test.com');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage('Success', 'Agent contact details updated');
		caseDetailsPage.verifyAppellantEmailAddress('Agent', 'agent@test.com');
	});
});
