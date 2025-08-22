// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { tag } from '../../support/tag';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { FileUploader } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const fileUploader = new FileUploader();

const pdf = [fileUploader.sampleFiles.pdf];

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});

describe('Appellant Costs', () => {
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
			happyPathHelper.issueDecisionWithoutCosts(caseRef, 'Allowed');

			//upload decision letter
			caseDetailsPage.clickIssueAppellantCostsDecision();
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue appellant costs decision');

			//verify case details updates
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
});

describe('LPA Costs', () => {
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
			happyPathHelper.issueDecisionWithoutCosts(caseRef, 'Allowed');

			//upload decision letter
			caseDetailsPage.clickIssueLpaCostsDecision();
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue LPA costs decision');

			//verify case details updates
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
