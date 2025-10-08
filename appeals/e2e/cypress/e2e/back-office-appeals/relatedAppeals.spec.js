// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppellantCasePage } from '../../page_objects/caseDetails/appellantCasePage.js';
import { LpaqPage } from '../../page_objects/caseDetails/lpaqPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { horizonTestAppeals } from '../../support/horizonTestAppeals.js';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const appellantCasePage = new AppellantCasePage();
const lpaqPage = new LpaqPage();

describe('related appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('relate an unrelated appeal to an unrelated appeal', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToLink) => {
				happyPathHelper.assignCaseOfficer(caseObj);
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			});
		});
	});

	it('relate an unrelated appeal to a related appeal', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((firstcaseObjToLink) => {
				cy.createCase().then((secondcaseObjToLink) => {
					happyPathHelper.assignCaseOfficer(caseObj);
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(firstcaseObjToLink.reference);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, relate this appeal to ' + caseObj.reference
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
					caseDetailsPage.clickAddRelatedAppeals();
					caseDetailsPage.fillInput(secondcaseObjToLink.reference);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(
						'Yes, relate this appeal to ' + caseObj.reference
					);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
				});
			});
		});
	});

	it('relate a BO appeal to a Horizon appeal', () => {
		const horizonAppealId =
			Cypress.config('apiBaseUrl').indexOf('test') > -1
				? horizonTestAppeals.horizonAppealTest
				: horizonTestAppeals.horizonAppealMock;

		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickAddRelatedAppeals();
			caseDetailsPage.fillInput(horizonAppealId);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
		});
	});

	it('Relate a case in “validation” status to a case in “validation” status', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToLink) => {
				//progress to be related appeal to validation
				happyPathHelper.assignCaseOfficer(caseObjToLink); //move case to validation
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				//related appeal in validation status
				happyPathHelper.assignCaseOfficer(caseObj);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			});
		});
	});

	it('Relate a case in “validation” status to a case in “final comments” status', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase({ caseType: 'W' }).then((caseObjToLink) => {
				//progress to be related appeal to final comments
				cy.addLpaqSubmissionToCase(caseObjToLink);
				happyPathHelper.assignCaseOfficer(caseObjToLink);
				happyPathHelper.reviewAppellantCase(caseObjToLink);
				happyPathHelper.startS78Case(caseObjToLink, 'written');
				happyPathHelper.reviewLPaStatement(caseObjToLink);
				caseDetailsPage.checkStatusOfCase('Final comments', 0);
				//related appeal in validation status
				happyPathHelper.assignCaseOfficer(caseObj);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			});
		});
	});

	it('Relate a case in “validation” status to a case in “ready to set up hearing” status', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase({ caseType: 'W' }).then((caseObjToLink) => {
				//progress to be related appeal to final comments
				cy.addLpaqSubmissionToCase(caseObjToLink);
				happyPathHelper.assignCaseOfficer(caseObjToLink);
				happyPathHelper.reviewAppellantCase(caseObjToLink);
				happyPathHelper.startS78Case(caseObjToLink, 'hearing');
				happyPathHelper.reviewLPaStatement(caseObjToLink);
				caseDetailsPage.checkStatusOfCase('Hearing ready to set up', 0);
				//related appeal in validation status
				happyPathHelper.assignCaseOfficer(caseObj);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			});
		});
	});

	it('Relate a case in “issue decision status” to “Issue decision” status', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToLink) => {
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseObjToLink);
				happyPathHelper.assignCaseOfficer(caseObjToLink);
				happyPathHelper.reviewAppellantCase(caseObjToLink);
				happyPathHelper.startCase(caseObjToLink);
				happyPathHelper.reviewLpaq(caseObjToLink);
				happyPathHelper.progressSiteVisit(caseObjToLink);
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseObj);
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startCase(caseObj);
				happyPathHelper.reviewLpaq(caseObj);
				happyPathHelper.progressSiteVisit(caseObj);
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			});
		});
	});

	it('Relate a case in “Statement” status to “Issue decision” status', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			cy.createCase().then((caseObjToLink) => {
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseObjToLink);
				happyPathHelper.assignCaseOfficer(caseObjToLink);
				happyPathHelper.reviewAppellantCase(caseObjToLink);
				happyPathHelper.startCase(caseObjToLink);
				happyPathHelper.reviewLpaq(caseObjToLink);
				happyPathHelper.progressSiteVisit(caseObjToLink);
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				//progress to be related appeal to issue decision
				cy.addLpaqSubmissionToCase(caseObj);
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startS78Case(caseObj, 'written');
				happyPathHelper.reviewS78Lpaq(caseObj);
				caseDetailsPage.checkStatusOfCase('Statements', 0);
				caseDetailsPage.clickAddRelatedAppeals();
				caseDetailsPage.fillInput(caseObjToLink.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes, relate this appeal to ' + caseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateBannerMessage('Success', 'Related appeal added');
			});
		});
	});

	it('Relating a case from the "appellant case" page', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((relatedCase) => {
				happyPathHelper.assignCaseOfficer(relatedCase);
				happyPathHelper.assignCaseOfficer(caseObj);

				//navigate to appellant case
				caseDetailsPage.clickReviewAppellantCase();
				appellantCasePage.clickAddRelatedAppeals();

				//related appeals
				appellantCasePage.fillInput(relatedCase.reference);
				appellantCasePage.clickButtonByText('Continue');
				appellantCasePage.selectRadioButtonByValue('yes');
				appellantCasePage.clickButtonByText('Continue');

				//appellant case
				caseDetailsPage.assertRelatedAppealValue(relatedCase.reference);
				appellantCasePage.validateBannerMessage('Success', 'Related appeal added');
				appellantCasePage.clickBackLink();

				//case details
				caseDetailsPage.assertRelatedAppealValue(relatedCase.reference);
			});
		});
	});

	it('Relating a case from the "LPAQ" page', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((relatedCase) => {
				happyPathHelper.assignCaseOfficer(relatedCase);
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startCase(caseObj);
				cy.addLpaqSubmissionToCase(caseObj);
				happyPathHelper.reviewLpaq(caseObj);

				//navigate to LPAQ
				caseDetailsPage.clickViewLpaQuestionnaire();

				//related appeals
				lpaqPage.clickAddRelatedAppeals();
				lpaqPage.fillInput(relatedCase.reference);
				lpaqPage.clickButtonByText('Continue');
				lpaqPage.selectRadioButtonByValue('yes');
				lpaqPage.clickButtonByText('Continue');

				//LPAQ details
				caseDetailsPage.assertRelatedAppealValue(relatedCase.reference);
				lpaqPage.validateBannerMessage('Success', 'Related appeal added');
				lpaqPage.clickBackLink();

				//case details
				caseDetailsPage.assertRelatedAppealValue(relatedCase.reference);
			});
		});
	});

	it('related appeals error messaging', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.clickAddRelatedAppeals();

			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.checkErrorMessageDisplays('Enter the appeal reference number');

			assertErrorForInput('AAA', 'Appeal reference number must be 7 numbers');
			assertErrorForInput('12345678', 'Appeal reference number must be 7 numbers');
			assertErrorForInput('A&JIOPH', 'Enter appeal reference number using numbers 0 to 9');
		});
	});

	const assertErrorForInput = (input, expectedError) => {
		caseDetailsPage.fillInput(input);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.checkErrorMessageDisplays(expectedError);
	};
});
