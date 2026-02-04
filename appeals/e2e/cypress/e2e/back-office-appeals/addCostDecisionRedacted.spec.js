// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});

let appeal;

afterEach(() => {
	cy.deleteAppeals(appeal);
});

describe('add cost decision and redact', () => {
	let sampleFiles = caseDetailsPage.sampleFiles;

	it('add costs decsion and redact', { tags: tag.smoke }, () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			happyPathHelper.reviewLpaq(caseObj);
			happyPathHelper.setupSiteVisitFromBanner(caseObj);
			cy.simulateSiteVisit(caseObj).then((caseObj) => {
				cy.reload();
			});
			caseDetailsPage.clickIssueAppellantCostsDecision();
			caseDetailsPage.uploadSampleFile(sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Issue appellant costs decision');
			caseDetailsPage.validateSuccessPanelBody('Appellant costs decision issued');
		});
	});

	it('change the redaction status of a cost decsion', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickAddAppellantApplication();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickManageAppellantCostApplication();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickChangeRedactionStatus();
			caseDetailsPage.selectRadioButtonByValue('Unredacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Document details updated');
			caseDetailsPage.checkRedactionStatus('Unredacted');
		});
	});

	it('Upload new version and change filename', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickAddAppellantApplication();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickManageAppellantCostApplication();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Unredacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickManageAppellantCostApplication();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.checkDocVersionNumber('2');
			caseDetailsPage.clickChangeFileName();
			caseDetailsPage.updateFileName('sample-file');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkFileName('sample-file.doc');
		});
	});
});
