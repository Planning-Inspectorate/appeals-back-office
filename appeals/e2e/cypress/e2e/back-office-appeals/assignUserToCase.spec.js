// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { urlPaths } from '../../support/urlPaths';
import { tag } from '../../support/tag';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('Assign user to case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it(
		'Case officer should be able to assign themselves to a case using name search',
		{ tags: tag.smoke },
		() => {
			cy.createCase().then((caseRef) => {
				console.log(users.appeals)
				cy.visit(urlPaths.appealsList);
				listCasesPage.clickAppealByRef(caseRef);
				caseDetailsPage.clickAssignCaseOfficer();
				caseDetailsPage.searchForCaseOfficer('case');
				caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
				caseDetailsPage.clickLinkByText('Choose');
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Case officer has been assigned');
				caseDetailsPage.verifyAnswerSummaryValue(users.appeals.caseAdmin.email);
			});
		}
	);

	it(
		'Inspector should be able to assign themselves to a case using name search',
		{ tags: tag.smoke },
		() => {
			cy.createCase().then((caseRef) => {
				cy.visit(urlPaths.appealsList);
				listCasesPage.clickAppealByRef(caseRef);
				caseDetailsPage.clickAssignInspector();
				caseDetailsPage.searchForCaseOfficer('test');
				caseDetailsPage.chooseSummaryListValue(users.appeals.inspector.email);
				caseDetailsPage.clickLinkByText('Choose');
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Inspector has been assigned');
				caseDetailsPage.verifyAnswerSummaryValue(users.appeals.inspector.email);
			});
		}
	);

	it('Case officer should be able to change assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignCaseOfficer();
			caseDetailsPage.searchForCaseOfficer('Rachel');
			caseDetailsPage.chooseSummaryListValue(users.appeals.happyPath.email);
			caseDetailsPage.clickChooseCaseOfficerResult(users.appeals.happyPath.email);
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Case officer has been assigned');
			caseDetailsPage.verifyAnswerSummaryValue(users.appeals.happyPath.email);
		});
	});

	it('Inspector should be able to change assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignInspector();
			caseDetailsPage.searchForCaseOfficer('Rachel');
			caseDetailsPage.chooseSummaryListValue(users.appeals.happyPath.email);
			caseDetailsPage.clickLinkByText('Choose');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Inspector has been assigned');
			caseDetailsPage.verifyAnswerSummaryValue(users.appeals.happyPath.email);
		});
	});

	it.skip('Case officer should be able to remove assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignCaseOfficer();
			caseDetailsPage.chooseSummaryListValue(users.appeals.happyPath.email);
			caseDetailsPage.clickLinkByText('Remove');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Case officer has been removed');
			caseDetailsPage.verifyValueIsBlank(15);
		});
	});

	it.skip('Inspector should be able to remove assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignInspector();
			caseDetailsPage.chooseSummaryListValue(users.appeals.happyPath.email);
			caseDetailsPage.clickLinkByText('Remove');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Inspector has been removed');
			caseDetailsPage.verifyValueIsBlank(16);
		});
	});
});
