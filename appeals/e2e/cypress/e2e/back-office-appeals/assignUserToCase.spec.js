// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppealsListPage } from '../../page_objects/appealsListPage';
import { urlPaths } from '../../support/url-paths.js';

const page = new AppealsListPage();
describe('Appeals feature', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Case officer should be able to assign themselves to a case using name search', () => {
		cy.visit(urlPaths.appealsList);
		page.clickAppealByRef('6000054'); // TODO Change to use page.clickAppealByRef(ref)
		page.clickCaseOfficer();
		page.nationalListSearch('case'); // Doesn't work locally
		page.basePageElements.summaryListValue('caseteamofficer.test@planninginspectorate.gov.uk');
		page.clickLinkByText('Choose');
		page.selectRadioButtonByValue('Yes');
		page.clickButtonByText('Continue');
		page.validateBannerMessage('Case officer has been assigned');
		page.checkAnswerSummaryValue('caseteamofficer.test@planninginspectorate.gov.uk');
	});

	it('Inspector should be able to assign themselves to a case using name search', () => {
		cy.visit(urlPaths.appealsList);
		page.clickAppealFromList(18); // TODO Change to use page.clickAppealByRef(ref)
		page.clickInspector();
		page.nationalListSearch('test');
		page.basePageElements.summaryListValue('inspectorappeals.test@planninginspectorate.gov.uk');
		page.clickLinkByText('Choose');
		page.selectRadioButtonByValue('Yes');
		page.clickButtonByText('Continue');
		page.validateBannerMessage('Inspector has been assigned');
		page.checkAnswerSummaryValue('inspectorappeals.test@planninginspectorate.gov.uk');
	});

	it('Case officer should be able to change assigned user', () => {
		cy.visit(urlPaths.appealsList);
		page.clickAppealFromList(18); // TODO Change to use page.clickAppealByRef(ref)
		page.clickCaseOfficer();
		page.nationalListSearch('Rachel');
		page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
		page.clickLinkByText('Choose');
		page.selectRadioButtonByValue('Yes');
		page.clickButtonByText('Continue');
		page.validateBannerMessage('Case officer has been assigned');
		page.checkAnswerSummaryValue('Rachel HarveyRachel.Harvey@planninginspectorate.gov.uk');
	});

	it('Inspector should be able to change assigned user', () => {
		cy.visit(urlPaths.appealsList);
		page.clickAppealFromList(18); // TODO Change to use page.clickAppealByRef(ref)
		page.clickInspector();
		page.nationalListSearch('Rachel');
		page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
		page.clickLinkByText('Choose');
		page.selectRadioButtonByValue('Yes');
		page.clickButtonByText('Continue');
		page.validateBannerMessage('Inspector has been assigned');
		page.checkAnswerSummaryValue('Rachel.Harvey@planninginspectorate.gov.uk');
	});
	it('Case officer should be able to remove assigned user', () => {
		cy.visit(urlPaths.appealsList);
		page.clickAppealFromList(18); // TODO Change to use page.clickAppealByRef(ref)
		page.clickCaseOfficer();
		page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
		page.clickLinkByText('Remove');
		page.selectRadioButtonByValue('Yes');
		page.clickButtonByText('Continue');
		page.selectRadioButtonByValue('No');
		page.clickButtonByText('Continue');
		page.validateBannerMessage('Case officer has been removed');
		page.checkValueIsBlank(15);
	});

	it('Inspector should be able to remove assigned user', () => {
		cy.visit(urlPaths.appealsList);
		page.clickAppealFromList(18); // TODO Change to use page.clickAppealByRef(ref)
		page.clickInspector();
		page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
		page.clickLinkByText('Remove');
		page.selectRadioButtonByValue('Yes');
		page.clickButtonByText('Continue');
		page.selectRadioButtonByValue('No');
		page.clickButtonByText('Continue');
		page.validateBannerMessage('Inspector has been removed');
		page.checkValueIsBlank(16);
	});
});
