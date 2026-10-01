// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { FileDateAndRedactionStatusComponent } from '../../page_objects/fileDateAndRedactionStatusComponent.js';
import { FileUploader } from '../../page_objects/shared.js';
import { CTA_TEXT, HEADINGS } from '../../support/consts.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();
const fileUploader = new FileUploader();
const documentationSectionPage = new DocumentationSectionPage();
const fileDateAndRedactionStatusComponent = new FileDateAndRedactionStatusComponent();
const cyaSection = new CYASection();

let sampleFiles = fileUploader.sampleFiles;

describe('Manually Add a rep', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;

	it('Manually Add LPA Statement', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			//Move Case to Statement Status
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'EN');

			//Ensure no option availible
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA statement',
				'Awaiting statement'
			);

			//Elapse Deadline and manually add lpa statement
			cy.simulateStatementsDeadlineElapsed(caseObj);
			documentationSectionPage.addDocumentFromRow('LPA statement');
			happyPathHelper.uploadRepresentation({ fileName: sampleFiles.document2 });

			caseDetailsPage.validateBannerMessage('Success', 'LPA statement added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA statement',
				'Accepted'
			);
			caseDetailsPage.shareStatements();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA statement',
				'Shared'
			);
		});
	});

	it('Manually Add IP Comments', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			//Move Case to Statement Status
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78');

			//Ensure no option availible
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'Interested party comments',
				'Awaiting interested party comments'
			);
			//Elapse Deadline
			cy.simulateStatementsDeadlineElapsed(caseObj);

			// navigate to the documentation section and click the "Add" button for the "Interested party comments" row
			documentationSectionPage.addDocumentFromRow('Interested party comments');
			caseDetailsPage.fillInput('Test', 0);
			caseDetailsPage.fillInput('Test', 1);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');

			// manually add an interested party comment
			happyPathHelper.uploadRepresentation({
				fileName: sampleFiles.document2,
				cyaHeading: HEADINGS.cya.ipComment,
				cyaCTAText: CTA_TEXT.documents.addComment,
				cyaFileNameField: cyaSection.cyaSectionFields.ipCommentFile
			});

			caseDetailsPage.validateBannerMessage('Success', 'Interested party comment added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'Interested party comments',
				'Ready to review'
			);
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Action',
				'Interested party comments',
				'Review interested party comments'
			);
		});
	});

	it('Manually Add LPA Final Comments', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			//Move Case to Statement Status
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'FINAL_COMMENTS', 'S78');

			//Ensure no option availible
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA final comments',
				'Awaiting final comments'
			);

			//Elapse Deadline and manually add lpa comment
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			documentationSectionPage.addDocumentFromRow('LPA final comments');
			happyPathHelper.uploadRepresentation({ fileName: sampleFiles.document2 });

			caseDetailsPage.validateBannerMessage('Success', 'LPA final comments added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA final comments',
				'Accepted'
			);
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Action',
				'LPA final comments',
				'View LPA final comments'
			);
			caseDetailsPage.shareFinalComments();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA final comments',
				'Shared'
			);
		});
	});

	it('Manually Add Appellant Final Comments', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			//Move Case to Statement Status
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'FINAL_COMMENTS', 'S78');

			//Ensure no option availible
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA final comments',
				'Awaiting final comments'
			);

			//Elapse Deadline and manually add appellant comment
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			documentationSectionPage.addDocumentFromRow('Appellant final comments');
			happyPathHelper.uploadRepresentation({ fileName: sampleFiles.document2 });

			caseDetailsPage.validateBannerMessage('Success', 'Appellant final comments added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'Appellant final comments',
				'Accepted'
			);
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Action',
				'Appellant final comments',
				'View Appellant final comments'
			);
			caseDetailsPage.shareFinalComments();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'Appellant final comments',
				'Shared'
			);
		});
	});
});
