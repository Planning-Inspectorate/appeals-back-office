// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection.js';
import { urlPaths } from '../../support/urlPaths.js';
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
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickAddCrossTeamCorrespondence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Cross-team correspondence documents uploaded');
		});
	});

	it('Add inspector correspondence', () => {
		const uploadDate = new Date();
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickAddInspectorCorrespondence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Inspector correspondence documents uploaded');
		});
	});

	it('Add main party correspondence', () => {
		const uploadDate = new Date();
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickAccordionByButton('Case management');
			caseDetailsPage.clickAddMainPartyCorrespondence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Add main party correspondence');
			caseDetailsPage.validateBannerMessage('Main party correspondence documents uploaded');
		});
	});
});
