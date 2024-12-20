// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('manage docs on appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;
	it('upload new version of document on appellant case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.img);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Document updated');
		});
	});

	it('add an additional doc and then remove on file upload page', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			caseDetailsPage.clickAddAdditionalDocs();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.checkFileNameDisplays(sampleFiles.document);
			caseDetailsPage.clickRemoveFileUpload(sampleFiles.document);
			caseDetailsPage.checkFileNameRemoved(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkErrorMessageDisplays('Select a file');
		});
	});

	it('upload doc and remove when final version', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			caseDetailsPage.clickAddAdditionalDocs();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.checkFileNameDisplays(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAdditonalDocsAppellantCase(sampleFiles.document);
			caseDetailsPage.clickManageAdditionalDocs();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.checkCorrectAnswerDisplays('Version', '1');
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkAdditonalDocsAppellantCase('No documents available');
		});
	});

	it('remove doc when not final version', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			caseDetailsPage.clickAddAdditionalDocs();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.checkFileNameDisplays(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAdditonalDocsAppellantCase(sampleFiles.document);
			caseDetailsPage.clickManageAdditionalDocs();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.img);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickManageAdditionalDocs();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.checkCorrectAnswerDisplays('Version', '2');
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'Redacted');
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkAdditonalDocsAppellantCase(sampleFiles.document);
			caseDetailsPage.clickManageAdditionalDocs();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.checkCorrectAnswerDisplays('Version', '1');
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'No redaction required');
		});
	});

	it('rename an uploaded file', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.changeFileManageDocuments('Name');
			caseDetailsPage.fillInput('new-file.doc', 1);
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Document filename updated');
		});
	});
});
