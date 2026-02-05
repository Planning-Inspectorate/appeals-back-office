// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

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
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'READY_TO_START', 'HAS');
				caseDetailsPage.getCaseOfficer().then((name) => {
					officer = name;
					caseDetailsPage.clickViewCaseHistory();
					caseHistoryPage.verifyCaseHistoryValue(officer + ' was added to the team');
				});
				caseHistoryPage.verifyCaseHistoryValue('Case progressed to validation');
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
				caseHistoryPage.verifyCaseHistoryValue(
					`Document sample-file.doc uploaded (version 1, no redaction required)`
				);
				caseHistoryPage.verifyCaseHistoryValue('updated to Partially owned');
			});
		}
	);
});
