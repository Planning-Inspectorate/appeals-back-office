// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { FileUploader } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime } from '../../support/utils/dateAndTime';
import { tag } from '../../support/tag';

const caseDetailsPage = new CaseDetailsPage();

const fileUploader = new FileUploader();
const pdf = [fileUploader.sampleFiles.pdf];

const now = new Date();
const formattedDate = formatDateAndTime(now);

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});

describe('Issue decision', () => {
	const issueDecisionCompleteStatus = ['Allowed', 'Dismissed', 'Split Decision'];

	issueDecisionCompleteStatus.forEach((issueDecision) => {
		it(`Issue '${issueDecision}' decision`, { tags: tag.smoke }, () => {
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
				caseDetailsPage.checkDecisionOutcome(`Decision: ${issueDecision}`);
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

	const costs = [
		{ typeOfCost: 'Appellant', appellant: true, lpa: false, remainingCost: 'LPA' },
		{ typeOfCost: 'LPA', appellant: false, lpa: true, remainingCost: 'appellant' }
	];

	costs.forEach(({ typeOfCost, appellant, lpa, remainingCost }) => {
		it(`Issue decision with ${typeOfCost} costs only`, () => {
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
				happyPathHelper.issueDecision(caseRef, 'Allowed', appellant, lpa);

				//Case details
				caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
				caseDetailsPage.viewDecisionLetter('View decision');
				caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
				caseDetailsPage.validateBannerMessage('Important', `Issue ${remainingCost} costs decision`);
			});
		});
	});

	it('Issue decision without costs', () => {
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

			//Issue decision without costs
			happyPathHelper.issueDecision(caseRef, 'Allowed', false, false);

			//Case details
			caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
			caseDetailsPage.viewDecisionLetter('View decision');
			caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
			caseDetailsPage.validateBannerMessage('Important', 'Issue appellant costs decision');
			caseDetailsPage.validateBannerMessage('Important', 'Issue LPA costs decision');
		});
	});
});

describe('Invalid decision', () => {
	it('Issue `Invalid` decision', { tags: tag.smoke }, () => {
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

			//Issue invalid decision
			happyPathHelper.issueDecision(caseRef, 'Invalid');

			//Case details inset text
			caseDetailsPage.checkDecisionOutcome('Decision: Invalid');
			caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
			caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
			caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
			caseDetailsPage.viewDecisionLetter('View decision');

			//Notify
			const expectedNotifies = [
				{
					template: 'decision-is-invalid-lpa',
					recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
				},
				{
					template: 'decision-is-invalid-appellant',
					recipient: 'agent@test.com'
				}
			];

			cy.checkNotifySent(caseRef, expectedNotifies);
		});
	});
});

describe('Issue individual costs decision', () => {
	it('Issue appellant costs separately', () => {
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

			//Issue decision without costs
			happyPathHelper.issueDecision(caseRef, 'Allowed', false, false);

			//Upload decision letter
			caseDetailsPage.clickIssueAppellantCostsDecision();
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue appellant costs decision');

			//Verify case details updates
			caseDetailsPage.validateBannerMessage('Success', 'Appellant costs decision issued');
			caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
			caseDetailsPage.clickAccordionByText('Overview');
			caseDetailsPage.checkCorrectAnswerDisplays('Appellant costs decision', 'Issued');

			const notifies = [
				{
					template: 'appellant-costs-decision-appellant',
					recipient: 'agent@test.com'
				},
				{
					template: 'appellant-costs-decision-lpa',
					recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
				}
			];

			cy.checkNotifySent(caseRef, notifies);
		});
	});

	it('Issue LPA costs separately', () => {
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

			//Issue decision without costs
			happyPathHelper.issueDecision(caseRef, 'Allowed', false, false);

			//Upload decision letter
			caseDetailsPage.clickIssueLpaCostsDecision();
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue LPA costs decision');

			//Verify case details updates
			caseDetailsPage.validateBannerMessage('Success', 'LPA costs decision issued');
			caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
			caseDetailsPage.clickAccordionByText('Overview');
			caseDetailsPage.checkCorrectAnswerDisplays('LPA costs decision', 'Issued');

			const notifies = [
				{
					template: 'lpa-costs-decision-appellant',
					recipient: 'agent@test.com'
				},
				{
					template: 'lpa-costs-decision-lpa',
					recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
				}
			];

			cy.checkNotifySent(caseRef, notifies);
		});
	});
});
