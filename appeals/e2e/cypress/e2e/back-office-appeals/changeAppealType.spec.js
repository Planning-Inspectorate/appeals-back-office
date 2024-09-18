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

describe('Change Appeal Type', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Change appeal type and do not resubmit', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Overview');
			caseDetailsPage.clickChangeAppealType();
			caseDetailsPage.selectRadioButtonByValue('(W) Planning appeal');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('This appeal is awaiting transfer');
			caseDetailsPage.checkStatusOfCase('Awaiting transfer', 0);
		});
	});

	it('Change appeal type and resubmit', { tags: tag.smoke }, () => {
		let futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 28);

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Overview');
			caseDetailsPage.clickChangeAppealType();
			caseDetailsPage.selectRadioButtonByValue('(Q) Planning obligation appeal');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.enterChangeAppealTypeResubmissionDate(futureDate);
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickLinkByText('Go back to case details');
			caseDetailsPage.checkStatusOfCase('Closed', 0);
		});
	});
});
