// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Change Appeal Type', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Change appeal type and do not resubmit', { tags: tag.smoke }, () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickChangeAppealType();
			caseDetailsPage.selectRadioButtonByValue('Planning');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Mark as awaiting transfer');
			caseDetailsPage.validateBannerMessage('Important', 'Mark as transferred');
			caseDetailsPage.checkStatusOfCase('Awaiting transfer', 0);
		});
	});

	// skipping test as is work in progress - https://pins-ds.atlassian.net/browse/A2-3649
	it.skip('Change appeal type and resubmit', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickChangeAppealType();
			caseDetailsPage.selectRadioButtonByValue('Planning obligation');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterChangeAppealTypeResubmissionDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkStatusOfCase('Closed', 0);
		});
	});
});
