// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime } from '../../support/utils/dateAndTime';

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
				happyPathHelper.issueDecision(caseRef, issueDecision);

				//Case details
				caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
				caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
				caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
				caseDetailsPage.viewDecisionLetter('View decision');

				//Notify
				const expectedNotifies = [
					{
						template: 'decision-is-allowed-split-dismissed-lpa',
						recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
					},
					{
						template: 'decision-is-allowed-split-dismissed-appellant',
						recipient: 'agent@test.com'
					}
				];

				cy.checkNotifySent(caseRef, expectedNotifies);
			});
		});
	});
});
