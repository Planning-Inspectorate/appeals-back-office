// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { FileUploader } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();
const fileUploader = new FileUploader();
const documentationSectionPage = new DocumentationSectionPage();

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
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78');
			//Ensure no option availible
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA statement',
				'Awaiting statement'
			);
			//Elapse Deadline and Manually add rep
			cy.simulateStatementsDeadlineElapsed(caseObj);
			documentationSectionPage.selectAddDocument();
			uploadMannuallyAddRep();
			caseDetailsPage.validateBannerMessage('Success', 'LPA statement added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA statement',
				'Shared'
			);
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Action',
				'LPA statement',
				'View LPA statement'
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
			//Elapse Deadline and Manually add rep
			cy.simulateStatementsDeadlineElapsed(caseObj);
			caseDetailsPage.clickAddIpComments();
			caseDetailsPage.fillInput('Test', 0);
			caseDetailsPage.fillInput('Test', 1);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.document2);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Redacted');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Add comment');
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

	it('Manually LPA Add Final Comments', () => {
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
			//Elapse Deadline and Manually add rep
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			caseDetailsPage.clickAddLpaFinalComments();
			uploadMannuallyAddRep();
			caseDetailsPage.validateBannerMessage('Success', 'LPA final comments added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA final comments',
				'Shared'
			);
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Action',
				'LPA final comments',
				'View LPA final comments'
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
			//Elapse Deadline and Manually add rep
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			caseDetailsPage.clickAddLpaFinalComments();
			fileUploader.uploadFiles(sampleFiles.document2);
			uploadMannuallyAddRep();
			caseDetailsPage.validateBannerMessage('Success', 'LPA final comments added');
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'LPA final comments',
				'Shared'
			);
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Action',
				'LPA final comments',
				'View LPA final comments'
			);
		});
	});

	const uploadMannuallyAddRep = () => {
		fileUploader.uploadFiles(sampleFiles.document2);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('Redacted');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Add document');
	};
});
