// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { EvidenceReasonsSection } from '../../page_objects/evidenceReasonsSection.js';
import { FileUploaderSection } from '../../page_objects/fileUploadSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { ReviewEvidenceSection } from '../../page_objects/reviewEvidenceSection.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';
import { urlPaths } from '../../support/urlPaths.js';

const cyaSection = new CYASection();
const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const fileUploaderSection = new FileUploaderSection();
const reviewEvidenceSection = new ReviewEvidenceSection();
const evidenceReasonsSection = new EvidenceReasonsSection();
const documentationSectionPage = new DocumentationSectionPage();

describe('manage docs on appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const setupInquiry = (caseRef, inquiryDate) => {
		// require case to be started as inquiry to access appellant POE evidence e.g.
		cy.addInquiryViaApi(caseRef, inquiryDate);
		happyPathHelper.assignCaseOfficer(caseRef);
		happyPathHelper.reviewAppellantCase(caseRef);
		happyPathHelper.startS78InquiryCase(caseRef, 'inquiry');
	};

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
	});

	it(
		'can upload appellant proof of evidence and witness to inquiry case',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseRef) => {
				cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
					// require case to be started as inquiry to access appellant POE evidence
					setupInquiry(caseRef, inquiryDate);

					// find case and open inqiiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseRef);

					// navigate to file upload view, upload file and verify uploaded
					documentationSectionPage.selectAddDocument('appellant-proofs-evidence');
					fileUploaderSection.uploadFile(sampleFiles.document);
					fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

					//naviagte to review/confirm page
					caseDetailsPage.clickButtonByText('Continue');
					// check for lpa heading
					caseDetailsPage.validateSectionHeader(
						'Check details and add appellant proof of evidence and witnesses'
					);
					caseDetailsPage.clickButtonByText('Add appellant proof of evidence and witness');

					// check page header and success banner
					caseDetailsPage.validateSectionHeader('Review appellant proof of evidence and witnesses');
					caseDetailsPage.validateBannerMessage(
						'Success',
						'Appellant proof of evidence and witnesses added'
					);
				});
			});
		}
	);

	it(
		'upload appellant proof of evidence and witness - proceed without uploading file',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseRef) => {
				cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
					// require case to be started as inquiry to access appellant POE evidence
					setupInquiry(caseRef, inquiryDate);

					// find case and open inqiiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseRef);

					// navigate to file upload view, proceed without uploading file
					documentationSectionPage.selectAddDocument('appellant-proofs-evidence');
					caseDetailsPage.clickButtonByText('Continue');

					// verify error message
					fileUploaderSection.verifyErrorMessages({
						messages: ['Select the Proof of evidence and witness'],
						fields: ['upload-file-button-1']
					});
				});
			});
		}
	);*/

	it(
		'can mark appellant proof of evidence as incomplete and select reason',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseRef) => {
				cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
					// require case to be started as inquiry to access appellant POE evidence
					setupInquiry(caseRef, inquiryDate);

					// find case and open inqiiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseRef);

					// navigate to file upload view, upload file and verify uploaded
					documentationSectionPage.selectAddDocument('appellant-proofs-evidence');
					fileUploaderSection.uploadFile(sampleFiles.document);
					fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

					//naviagte to review/confirm page
					fileUploaderSection.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add appellant proof of evidence and witness');

					// set review as incomplete and select reason
					reviewEvidenceSection.selectEvidenceReviewOption('Mark as incomplete');
					reviewEvidenceSection.clickButtonByText('Continue');

					// check that that should not be any preselected options
					evidenceReasonsSection.verifyNumberOfSelectedReasons(0);

					// select reason and proceed to check answers page
					evidenceReasonsSection.selectEvidenceReasonOptions(['Contains links to web pages']);
					evidenceReasonsSection.clickButtonByText('Continue');

					// check address is correct
					cyaSection.verifyAnswerUpdated({
						field: cyaSection.cyaSectionFields.reasonForRejectAppellantPOE,
						value: 'Contains links to web pages'
					});
				});
			});
		}
	);
});
