// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { urlPaths } from '../../support/urlPaths';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { horizonTestAppeals } from '../../support/horizonTestAppeals.js';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('related appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	// it('relate an unrelated appeal to an unrelated appeal', () => {
	// 	cy.createCase().then((caseRef) => {
	// 		cy.createCase().then((caseRefToLink) => {
	// 			happyPathHelper.assignCaseOfficer(caseRef);
	// 			caseDetailsPage.clickAccordionByButton('Overview');
	// 			caseDetailsPage.clickAddRelatedAppeals();
	// 			caseDetailsPage.fillInput(caseRefToLink);
	// 			caseDetailsPage.clickButtonByText('Continue');
	// 			caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
	// 			caseDetailsPage.clickButtonByText('Continue');
	// 			caseDetailsPage.validateBannerMessage(
	// 				'Success',
	// 				`This appeal is now related to ${caseRefToLink}`
	// 			);
	// 		});
	// 	});
	// });
	// it('relate an unrelated appeal to a related appeal', () => {
	// 	cy.createCase().then((caseRef) => {
	// 		cy.createCase().then((firstCaseRefToLink) => {
	// 			cy.createCase().then((secondCaseRefToLink) => {
	// 				happyPathHelper.assignCaseOfficer(caseRef);
	// 				caseDetailsPage.clickAccordionByButton('Overview');
	// 				caseDetailsPage.clickAddRelatedAppeals();
	// 				caseDetailsPage.fillInput(firstCaseRefToLink);
	// 				caseDetailsPage.clickButtonByText('Continue');
	// 				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
	// 				caseDetailsPage.clickButtonByText('Continue');
	// 				caseDetailsPage.validateBannerMessage(
	// 					'Success',
	// 					`This appeal is now related to ${firstCaseRefToLink}`
	// 				);
	// 				caseDetailsPage.clickAddRelatedAppeals();
	// 				caseDetailsPage.fillInput(secondCaseRefToLink);
	// 				caseDetailsPage.clickButtonByText('Continue');
	// 				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
	// 				caseDetailsPage.clickButtonByText('Continue');
	// 				caseDetailsPage.validateBannerMessage(
	// 					'Success',
	// 					`This appeal is now related to ${secondCaseRefToLink}`
	// 				);
	// 			});
	// 		});
	// 	});
	// });
	// it('relate a BO appeal to a Horizon appeal', () => {
	// 	const horizonAppealId =
	// 		Cypress.config('apiBaseUrl').indexOf('test') > -1
	// 			? horizonTestAppeals.horizonAppealTest
	// 			: horizonTestAppeals.horizonAppealMock;

	// 	cy.createCase().then((caseRef) => {
	// 		happyPathHelper.assignCaseOfficer(caseRef);
	// 		caseDetailsPage.clickAccordionByButton('Overview');
	// 		caseDetailsPage.clickAddRelatedAppeals();
	// 		caseDetailsPage.fillInput(horizonAppealId);
	// 		caseDetailsPage.clickButtonByText('Continue');
	// 		caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
	// 		caseDetailsPage.clickButtonByText('Continue');
	// 		caseDetailsPage.validateBannerMessage(
	// 			'Success',
	// 			`This appeal is now related to ${horizonAppealId}`
	// 		);
	// 	});
	// });
	it('Relate a case in “validation” status to a case in “validation” status', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				//progress to be related appeal to validation
				happyPathHelper.assignCaseOfficer(caseRefToLink); //move case to validation
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				//related appeal in validation status
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					`This appeal is now related to ${caseRefToLink}`
				);
			});
		});
	});

	it('Relate a case in “validation” status to a case in “final comments” status', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase({ caseType: 'W' }).then((caseRefToLink) => {
				//progress to be related appeal to final comments
				cy.addLpaqSubmissionToCase(caseRefToLink);
				happyPathHelper.assignCaseOfficer(caseRefToLink);
				happyPathHelper.reviewAppellantCase(caseRefToLink);
				happyPathHelper.startS78Case(caseRefToLink, 'written');
				happyPathHelper.reviewLPaStatement(caseRefToLink);
				caseDetailsPage.checkStatusOfCase('Final comments', 0);
				//related appeal in validation status
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					`This appeal is now related to ${caseRefToLink}`
				);
			});
		});
	});

	it('Relate a case in “validation” status to a case in “ready to set up hearing” status', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase({ caseType: 'W' }).then((caseRefToLink) => {
				//progress to be related appeal to final comments
				cy.addLpaqSubmissionToCase(caseRefToLink);
				happyPathHelper.assignCaseOfficer(caseRefToLink);
				happyPathHelper.reviewAppellantCase(caseRefToLink);
				happyPathHelper.startS78Case(caseRefToLink, 'hearing');
				happyPathHelper.reviewLPaStatement(caseRefToLink);
				caseDetailsPage.checkStatusOfCase('Hearing ready to set up', 0);
				//related appeal in validation status
				happyPathHelper.assignCaseOfficer(caseRef);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					`This appeal is now related to ${caseRefToLink}`
				);
			});
		});
	});
	it('Relate a case in “issue decision status” to “Issue decision” status', () => {
		cy.createCase().then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseRefToLink);
				happyPathHelper.assignCaseOfficer(caseRefToLink);
				happyPathHelper.reviewAppellantCase(caseRefToLink);
				happyPathHelper.startCase(caseRefToLink);
				happyPathHelper.reviewLpaq(caseRefToLink);
				happyPathHelper.progressSiteVisit(caseRefToLink);
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseRef);
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				happyPathHelper.reviewLpaq(caseRef);
				happyPathHelper.progressSiteVisit(caseRef);
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					`This appeal is now related to ${caseRefToLink}`
				);
			});
		});
	});

	it('Relate a case in “Statement” status to “Issue decision” status', () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			cy.createCase().then((caseRefToLink) => {
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseRefToLink);
				happyPathHelper.assignCaseOfficer(caseRefToLink);
				happyPathHelper.reviewAppellantCase(caseRefToLink);
				happyPathHelper.startCase(caseRefToLink);
				happyPathHelper.reviewLpaq(caseRefToLink);
				happyPathHelper.progressSiteVisit(caseRefToLink);
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseRef);
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startS78Case(caseRef, 'written');
				happyPathHelper.reviewS78Lpaq(caseRef);
				caseDetailsPage.checkStatusOfCase('Statements', 0);
				caseDetailsPage.clickAccordionByButton('Overview');
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseRefToLink);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseRef);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage(
					'Success',
					`This appeal is now related to ${caseRefToLink}`
				);
			});
		});
	});
});
