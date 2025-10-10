// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Case History - Assign, validate, amend docs, update appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(
		'view case history after assigning a case officer and validating a case',
		{ tags: tag.smoke },
		() => {
			let dueDate = new Date();
			let officer;

			cy.createCase().then((caseObj) => {
				appeal = caseObj;
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);

				caseDetailsPage.getCaseOfficer().then((name) => {
					officer = name;
					caseDetailsPage.clickViewCaseHistory();
					caseDetailsPage.verifyTableCellTextCaseHistory(officer + ' was added to the team');
				});
				caseDetailsPage.verifyTableCellTextCaseHistory('Case progressed to validation');
			});
		}
	);

	it(
		'view case history after amending a document and updating the appellant case',
		{ tags: tag.smoke },
		() => {
			let dueDate = new Date();

			cy.createCase().then((caseObj) => {
				appeal = caseObj;
				happyPathHelper.manageDocsAppellantCase(caseObj);
				caseDetailsPage.clickChangeSiteOwnership();
				caseDetailsPage.selectRadioButtonByValue('Owns some of the land');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Site ownership updated');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.clickViewCaseHistory();
				caseDetailsPage.verifyTableCellTextCaseHistory(
					`Document sample-file.doc uploaded (version 1, no redaction required)`
				);
				caseDetailsPage.verifyTableCellTextCaseHistory('updated to Partially owned');
			});
		}
	);
});
