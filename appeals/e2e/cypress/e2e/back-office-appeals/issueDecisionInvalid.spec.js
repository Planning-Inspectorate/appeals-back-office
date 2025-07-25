// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime } from '../../support/utils/formatDateAndTime';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

let sampleFiles = caseDetailsPage.sampleFiles;

const now = new Date();
const formattedDate = formatDateAndTime(now);

describe('Issue Decision', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Issue Decision is Invalid ', { tags: tag.smoke }, () => {
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
			caseDetailsPage.clickIssueDecision();

			//issue decision
			caseDetailsPage.selectRadioButtonByValue('Invalid');
			caseDetailsPage.fillTextArea('The appeal is invalid because of X reason', 0);
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
			caseDetailsPage.validateBannerMessage('Success', 'Appeal marked as invalid');
			caseDetailsPage.checkStatusOfCase('Invalid', 0);
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
