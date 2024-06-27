// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppealsListPage } from '../../page_objects/appealsListPage';
import { urlPaths } from '../../support/urlPaths';

const page = new AppealsListPage();
describe('Appeals feature', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin); // TODO Does this need to occur before each? or just before?
	});

	it('Case officer should be able to assign themselves to a case using name search', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			page.clickAppealByRef(caseRef);
			page.clickAssignCaseOfficer();
			page.nationalListSearch('case');
			page.basePageElements.summaryListValue('caseteamofficer.test@planninginspectorate.gov.uk');
			page.clickLinkByText('Choose');
			page.selectRadioButtonByValue('Yes');
			page.clickButtonByText('Continue');
			page.validateBannerMessage('Case officer has been assigned');
			page.checkAnswerSummaryValue('caseteamofficer.test@planninginspectorate.gov.uk');
		});
	});

	it('Inspector should be able to assign themselves to a case using name search', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			page.clickAppealByRef(caseRef);
			page.clickAssignInspector();
			page.nationalListSearch('test');
			page.basePageElements.summaryListValue('inspectorappeals.test@planninginspectorate.gov.uk');
			page.clickLinkByText('Choose');
			page.selectRadioButtonByValue('Yes');
			page.clickButtonByText('Continue');
			page.validateBannerMessage('Success', 'Inspector has been assigned');
			page.checkAnswerSummaryValue('inspectorappeals.test@planninginspectorate.gov.uk');
		});
	});

	it('Case officer should be able to change assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			page.clickAppealByRef(caseRef);
			page.clickAssignCaseOfficer();
			page.nationalListSearch('Rachel');
			page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
			page.clickLinkByText('Choose');
			page.selectRadioButtonByValue('Yes');
			page.clickButtonByText('Continue');
			page.validateBannerMessage('Success', 'Case officer has been assigned');

			// TODO Fix this
			// page.checkAnswerSummaryValue('Rachel HarveyRachel.Harvey@planninginspectorate.gov.uk');
		});
	});

	it('Inspector should be able to change assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			page.clickAppealByRef(caseRef);
			page.clickAssignInspector();
			page.nationalListSearch('Rachel');
			page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
			page.clickLinkByText('Choose');
			page.selectRadioButtonByValue('Yes');
			page.clickButtonByText('Continue');
			page.validateBannerMessage('Success', 'Inspector has been assigned');
			page.checkAnswerSummaryValue('Rachel.Harvey@planninginspectorate.gov.uk');
		});
	});

	it.skip('Case officer should be able to remove assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			page.clickAppealByRef(caseRef);
			page.clickAssignCaseOfficer();
			page.basePageElements.summaryListValue('rachel.harvey@planninginspectorate.gov.uk');
			page.clickLinkByText('Remove');
			page.selectRadioButtonByValue('Yes');
			page.clickButtonByText('Continue');
			page.selectRadioButtonByValue('No');
			page.clickButtonByText('Continue');
			page.validateBannerMessage('Case officer has been removed');
			page.checkValueIsBlank(15);
		});
	});

	it.skip('Inspector should be able to remove assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			page.clickAppealByRef(caseRef);
			page.clickAssignInspector();
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
});
