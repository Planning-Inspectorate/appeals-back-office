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

describe('Upload Documents to appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let sampleFiles = caseDetailsPage.sampleFiles;

	it('Upload documents to appellent case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.clickReviewAppellantCase();
			caseDetailsPage.clickAddAgreementToChangeDescriptionEvidence();
			caseDetailsPage.uploadSampleFile(sampleFiles.document);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.verifyAnswerSummaryValue(sampleFiles.document);
		});
	});
});
