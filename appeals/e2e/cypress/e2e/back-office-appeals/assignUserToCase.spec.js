// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { tag } from '../../support/tag';
import { urlPaths } from '../../support/urlPaths';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('Assign user to case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const viewports = [{ name: 'ipad-mini' }, { name: 'samsung-note9' }];

	it(
		'Case officer should be able to assign themselves to a case using name search',
		{ tags: tag.smoke },
		() => {
			cy.createCase().then((caseRef) => {
				console.log(users.appeals);
				cy.visit(urlPaths.appealsList);
				listCasesPage.clickAppealByRef(caseRef);
				caseDetailsPage.clickAssignCaseOfficer();
				caseDetailsPage.searchForCaseOfficer('case');
				caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
				caseDetailsPage.clickButtonByText('Assign case officer');
				caseDetailsPage.validateBannerMessage('Success', 'Case officer assigned');
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
				caseDetailsPage.searchForCaseOfficer('Mctester');
				caseDetailsPage.chooseSummaryListValue(users.appeals.inspector.email);
				caseDetailsPage.clickButtonByText('Assign inspector');
				caseDetailsPage.validateBannerMessage('Success', 'Inspector assigned');
				caseDetailsPage.verifyAnswerSummaryValue(users.appeals.inspector.email);
			});
		}
	);

	it('Case officer should be able to change assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignCaseOfficer();
			caseDetailsPage.searchForCaseOfficer('case');
			caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
			caseDetailsPage.clickButtonByText('Assign case officer');
			caseDetailsPage.validateBannerMessage('Success', 'Case officer assigned');
			caseDetailsPage.verifyAnswerSummaryValue(users.appeals.caseAdmin.email);
		});
	});

	it('Inspector should be able to change assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignInspector();
			caseDetailsPage.searchForCaseOfficer('case');
			caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
			caseDetailsPage.clickButtonByText('Assign inspector');
			caseDetailsPage.validateBannerMessage('Success', 'Inspector assigned');
			caseDetailsPage.verifyAnswerSummaryValue(users.appeals.caseAdmin.email);
		});
	});

	it.skip('Case officer should be able to remove assigned user', () => {
		cy.createCase().then((caseRef) => {
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.clickAssignCaseOfficer();
			caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
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
			caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
			caseDetailsPage.clickLinkByText('Remove');
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Inspector has been removed');
			caseDetailsPage.verifyValueIsBlank(16);
		});
	});

	viewports.forEach((viewport) => {
		it(`should wrap service header text properly on small screens - ${viewport.name}`, () => {
			cy.viewport(viewport.name);
			cy.visit(urlPaths.appealsList);
			listCasesPage.basePageElements.serviceHeader().then(($el) => {
				const initialHeight = $el.height();

				// Compare with a wider viewport
				cy.viewport(1200, 800);
				listCasesPage.basePageElements.serviceHeader().should(($elWide) => {
					expect($elWide.height()).to.be.lessThan(initialHeight * 1.5);
					expect($elWide.text()).to.contains('Manage appeals');
					expect($elWide[0].scrollWidth).to.be.lte($elWide[0].clientWidth);
				});
			});
		});
	});
});
