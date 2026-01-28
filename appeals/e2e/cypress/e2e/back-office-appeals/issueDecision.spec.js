// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { FileUploader } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';
import { formatDateAndTime } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();

const fileUploader = new FileUploader();
const pdf = [fileUploader.sampleFiles.pdf];

const now = new Date();
const formattedDate = formatDateAndTime(now);

let appeal;

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase().then((caseObj) => {
		cy.wrap(caseObj).as('caseObjAlias');
		appeal = caseObj;
		happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'ISSUE_DECISION', 'HAS');
	});
});

afterEach(() => {
	cy.deleteAppeals(appeal);
});

describe('Issue decision', () => {
	const issueDecisionCompleteStatus = ['Allowed', 'Dismissed', 'Split Decision'];

	issueDecisionCompleteStatus.forEach((issueDecision) => {
		it(`Issue '${issueDecision}' decision`, { tags: tag.smoke }, () => {
			cy.get('@caseObjAlias').then((caseObj) => {
				//Issue decision
				happyPathHelper.viewCaseDetails(caseObj);
				happyPathHelper.issueDecision(issueDecision, 'both costs');

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

				cy.checkNotifySent(caseObj, expectedNotifies);
			});
		});
	});

	const costs = [
		{ typeOfCost: 'Appellant', appellant: true, lpa: false, remainingCost: 'LPA' },
		{ typeOfCost: 'LPA', appellant: false, lpa: true, remainingCost: 'appellant' }
	];

	costs.forEach(({ typeOfCost, appellant, lpa, remainingCost, route }) => {
		it(`Issue decision with ${typeOfCost} costs only`, () => {
			cy.get('@caseObjAlias').then((caseObj) => {
				//Issue decision
				happyPathHelper.viewCaseDetails(caseObj);
				happyPathHelper.issueDecision('Allowed', 'both costs', appellant, lpa);

				//Case details
				caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
				caseDetailsPage.viewDecisionLetter('View decision');
				caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
				caseDetailsPage.validateBannerMessage('Important', `Issue ${remainingCost} costs decision`);
			});
		});
	});

	it('Issue decision without costs', () => {
		cy.get('@caseObjAlias').then((caseObj) => {
			//Issue decision without costs
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.issueDecision('Allowed', 'both costs', false, false);

			//Case details
			caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
			caseDetailsPage.viewDecisionLetter('View decision');
			caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
			caseDetailsPage.validateBannerMessage('Important', 'Issue appellant costs decision');
			caseDetailsPage.validateBannerMessage('Important', 'Issue LPA costs decision');
		});
	});
});

describe('Withdrawn costs', () => {
	it('Issue decision with withdrawn appellant costs', () => {
		cy.get('@caseObjAlias').then((caseObj) => {
			//add withdrawal document
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.addAppellantCostWithdrawal();

			//Issue decision without costs
			happyPathHelper.issueDecision('Allowed', 'lpa only');

			//Case details
			caseDetailsPage.checkDecisionOutcome('Decision: Allowed');
			caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
			caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});

	it('Issue decision with withdrawn LPA costs', () => {
		cy.get('@caseObjAlias').then((caseObj) => {
			//add withdrawal document
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.addLpaCostWithdrawal();

			//Issue decision without costs
			happyPathHelper.issueDecision('Allowed', 'appellant only');

			//Case details
			caseDetailsPage.checkDecisionOutcome('Decision: Allowed');
			caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
			caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});

	it('Issue decision with both appellant and LPA costs withdrawn', () => {
		cy.get('@caseObjAlias').then((caseObj) => {
			//add withdrawal document
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.addAppellantCostWithdrawal();
			happyPathHelper.addLpaCostWithdrawal();

			//Issue decision without costs
			happyPathHelper.issueDecision('Allowed', 'no costs');

			//Case details
			caseDetailsPage.checkDecisionOutcome('Decision: Allowed');
			caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
			caseDetailsPage.viewDecisionLetter('View decision');
		});
	});
});

describe('Invalid decision', () => {
	const hasDecisionLetter = [true, false];

	hasDecisionLetter.forEach((hasLetter) => {
		it(
			`Issue invalid decision - ${hasLetter ? 'with' : 'without'} decision letter`,
			{ tags: tag.smoke },
			() => {
				cy.get('@caseObjAlias').then((caseObj) => {
					//Issue invalid decision with/without decision letter
					happyPathHelper.viewCaseDetails(caseObj);
					happyPathHelper.issueInvalidDecision(hasLetter, 'both costs');

					//Case details inset text
					caseDetailsPage.checkDecisionOutcome('Decision: Invalid');
					caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
					caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
					caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
					caseDetailsPage.viewDecisionLetter('View decision');

					//Notify
					const expectedNotifies = [
						{
							template: hasLetter
								? 'decision-is-allowed-split-dismissed-lpa'
								: 'decision-is-invalid-lpa',
							recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
						},
						{
							template: hasLetter
								? 'decision-is-allowed-split-dismissed-appellant'
								: 'decision-is-invalid-appellant',
							recipient: 'agent@test.com'
						}
					];
					cy.checkNotifySent(caseObj, expectedNotifies);
				});
			}
		);
	});
});

describe('Issue individual costs decision', () => {
	it('Issue appellant costs separately', () => {
		cy.get('@caseObjAlias').then((caseObj) => {
			//Issue decision without costs
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.issueDecision('Allowed', 'both costs', false, false);

			//Upload decision letter
			caseDetailsPage.clickIssueAppellantCostsDecision();
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue appellant costs decision');

			//Verify case details updates
			caseDetailsPage.validateBannerMessage('Success', 'Appellant costs decision issued');
			caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
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
			cy.checkNotifySent(caseObj, notifies);
		});
	});

	it('Issue LPA costs separately', () => {
		cy.get('@caseObjAlias').then((caseObj) => {
			//Issue decision without costs
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.issueDecision('Allowed', 'both costs', false, false);

			//Upload decision letter
			caseDetailsPage.clickIssueLpaCostsDecision();
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue LPA costs decision');

			//Verify case details updates
			caseDetailsPage.validateBannerMessage('Success', 'LPA costs decision issued');
			caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');
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
			cy.checkNotifySent(caseObj, notifies);
		});
	});
});
