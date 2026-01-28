// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { FileUploader } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const fileUploader = new FileUploader();
const document = fileUploader.sampleFiles.document;
const withdrawalDate = new Date();

let appeal;

const setupTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase().then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(appeal, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
	});
};

describe('Cancel an appeal', () => {
	beforeEach(() => {
		setupTestCase();
	});

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Withdraw appeal', () => {
		caseDetailsPage.clickLinkByText('Cancel appeal');
		caseDetailsPage.selectRadioButtonByValue('Request to withdraw appeal');
		caseDetailsPage.clickButtonByText('Continue');
		fileUploader.uploadFiles(document);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Withdraw appeal');
		caseDetailsPage.validateConfirmationPanelMessage('Success', 'Appeal withdrawn');
		caseDetailsPage.checkStatusOfCase('Withdrawn', 0);
	});

	it('Invalid appeal', () => {
		caseDetailsPage.clickLinkByText('Cancel appeal');
		caseDetailsPage.selectRadioButtonByValue('Appeal invalid');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.chooseCheckboxByText('Documents have not been submitted on time');
		caseDetailsPage.chooseCheckboxByText('Other reason');
		caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384!', 0);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Mark appeal as invalid');
		caseDetailsPage.validateConfirmationPanelMessage('Success', 'Appeal marked as invalid');
		caseDetailsPage.checkStatusOfCase('Invalid', 0);
	});
});
