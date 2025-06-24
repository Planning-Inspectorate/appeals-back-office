// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('Manage correspondence', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;

	it('upload updated cross team correspondence doc', () => {
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
			caseDetailsPage.validateBannerMessage('Success', 'Cross-team correspondence added');
			caseDetailsPage.clickManageCrossTeamCorrespondence();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAnswerCorrespondenceDoc('File', sampleFiles.document2);
			caseDetailsPage.verifyCheckYourAnswerDate('Date received', uploadDate);
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Document updated');
		});
	});

	it('remove an inspector correspondence doc', () => {
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
			caseDetailsPage.validateBannerMessage('Success', 'Inspector correspondence added');
			caseDetailsPage.clickManageInspectorCorrespondence();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Document removed');
		});
	});
});
