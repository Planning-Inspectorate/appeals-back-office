// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ContactDetailsPage } from '../../page_objects/contactDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();
const contactDetailsPage = new ContactDetailsPage();

describe('change contacts', () => {
	let caseObj;

	before(() => {
		cy.createCase().then((ref) => {
			caseObj = ref;
			appeal = caseObj;
			cy.login(users.appeals.caseAdmin);
			happyPathHelper.assignCaseOfficer(ref);
		});
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseObj);
		caseDetailsPage.clickCaseNotes();
	});

	let appeal;

	after(() => {
		cy.deleteAppeals(appeal);
	});

	it(`change contact appellant`, () => {
		caseDetailsPage.clickChangeAppellant();
		contactDetailsPage.inputLastName('newLastName');
		contactDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage('Success', `Appellant's contact details updated`);
		caseDetailsPage.verifyCaseDetailsValue('Appellant', 'newLastName');
	});

	it(`change contact agent`, () => {
		caseDetailsPage.clickChangeAgent();
		contactDetailsPage.inputEmailAddress('agent@test.com');
		contactDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage('Success', `Agent's contact details updated`);
		caseDetailsPage.verifyCaseDetailsValue('Agent', 'agent@test.com');
	});
});
