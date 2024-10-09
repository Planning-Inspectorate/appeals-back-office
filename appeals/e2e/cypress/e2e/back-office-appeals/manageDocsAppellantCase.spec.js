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

describe('manage docs on appellant case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('upload new version of document on appellant case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.uploadDocAppellantCase(caseRef);
			cy.reload();
			caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
			caseDetailsPage.clickLinkByText('View and edit');
			caseDetailsPage.clickButtonByText('upload a new version');
			caseDetailsPage.uploadSampleImg();
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Document updated');
		});
	});
});
