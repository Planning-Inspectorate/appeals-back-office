// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { FileUploader } from '../../page_objects/shared.js';
import { CTA_TEXT } from '../../support/consts.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();
const documentationSectionPage = new DocumentationSectionPage();
const fileUploader = new FileUploader();
const pdf = [fileUploader.sampleFiles.pdf];
const caseHistoryPage = new CaseHistoryPage();

describe('Create Test Data', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Hearing Document Upload', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'LPA_QUESTIONNAIRE',
				'S78',
				'HEARING'
			);
			documentationSectionPage.addDocumentFromRow('Hearing documents');
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing document added');
			documentationSectionPage.manageDocumentFromRow('Hearing documents');
			caseDetailsPage.clickLinkByText(CTA_TEXT.documents.manageShare);
			caseDetailsPage.clickButtonByText('Share document');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm and share document');
			caseDetailsPage.validateBannerMessage('Success', 'Document shared');
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue(
				'Document test.pdf uploaded (version 1, no redaction required)'
			);
		});
	});

	it('Inquiry Document Upload', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'LPA_QUESTIONNAIRE',
				'S78',
				'INQUIRY'
			);
			documentationSectionPage.addDocumentFromRow('Inquiry documents');
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Inquiry document added');
			documentationSectionPage.manageDocumentFromRow('Inquiry documents');
			caseDetailsPage.clickLinkByText(CTA_TEXT.documents.manageShare);
			caseDetailsPage.clickButtonByText('Share document');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm and share document');
			caseDetailsPage.validateBannerMessage('Success', 'Document shared');
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue(
				'Document test.pdf uploaded (version 1, no redaction required)'
			);
		});
	});

	it('Inquiry event Document Upload', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'LPA_QUESTIONNAIRE',
				'S78',
				'INQUIRY'
			);
			documentationSectionPage.addDocumentFromRow('Inquiry event documents');
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Inquiry event document added');
			documentationSectionPage.manageDocumentFromRow('Inquiry event documents');
			caseDetailsPage.clickLinkByText(CTA_TEXT.documents.manageShare);
			caseDetailsPage.clickButtonByText('Share document');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm and share document');
			caseDetailsPage.validateBannerMessage('Success', 'Document shared');
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue(
				'Document test.pdf uploaded (version 1, no redaction required)'
			);
		});
	});

	it('Supporting Document Upload', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'LPA_QUESTIONNAIRE',
				'S78',
				'SUPPORTING'
			);
			documentationSectionPage.addDocumentFromRow('Supporting documents');
			fileUploader.uploadFiles(pdf);
			fileUploader.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Success', 'Supporting document added');
			documentationSectionPage.manageDocumentFromRow('Supporting documents');
			caseDetailsPage.clickLinkByText(CTA_TEXT.documents.manageShare);
			caseDetailsPage.clickButtonByText('Share document');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm and share document');
			caseDetailsPage.validateBannerMessage('Success', 'Document shared');
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue(
				'Document test.pdf uploaded (version 1, no redaction required)'
			);
		});
	});
});
