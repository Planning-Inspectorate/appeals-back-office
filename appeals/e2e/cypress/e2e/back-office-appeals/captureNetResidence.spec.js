// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { NetResidencePage } from '../../page_objects/caseDetails/netResidencePage.js';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();
const netResidencePage = new NetResidencePage();
const overviewSectionPage = new OverviewSectionPage();

let caseObj;

describe('Capture Net Residences', () => {
	beforeEach(() => {
		setupTestCase();
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	const overviewDetails = {
		appealType: 'Planning appeal',
		applicationReference: '123',
		appealProcedure: 'Written',
		allocationLevel: 'No allocation level for this appeal',
		linkedAppeals: 'No linked appeals',
		relatedAppeals: 'No',
		netGainResidential: 'Not provided'
	};

	it('Net Residence - Net Gain', () => {
		overviewSectionPage.verifyCaseOverviewDetails(overviewDetails);
		netResidencePage.clickAddNetResidence();
		caseDetailsPage.chooseCheckboxByText('Net gain');
		caseDetailsPage.fillInput('5');
		caseDetailsPage.clickButtonByText('Save and return');
		caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added');
		netResidencePage.verifyNetResidenceValue('Net gain');
		netResidencePage.verifyNetResidenceNumber('5');
	});

	it('Net Residence - Net Loss', () => {
		overviewSectionPage.verifyCaseOverviewDetails(overviewDetails);
		netResidencePage.clickAddNetResidence();
		caseDetailsPage.chooseCheckboxByText('Net loss');
		caseDetailsPage.fillInput('5', 1);
		caseDetailsPage.clickButtonByText('Save and return');
		caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added');
		netResidencePage.verifyNetResidenceValue('Net loss');
		netResidencePage.verifyNetResidenceNumber('5');
	});

	it('Net Residence - No Change', () => {
		overviewSectionPage.verifyCaseOverviewDetails(overviewDetails);
		netResidencePage.clickAddNetResidence();
		caseDetailsPage.chooseCheckboxByText('No change in number of residential units');
		caseDetailsPage.clickButtonByText('Save and return');
		caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added');
		netResidencePage.verifyNetResidenceValue('No change to number of residential units');
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);

		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseObj = ref;
			appeal = caseObj;
			happyPathHelper.viewCaseDetails(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
		});
	};
});
