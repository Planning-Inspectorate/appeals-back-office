// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Case History - Assign, validate, amend docs, update appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it(
		'view case history after assigning a case officer and validating a case',
		{ tags: tag.smoke },
		() => {
			let dueDate = new Date();

			cy.createCase().then((caseRef) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				caseDetailsPage.clickAccordionByButton('Case management');
				caseDetailsPage.clickLinkByText('View');
				caseDetailsPage.verifyTableCellTextCaseHistory(
					users.appeals.caseAdmin.email + ' was added to the team'
				);
				caseDetailsPage.verifyTableCellTextCaseHistory('The case has progressed to validation');
			});
		}
	);

	it.only(
		'view case history after amending a document and updating the appellant case',
		{ tags: tag.smoke },
		() => {
			let dueDate = new Date();

			cy.createCase().then((caseRef) => {
				happyPathHelper.manageDocsAppellantCase(caseRef);
				caseDetailsPage.clickChangeSiteOwnership();
				caseDetailsPage.selectRadioButtonByValue('Partially owned by appellant');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Site ownership updated');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.clickAccordionByButton('Case management');
				caseDetailsPage.clickLinkByText('View');
				caseDetailsPage.verifyTableCellTextCaseHistory(
					'Document sample-file.doc uploaded (version 2)'
				);
				caseDetailsPage.verifyTableCellTextCaseHistory('Site ownership updated');
			});
		}
	);
});