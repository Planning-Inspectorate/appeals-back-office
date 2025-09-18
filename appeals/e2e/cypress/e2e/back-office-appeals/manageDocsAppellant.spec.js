// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { FileUploader } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const documentationSectionPage = new DocumentationSectionPage();
const fileUploader = new FileUploader();

describe('manage docs on appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;
	/*it('upload new version of document on appellant case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage(
				'Success',
				'Agreement to change description evidence updated'
			);
		});
	});

	it('check correct error response for file upload', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			caseDetailsPage.clickAddAdditionalDocs();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.checkFileNameDisplays(sampleFiles.document);
			caseDetailsPage.clickRemoveFileUpload(sampleFiles.document);
			caseDetailsPage.checkFileNameRemoved(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkErrorMessageDisplays('Select the file');
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
			cy.reloadUntilVirusCheckComplete();
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
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickManageAdditionalDocs();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.checkCorrectAnswerDisplays('Version', '2');
			caseDetailsPage.checkCorrectAnswerDisplays('Redaction status', 'Redacted');
			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkAdditonalDocsAppellantCase(sampleFiles.document);
			caseDetailsPage.clickManageAdditionalDocs();
			cy.reloadUntilVirusCheckComplete();
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
			caseDetailsPage.fillInput('new-file', 1);
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Document filename updated');
		});
	});*/

	it(
		'can upload appellant proof of evidence and witness to inquiry case',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseRef) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startS78InquiryCase(caseRef, 'inquiry', true);

				// find case and open inqiiry section
				//cy.visit(urlPaths.appealsList);
				//listCasesPage.clickAppealByRef(caseRef);

				documentationSectionPage.selectAddDocument('appellant-proofs-evidence');
				fileUploader.uploadFiles(sampleFiles.document);

				/*happyPathHelper.uploadDocAppellantCase(caseRef);
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage(
				'Success',
				'Agreement to change description evidence updated'
			);*/
			});
		}
	);
});
