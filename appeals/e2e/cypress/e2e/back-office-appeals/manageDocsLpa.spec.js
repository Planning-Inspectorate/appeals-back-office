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
const BULK_UPLOAD_COUNT = 800;
const REPRESENTATIONS_ROW_ID = 'representations-from-other-parties';
const BULK_UPLOAD_FILE_INPUT_SELECTOR = 'input[type="file"][id^="upload-file-"]';
const BULK_UPLOAD_INPUT_TIMEOUT_MS = 60000;
const BULK_UPLOAD_ROW_RENDER_TIMEOUT_MS = 240000;
const BULK_UPLOAD_ROW_POLL_INTERVAL_MS = 2000;

describe('Manage docs on lpa case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	const logBulkUploadDiagnostics = (renderedRowsCount) => {
		return cy
			.url()
			.then((currentUrl) => cy.task('log', `[bulk-upload] current url: ${currentUrl}`))
			.then(() =>
				cy.document().then((document) => {
					const uploader = document.querySelector('.pins-file-upload');
					const uploaderHtmlSnippet = (uploader?.outerHTML || '[no uploader container found]')
						.replace(/\s+/g, ' ')
						.slice(0, 2000);
					return cy.task('log', `[bulk-upload] uploader html snippet: ${uploaderHtmlSnippet}`);
				})
			)
			.then(() =>
				cy.get('@bulkUploadInput').then(($input) => {
					const selectedFileCount = $input[0]?.files?.length ?? 0;
					return cy.task('log', `[bulk-upload] selected input files count: ${selectedFileCount}`);
				})
			)
			.then(() =>
				cy.task('log', `[bulk-upload] rendered rows count at timeout: ${renderedRowsCount}`)
			);
	};

	const waitForBulkUploadRows = (
		expectedRowsCount,
		timeoutMs = BULK_UPLOAD_ROW_RENDER_TIMEOUT_MS
	) => {
		const startedAt = Date.now();

		const pollRows = () => {
			return cy.document().then((document) => {
				const renderedRowsCount = document.querySelectorAll(
					'.pins-file-upload__files-rows > li'
				).length;

				if (renderedRowsCount === expectedRowsCount) {
					return;
				}

				if (Date.now() - startedAt >= timeoutMs) {
					return logBulkUploadDiagnostics(renderedRowsCount).then(() => {
						throw new Error(
							`Timed out waiting for uploaded file rows. Expected: ${expectedRowsCount}, observed: ${renderedRowsCount}, timeout: ${timeoutMs}ms`
						);
					});
				}

				return cy.wait(BULK_UPLOAD_ROW_POLL_INTERVAL_MS).then(pollRows);
			});
		};

		return pollRows();
	};

	const uploadGeneratedBulkFiles = (prefix, count = BULK_UPLOAD_COUNT) => {
		const files = Cypress._.times(count, (index) => {
			const fileNumber = index + 1;
			return {
				contents: Cypress.Buffer.from(`bulk-upload-${prefix}-${fileNumber}`),
				fileName: `${prefix}-${fileNumber}.doc`,
				mimeType: 'application/msword',
				lastModified: Date.now()
			};
		});

		cy.get(BULK_UPLOAD_FILE_INPUT_SELECTOR, { timeout: BULK_UPLOAD_INPUT_TIMEOUT_MS })
			.should(($inputs) => {
				expect($inputs.length).to.be.greaterThan(0, 'bulk upload file input should be present');
			})
			.first()
			.as('bulkUploadInput')
			.should(($input) => {
				expect($input[0]?.isConnected).to.equal(true, 'file input should be attached');
				expect($input[0]?.multiple).to.equal(
					true,
					'bulk upload input should accept multiple files'
				);
			});

		cy.get('@bulkUploadInput').selectFile(files, { force: true });

		cy.get('@bulkUploadInput', { timeout: BULK_UPLOAD_INPUT_TIMEOUT_MS }).should(($input) => {
			expect($input[0]?.files).to.have.length(
				count,
				`file input should contain ${count} selected files`
			);
		});
	};

	const verifyBulkUploadCanContinue = (prefix) => {
		caseDetailsPage.elements.rowAddLink(REPRESENTATIONS_ROW_ID).click();
		caseDetailsPage.validateSectionHeader(
			'Upload the representations from members of the public or other parties'
		);

		uploadGeneratedBulkFiles(prefix);
		waitForBulkUploadRows(BULK_UPLOAD_COUNT);

		cy.intercept('POST', '**/lpa-questionnaire/**/add-documents/**').as('postAddDocuments');
		caseDetailsPage.clickButtonByText('Continue');

		cy.wait('@postAddDocuments').its('response.statusCode').should('eq', 302);
		cy.url().should('include', '/add-document-details/');
		cy.contains(/Sorry.*problem/i).should('not.exist');
	};

	const setupInquiry = (caseObj, inquiryDate) => {
		// require case to be started as inquiry to access appellant POE evidence e.g.
		happyPathHelper.advanceTo(
			caseObj,
			'ASSIGN_CASE_OFFICER',
			'LPA_QUESTIONNAIRE',
			'S78',
			'INQUIRY'
		);
	};

	let sampleFiles = caseDetailsPage.sampleFiles;
	it('add a doc and then remove on file upload page', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
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

	it(
		'allows uploading 800 representations for HAS and continue without service error',
		{ tags: tag.smoke, pageLoadTimeout: 180000 },
		() => {
			cy.createCase().then((caseObj) => {
				appeal = caseObj;
				cy.addLpaqSubmissionToCase(caseObj);
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
				caseDetailsPage.clickReviewLpaq();

				verifyBulkUploadCanContinue('bulk-has-representations');
			});
		}
	);

	it(
		'allows uploading 800 representations for S78 and continue without service error',
		{ tags: tag.smoke, pageLoadTimeout: 180000 },
		() => {
			cy.createCase({ caseType: 'W' }).then((caseObj) => {
				appeal = caseObj;
				cy.addLpaqSubmissionToCase(caseObj);
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
				caseDetailsPage.clickReviewLpaq();

				verifyBulkUploadCanContinue('bulk-s78-representations');
			});
		}
	);

	it('remove a doc when not the last version', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
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
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
			happyPathHelper.uploadDocsLpaq();
			happyPathHelper.removeDocLpaq();
			caseDetailsPage.checkAnswerNotifyingParties(
				"List of neighbours' addresses that you notified about the application",
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
					'Check details and add LPA proof of evidence and witnesses'
				);
				caseDetailsPage.clickButtonByText('Add lpa proof of evidence and witness');

				// check page header and success banner
				caseDetailsPage.validateSectionHeader('Review LPA proof of evidence and witnesses');
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
				setupInquiry(caseObj, inquiryDate);

				// find case and open inquiry section
				cy.visit(urlPaths.appealsList);
				listCasesPage.clickAppealByRef(caseObj);

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
					setupInquiry(caseObj, inquiryDate);

					// find case and open inquiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseObj);

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
					setupInquiry(caseObj, inquiryDate);

					// find case and open inquiry section
					cy.visit(urlPaths.appealsList);
					listCasesPage.clickAppealByRef(caseObj);

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
