// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

const now = new Date();
const formattedDate = formatDateAndTime(now);

const { users: apiUsers, casedata } = appealsApiRequests.caseSubmission;

describe('Update Decision Letter', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;
	it('Update Decision Letter', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			//Move Case to Decision Issued Status
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'ISSUE_DECISION', 'S78');
			//Change decision letter
			happyPathHelper.issueDecision('Allowed', 'both costs', false, false);
			caseDetailsPage.clickViewDecisionLetter('View decision');
			caseDetailsPage.clickChangeLinkByLabel('Decision letter');
			caseDetailsPage.uploadSampleFile(sampleFiles.pdf2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.inputCorrectionNotice('Test Correction Notice');
			caseDetailsPage.clickButtonByText('Continue');
			//Verify CYA
			caseDetailsPage.verifyCheckYourAnswers('Decision letter', 'test.pdf'); // same as original pdf file mame
			caseDetailsPage.verifyCheckYourAnswers('Correction notice', 'Test Correction Notice');
			caseDetailsPage.clickButtonByText('Update decision letter');
			//Notify
			const expectedNotifies = [
				{
					template: 'correction-notice-decision',
					recipient: apiUsers[0].emailAddress
				},
				{
					template: 'correction-notice-decision',
					recipient: apiUsers[1].emailAddress
				},
				{
					template: 'correction-notice-decision',
					recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
				}
			];

			cy.checkNotifySent(caseObj, expectedNotifies);
			//Verify Appeal Decision Page
			caseDetailsPage.validateBannerMessage('Success', 'Decision letter updated');
			caseDetailsPage.verifyCheckYourAnswers('Decision issue date', formattedDate.date);
			caseDetailsPage.clickBackLink();
			caseDetailsPage.checkDecisionOutcome(
				`Decision issued on ${formattedDate.date} (updated on ${formattedDate.date})`
			);
			//verify Case History
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue('Correction notice added: Test Correction Notice');
			caseHistoryPage.verifyCaseHistoryValue('Decision letter test.pdf updated');
		});
	});
});
