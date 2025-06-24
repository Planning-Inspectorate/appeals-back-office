// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime } from '../../support/utils/formatDateAndTime';

const caseDetailsPage = new CaseDetailsPage();

const now = new Date();
const formattedDate = formatDateAndTime(now);

describe('Issue Decision', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const issueDecisionCompleteStatus = ['Allowed', 'Dismissed', 'Split Decision'];

	let sampleFiles = caseDetailsPage.sampleFiles;

	issueDecisionCompleteStatus.forEach((issueDecision) => {
		it(`Change to ${issueDecision} type`, { tags: tag.smoke }, () => {
			cy.createCase().then((caseRef) => {
				cy.addLpaqSubmissionToCase(caseRef);
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				happyPathHelper.reviewLpaq(caseRef);
				happyPathHelper.setupSiteVisitFromBanner(caseRef);
				cy.simulateSiteVisit(caseRef).then((caseRef) => {
					cy.reload();
				});

				//Issue decision
				caseDetailsPage.clickIssueDecision();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(issueDecision));
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadSampleFile(sampleFiles.pdf);
				caseDetailsPage.clickButtonByText('Continue');

				//Appellant costs
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadSampleFile(sampleFiles.pdf);
				caseDetailsPage.clickButtonByText('Continue');

				//LPA costs
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.uploadSampleFile(sampleFiles.pdf);
				caseDetailsPage.clickButtonByText('Continue');

				//CYA
				caseDetailsPage.clickButtonByText('Issue decision');

				//Case details inset text
				caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
				caseDetailsPage.checkStatusOfCase('Complete', 0);
				caseDetailsPage.checkDecisionOutcome(issueDecision);
				caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
				caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
				caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
				caseDetailsPage.viewDecisionLetter('View decision');

				//Notify
				const expectedNotifies = [
					'decision-is-allowed-split-dismissed-lpa',
					'decision-is-allowed-split-dismissed-appellant'
				];

				cy.checkNotifySent(caseRef, expectedNotifies);
			});
		});
	});
});
