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

describe('Withdraw a Has appeal', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('withdraw appeal', () => {
		const date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickStartAppealWithdrawal();
			caseDetailsPage.uploadSampleDoc();
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.clearWithdrawalDate();
			dateTimeSection.enterWithdrawalDate(day, month, year);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkAnswerWithdrawalRequest('Withdrawal request', 'sample-file.doc');
			caseDetailsPage.checkAnswerRedactionStatus('Redaction status', 'Redacted');
			caseDetailsPage.checkAnswerRequestDate();
			caseDetailsPage.checkEmailRelevantParties();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanel('Appeal withdrawn');
			caseDetailsPage.clickLinkByText('Go back to case details');
			caseDetailsPage.checkStatusOfCase('Withdrawn', 0);
		});
	});
});
