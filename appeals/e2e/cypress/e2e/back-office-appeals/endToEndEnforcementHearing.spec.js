// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';
import { users } from '../../fixtures/users.js';
import { HearingSectionPage } from '../../page_objects/caseDetails/hearingSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();
const hearingSectionPage = new HearingSectionPage();
const currentDate = new Date();

const originalAddress = {
	line1: 'e2e Hearing Test Address',
	line2: 'Hearing Street',
	town: 'Hearing Town',
	county: 'Somewhere',
	postcode: 'BS20 1BS'
};

const headers = {
	hearingEstimate: {
		checkDetails: 'Check details and add hearing estimates',
		estimateForm: 'Hearing estimates'
	},
	hearing: {
		checkDetails: 'Check details and set up hearing',
		estimationQuestion: 'Do you know the expected number of days to carry out the hearing?',
		addressQuestion: 'Do you know the address of where the hearing will take place?',
		addressForm: 'Address',
		dateTime: 'Date and time',
		confirmHearingCancellation: 'Confirm that you want to cancel the hearing'
	}
};

describe('Progress Enforcement Appeal to Decision', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(`Completes an Enforcement Hearing Appeal to decision`, () => {
		cy.createCase({ ...appealsApiRequests.enforcementSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('Enforcement notice appeal');

			happyPathHelper.reviewEnforcementAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startCaseWithProcedureType(caseObj, 'hearing');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			hearingSectionPage.changeHearingAddress({ address: originalAddress });
			caseDetailsPage.clickButtonByText('Update hearing');

			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);

			happyPathHelper.addThirdPartyComment(caseObj, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseObj, false);
			caseDetailsPage.clickBackLink();

			happyPathHelper.addLpaStatement(caseObj);
			cy.simulateStatementsDeadlineElapsed(caseObj);
			cy.reload();

			caseDetailsPage.shareCommentsAndStatements();
			caseDetailsPage.checkStatusOfCase('Final comments', 0);

			happyPathHelper.addLpaFinalComment(caseObj);
			cy.loadAppealDetails(caseObj).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
			});
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			cy.reload();
			caseDetailsPage.shareFinalComments();
			caseDetailsPage.checkStatusOfCase('Awaiting hearing', 0);

			happyPathHelper.advanceTo(
				caseObj,
				'AWAITING_EVENT',
				'ISSUE_DECISION',
				'ENFORCEMENT',
				'HEARING'
			);

			caseDetailsPage.clickIssueDecision(caseObj);
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Notice upheld'));
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.uploadSampleFile(caseDetailsPage.sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue Decision');
			caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
			caseDetailsPage.checkStatusOfCase('Complete', 0);
			caseDetailsPage.checkDecisionOutcome('Notice upheld');
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});

	it(`Completes an Enforcement Appeal to decision`, () => {
		cy.createCase({ ...appealsApiRequests.enforcementSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('Enforcement notice appeal');

			happyPathHelper.reviewEnforcementAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startCaseWithProcedureType(caseObj, 'hearing');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			hearingSectionPage.clickCancelHearing();
			hearingSectionPage.clickCancelHearing();

			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);

			happyPathHelper.addThirdPartyComment(caseObj, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseObj, false);
			caseDetailsPage.clickBackLink();

			happyPathHelper.addLpaStatement(caseObj);
			cy.simulateStatementsDeadlineElapsed(caseObj);
			cy.reload();

			caseDetailsPage.shareCommentsAndStatements();
			caseDetailsPage.checkStatusOfCase('Final comments', 0);

			happyPathHelper.addLpaFinalComment(caseObj);
			cy.loadAppealDetails(caseObj).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
			});
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			cy.reload();
			caseDetailsPage.shareFinalComments();
			caseDetailsPage.checkStatusOfCase('Hearing ready to set up', 0);

			hearingSectionPage.clickSetUpHearing();

			cy.getBusinessActualDate(currentDate, 2).then((date) => {
				date.setHours(currentDate.getHours(), currentDate.getMinutes());

				let navigationConfig = {
					clickBackFirst: false,
					clickBackLast: false,
					headers: [headers.hearing.checkDetails, headers.hearing.addressQuestion]
				};
				hearingSectionPage.setUpHearingWithAddress({ date: date });
				happyPathHelper.validateBackNavigationFlow(navigationConfig);

				// Test back navigation after adding address flow
				hearingSectionPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				hearingSectionPage.addHearingLocationAddress(originalAddress);

				caseDetailsPage.clickButtonByText('Set up Hearing');
				caseDetailsPage.checkStatusOfCase('Awaiting hearing', 0);

				happyPathHelper.advanceTo(
					caseObj,
					'AWAITING_EVENT',
					'ISSUE_DECISION',
					'ENFORCEMENT',
					'HEARING'
				);

				caseDetailsPage.clickIssueDecision(caseObj);
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Notice upheld'));
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadSampleFile(caseDetailsPage.sampleFiles.pdf);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('No');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('No');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Issue Decision');
				caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
				caseDetailsPage.checkStatusOfCase('Complete', 0);
				caseDetailsPage.checkDecisionOutcome('Notice upheld');
				caseDetailsPage.viewDecisionLetter('View decision');
			});
		});
	});
});
