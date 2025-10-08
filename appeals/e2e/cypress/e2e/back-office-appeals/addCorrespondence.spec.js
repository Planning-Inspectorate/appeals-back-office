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

describe('Add correspondence', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;

	it('Add cross-team correspondence', () => {
		const uploadDate = new Date();
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickAddCrossTeamCorrespondence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Cross-team correspondence added');
		});
	});

	it('Add inspector correspondence', () => {
		const uploadDate = new Date();
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickAddInspectorCorrespondence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Inspector correspondence added');
		});
	});

	it('Add main party correspondence', () => {
		const uploadDate = new Date();
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickAddMainPartyCorrespondence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Add main party correspondence');
			caseDetailsPage.validateBannerMessage('Success', 'Main party correspondence added');
		});
	});
});
