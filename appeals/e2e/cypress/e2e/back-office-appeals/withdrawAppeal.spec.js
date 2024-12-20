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

	let sampleFiles = caseDetailsPage.sampleFiles;
	it('withdraw appeal', () => {
		const withdrawalDate = new Date();

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickStartAppealWithdrawal();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.clearWithdrawalDate();
			dateTimeSection.enterWithdrawalRequestDate(withdrawalDate);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkAnswerWithdrawalRequest('Withdrawal request', sampleFiles.document);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'Redacted');
			caseDetailsPage.verifyCheckYourAnswerDate('Request date', withdrawalDate);
			caseDetailsPage.checkEmailRelevantParties();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanel('Appeal withdrawn');
			caseDetailsPage.clickLinkByText('Go back to case details');
			caseDetailsPage.checkStatusOfCase('Withdrawn', 0);
		});
	});

	it('view withdrawn appeal', () => {
		const withdrawalDate = new Date();

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickStartAppealWithdrawal();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			dateTimeSection.clearWithdrawalDate();
			dateTimeSection.enterWithdrawalRequestDate(withdrawalDate);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkAnswerWithdrawalRequest('Withdrawal request', sampleFiles.document);
			caseDetailsPage.checkAnswerRedactionStatus('Redaction status', 'Redacted');
			caseDetailsPage.verifyCheckYourAnswerDate('Request date', withdrawalDate);
			caseDetailsPage.checkEmailRelevantParties();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanel('Appeal withdrawn');
			caseDetailsPage.clickLinkByText('Go back to case details');
			caseDetailsPage.checkStatusOfCase('Withdrawn', 0);
			caseDetailsPage.clickViewAppealWithdrawal();
			caseDetailsPage.clickLinkByText('View');
			cy.readFile(`${Cypress.config('downloadsFolder')}/${sampleFiles.document}`);
		});
	});
});
