// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

const caseDetailsPage = new CaseDetailsPage();

let caseRef;

describe('Capture Net Residences', () => {
	beforeEach(() => {
		setupTestCase();
	});

	it('Net Residence - Net Gain', () => {
		caseDetailsPage.clickAddNetResidence();
		caseDetailsPage.chooseCheckboxByText('Net gain');
		caseDetailsPage.fillInput('5');
		caseDetailsPage.clickButtonByText('Save and return');
		caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added');
		caseDetailsPage.verifyNetResidenceValue('Net gain');
		caseDetailsPage.verifyNetResidenceNumber('5');
	});

	it('Net Residence - Net Loss', () => {
		caseDetailsPage.clickAddNetResidence();
		caseDetailsPage.chooseCheckboxByText('Net loss');
		caseDetailsPage.fillInput('5', 1);
		caseDetailsPage.clickButtonByText('Save and return');
		caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added');
		caseDetailsPage.verifyNetResidenceValue('Net loss');
		caseDetailsPage.verifyNetResidenceNumber('5');
	});

	it('Net Residence - No Change', () => {
		caseDetailsPage.clickAddNetResidence();
		caseDetailsPage.chooseCheckboxByText('No change in number of residential units');
		caseDetailsPage.clickButtonByText('Save and return');
		caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added');
		caseDetailsPage.verifyNetResidenceValue('No change to number of residential units');
	});

	it('Net Residence - Personal List', () => {
		happyPathHelper.assignCaseOfficer(caseRef);
		cy.visit(urlPaths.personalListFilteredValidation);
		caseDetailsPage.verifyActionOnPersonalListPage(caseRef, 'Add number of residential units');
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);

		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseRef = ref;
			happyPathHelper.viewCaseDetails(caseRef);
		});
	};
});
