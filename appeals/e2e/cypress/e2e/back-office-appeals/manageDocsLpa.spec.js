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

describe('Manage docs on lpa case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	const setupInquiry = (caseObj, inquiryDate) => {
		// require case to be started as inquiry to access appellant POE evidence e.g.
		cy.addInquiryViaApi(caseObj, inquiryDate);
		happyPathHelper.assignCaseOfficer(caseObj);
		happyPathHelper.reviewAppellantCase(caseObj);
		happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');
	};

	let sampleFiles = caseDetailsPage.sampleFiles;
	it('add a doc and then remove on file upload page', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.clickAddNotifyingParties();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.checkFileNameDisplays(sampleFiles.document);
			caseDetailsPage.clickRemoveFileUpload(sampleFiles.document);
			caseDetailsPage.checkFileNameRemoved(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkErrorMessageDisplays('Select the file');
		});
	});

	it('remove a doc when not the last version', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			happyPathHelper.uploadDocsLpaq();
			happyPathHelper.uploadDocVersionLpaq();
			caseDetailsPage.clickManageNotifyingParties();
			cy.reloadUntilVirusCheckComplete();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document3);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage(
				'Success',
				'Who was notified about the application updated'
			);
			happyPathHelper.removeDocLpaq();
		});
	});

	it('remove the last version of the document', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			happyPathHelper.uploadDocsLpaq();
			happyPathHelper.removeDocLpaq();
			caseDetailsPage.checkAnswerNotifyingParties(
				'Who did you notify about this application?',
				'No documents'
			);
		});
	});

	it('can upload lpa proof of evidence and witness to inquiry case', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
				appeal = caseObj;
				// require case to be started as inquiry to access appellant POE evidence
				setupInquiry(caseObj, inquiryDate);

				// find case and open inqiiry section
				cy.visit(urlPaths.appealsList);
				listCasesPage.clickAppealByRef(caseObj);

				// navigate to file upload view, upload file and verify uploaded
				documentationSectionPage.selectAddDocument('lpa-proofs-evidence');
				fileUploaderSection.uploadFile(sampleFiles.document);
				fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

				// naviagte to review/confirm page
				caseDetailsPage.clickButtonByText('Continue');
				// check for lpa heading
				caseDetailsPage.validateSectionHeader(
					'Check details and add lpa proof of evidence and witnesses'
				);
				caseDetailsPage.clickButtonByText('Add lpa proof of evidence and witness');

				// check page header and success banner
				caseDetailsPage.validateSectionHeader('Review lpa proof of evidence and witnesses');
				caseDetailsPage.validateBannerMessage(
					'Success',
					'LPA proof of evidence and witnesses added'
				);
			});
		});
	});

	it(
		'upload lpa proof of evidence and witness - proceed without uploading file',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseObj) => {
				cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
					appeal = caseObj;
					// require case to be started as inquiry to access appellant POE evidence
					setupInquiry(caseObj, inquiryDate);

					// find case and open inqiiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseObj);

					// navigate to file upload view, proceed without uploading file
					documentationSectionPage.selectAddDocument('lpa-proofs-evidence');
					caseDetailsPage.clickButtonByText('Continue');

					// verify error message
					fileUploaderSection.verifyErrorMessages({
						messages: ['Select the Proof of evidence and witness'],
						fields: ['upload-file-button-1']
					});
				});
			});
		}
	);

	it('can mark lpa proof of evidence as incomplete and select reason', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
				appeal = caseObj;
				// require case to be started as inquiry to access appellant POE evidence
				setupInquiry(caseRef, inquiryDate);

				// find case and open inquiry section
				cy.visit(urlPaths.appealsList);
				listCasesPage.clickAppealByRef(caseRef);

				// navigate to file upload view, upload file and verify uploaded
				documentationSectionPage.selectAddDocument('lpa-proofs-evidence');
				fileUploaderSection.uploadFile(sampleFiles.document);
				fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

				//naviagte to review/confirm page
				fileUploaderSection.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Add lpa proof of evidence and witness');

				// set review as incomplete and select reason
				reviewEvidenceSection.selectEvidenceReviewOption('Mark as incomplete');
				reviewEvidenceSection.clickButtonByText('Continue');

				// check that should not be any preselected options
				evidenceReasonsSection.verifyNumberOfSelectedReasons(0);

				// select reason and proceed to check answers page
				evidenceReasonsSection.selectAndReturnEvidenceReasonOption().then((selectedOption) => {
					evidenceReasonsSection.clickButtonByText('Continue');

					// check address is correct
					cyaSection.verifyAnswerUpdated({
						field: cyaSection.cyaSectionFields.reasonForRejectLPAPOE,
						value: selectedOption
					});
				});
			});
		});
	});

	it(
		'can mark lpa proof of evidence as incomplete and select other reason',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseObj) => {
				cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
					appeal = caseObj;
					// require case to be started as inquiry to access appellant POE evidence
					setupInquiry(caseRef, inquiryDate);

					// find case and open inquiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseRef);

					// navigate to file upload view, upload file and verify uploaded
					documentationSectionPage.selectAddDocument('lpa-proofs-evidence');
					fileUploaderSection.uploadFile(sampleFiles.document);
					fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

					//naviagte to review/confirm page
					fileUploaderSection.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add lpa proof of evidence and witness');

					// set review as incomplete and select reason
					reviewEvidenceSection.selectEvidenceReviewOption('Mark as incomplete');
					reviewEvidenceSection.clickButtonByText('Continue');

					// check that should not be any preselected options
					evidenceReasonsSection.verifyNumberOfSelectedReasons(0);

					// select other reason and proceed to check answers page
					const otherReason = 'This is another reason';
					evidenceReasonsSection.selectOtherReason(otherReason);
					evidenceReasonsSection.clickButtonByText('Continue');

					// check address is correct
					cyaSection.verifyAnswerUpdated({
						field: cyaSection.cyaSectionFields.reasonForRejectLPAPOE,
						value: otherReason
					});
				});
			});
		}
	);

	it(
		'can mark appellant proof of evidence as incomplete - proceed without select reason',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseObj) => {
				cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
					appeal = caseObj;
					// require case to be started as inquiry to access appellant POE evidence
					setupInquiry(caseRef, inquiryDate);

					// find case and open inquiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseRef);

					// navigate to file upload view, upload file and verify uploaded
					documentationSectionPage.selectAddDocument('lpa-proofs-evidence');
					fileUploaderSection.uploadFile(sampleFiles.document);
					fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

					//naviagte to review/confirm page
					fileUploaderSection.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Add lpa proof of evidence and witness');

					// set review as incomplete and select reason
					reviewEvidenceSection.selectEvidenceReviewOption('Mark as incomplete');
					reviewEvidenceSection.clickButtonByText('Continue');

					// proceed without selecting a reason
					evidenceReasonsSection.clickButtonByText('Continue');

					// verify error message
					evidenceReasonsSection.verifyErrorMessages({
						messages: ['Select why the proof of evidence and witnesses are incomplete'],
						fields: ['rejection-reason']
					});
				});
			});
		}
	);
});
