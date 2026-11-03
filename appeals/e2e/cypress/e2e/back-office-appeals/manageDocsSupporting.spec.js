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
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			caseDetailsPage.clickLinkByText('Review');
			caseDetailsPage.clickIndividualLinkWhenMultiple('Additional documents', 'Add');
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Additional documents added');

			// Simulate the completion of the documents scan
			cy.simulateDocumentsScanComplete(caseObj);

			caseDetailsPage.clickIndividualLinkWhenMultiple('Additional documents', 'Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.document3);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Additional documents updated');

			// Simulate the completion of the documents scan
			cy.simulateDocumentsScanComplete(caseObj);

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
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);
			happyPathHelper.addThirdPartyComment(caseObj, true);
			cy.contains('.govuk-tabs__tab', 'Accepted').click();

			// Simulate the completion of the documents scan
			cy.simulateDocumentsScanComplete(caseObj);

			caseDetailsPage.clickLinkByText('View');
			caseDetailsPage.clickLinkByText('Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.img);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');

			// Simulate the completion of the documents scan
			cy.simulateDocumentsScanComplete(caseObj);

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
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.checkStatusOfCase('Statements', 0);
			happyPathHelper.addThirdPartyComment(caseObj, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addLpaStatement(caseObj);

			// Simulate the elapsing of the statements deadline and the completion of the documents scan
			cy.simulateStatementsDeadlineElapsed(caseObj);
			cy.simulateDocumentsScanComplete(caseObj);

			caseDetailsPage.shareCommentsAndStatements();
			caseDetailsPage.checkStatusOfCase('Final comments', 0);
			cy.loadAppealDetails(caseObj).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				happyPathHelper.addAppellantFinalComment(caseObj, serviceUserId);
			});

			// Simulate the elapsing of the final comments deadline and the completion of the documents scan
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			cy.simulateDocumentsScanComplete(caseObj);

			caseDetailsPage.shareFinalComments();
			caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);
			caseDetailsPage.clickIndividualLinkWhenMultipleTable('Appellant final comments', 'View');
			caseDetailsPage.clickLinkByText('Manage');
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('Upload a new version');
			caseDetailsPage.uploadSampleFile(sampleFiles.img);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');

			// Simulate the elapsing of time for the new version to be processed and the completion of the documents scan
			cy.simulateDocumentsScanComplete(caseObj);

			caseDetailsPage.clickButtonByText('Remove current version');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Supporting document removed');
		});
	});
	it('update redaction status of Final Comments supporting documents', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'FINAL_COMMENTS', 'S78');
			cy.addRepresentation(caseObj, 'lpaFinalComment', null);
			cy.loadAppealDetails(caseObj).then((appealData) => {
				const serviceUserId = ((appealData?.appellant?.serviceUserId ?? 0) + 200000000).toString();
				cy.addRepresentation(caseObj, 'appellantFinalComment', serviceUserId);
			});
			cy.simulateDocumentsScanComplete(caseObj);

			['lpa', 'appellant'].forEach((party) => {
				const name = party === 'lpa' ? 'LPA' : 'appellant';
				const title = Cypress._.upperFirst(name);

				caseDetailsPage.validateBannerMessage(
					'Important',
					`${title} final comments awaiting review`
				);
				cy.getByData(`banner-review-${party}-final-comments`).click();
				caseDetailsPage.validateSectionHeader(`Review ${name} final comments`);
				caseDetailsPage.updateSupportingDocumentRedactionStatus('No redaction required');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.validateSectionHeader('Supporting documents');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.validateSectionHeader(`Review ${name} final comments`);
				caseDetailsPage.selectRadioButtonByValue('Accept final comments');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateSectionHeader(`Check details and accept ${name} final comments`);
				caseDetailsPage.clickButtonByText(`Accept ${name} final comments`);
				caseDetailsPage.validateBannerMessage('Success', `${title} final comments accepted`);

				['Redacted', 'Unredacted'].forEach((redactionStatus) => {
					const viewFinalComments =
						party === 'lpa'
							? caseDetailsPage.elements.viewLpaFinalComments()
							: caseDetailsPage.elements.viewAppellantFinalComments();

					viewFinalComments.click();
					caseDetailsPage.validateSectionHeader(`${title} final comments`);
					caseDetailsPage.updateSupportingDocumentRedactionStatus(redactionStatus);
					happyPathHelper.viewCaseDetails(caseObj);
				});
			});
		});
	});
});
