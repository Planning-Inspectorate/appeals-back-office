// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

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
			caseDetailsPage.checkAppealStatus('Awaiting transfer');
		});
	});

	it('Change appeal type and resubmit', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Overview');
			caseDetailsPage.clickChangeAppealType();
			caseDetailsPage.selectRadioButtonByValue('(Q) Planning obligation appeal');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterChangeAppealTypeResubmissionDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAppealStatus('Closed');
		});
	});
});
