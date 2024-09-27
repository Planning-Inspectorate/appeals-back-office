// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('add cost decision and redact', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('add costs decsion and redact', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickAccordionByButton('Costs');
			caseDetailsPage.clickAddCostsDecision();
			caseDetailsPage.uploadSamplePdf();
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkEmailRelevantParties(0);
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Costs decision uploaded');
		});
	});
});
