// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('add supporting documents', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;

	it('upload and manage LPA documemnts ', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			caseDetailsPage.clickLinkByText('Review');
			caseDetailsPage.clickIndividualLinkWhenMultiple('Additional documents', 'Add');
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Additional documents added');
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickIndividualLinkWhenMultiple('Additional documents', 'Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document3);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Additional documents updated');
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickIndividualLinkWhenMultiple('Additional documents', 'Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Additional documents removed');
		});
	});

	it('upload and manage IP Comments documemnts ', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);
			happyPathHelper.addThirdPartyComment(caseObj, true);
			cy.contains('.govuk-tabs__tab', 'Accepted').click();
			caseDetailsPage.clickLinkByText('View');
			caseDetailsPage.clickLinkByText('Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.img);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Supporting document removed');
		});
	});

	it('upload and manage Final Comments documemnts ', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);
			happyPathHelper.addThirdPartyComment(caseObj, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addLpaStatement(caseObj);
			cy.simulateStatementsDeadlineElapsed(caseObj);
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkStatusOfCase('Final comments', 0);
			cy.loadAppealDetails(caseObj).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
			});
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Share final comments');
			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);
			caseDetailsPage.clickIndividualLinkWhenMultipleTable('Appellant final comments', 'View');
			caseDetailsPage.clickLinkByText('Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.img);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Supporting document removed');
		});
	});
});
