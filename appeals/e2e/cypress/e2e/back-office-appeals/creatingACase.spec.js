// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CreateCasePage } from '../../page_objects/createCasePage.js';

const caseDetailsPage = new CaseDetailsPage();
const documentationSectionPage = new DocumentationSectionPage();
const createCasePage = new CreateCasePage();

describe('Create A Case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});
	let appeal;
	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Create a Case', () => {
		cy.visit(
			'https://back-office-appeals-staging.planninginspectorate.gov.uk/appeals-service/create-a-case/select-case-type',
			{ timeout: 10000 }
		);
		createCasePage.selectCaseType('Tree preservation order');
		cy.get('.govuk-button').click();
		cy.get('[name="submission-date-day"]').type('01');
		cy.get('[name="submission-date-month"]').type('11');
		cy.get('[name="submission-date-year"]').type('2026');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Create case');
		caseDetailsPage.validateBannerMessage('Success', 'Case created');
	});
});
