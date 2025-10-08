// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();

const now = new Date();
const formattedDate = formatDateAndTime(now);

const { users: apiUsers, casedata } = appealsApiRequests.caseSubmission;

describe('Update Decision Letter', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});
	let sampleFiles = caseDetailsPage.sampleFiles;
	it('Update Decision Letter', () => {
		cy.createCase().then((caseObj) => {
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			happyPathHelper.reviewLpaq(caseObj);
			happyPathHelper.setupSiteVisitFromBanner(caseObj);
			cy.simulateSiteVisit(caseObj).then((caseObj) => {
				cy.reload();
			});
			//Issue decision
			caseDetailsPage.clickIssueDecision();
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Allowed'));
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.uploadSampleFile(sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
			//Appellant costs
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			//LPA costs
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			//CYA
			caseDetailsPage.clickButtonByText('Issue decision');
			//Case details inset text
			caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
			caseDetailsPage.checkStatusOfCase('Complete', 0);
			caseDetailsPage.checkDecisionOutcome('Allowed');
			//Change decision letter
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
			caseDetailsPage.verifyTableCellTextCaseHistory(
				'Correction notice added: Test Correction Notice'
			);
			caseDetailsPage.verifyTableCellTextCaseHistory('Decision letter test.pdf updated');
		});
	});
});
