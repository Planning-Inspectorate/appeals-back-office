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

	let cases = [];

	afterEach(() => {
		cy.deleteAppeals(cases);
	});

	it('relate an unrelated appeal to an unrelated appeal', () => {
		cy.createCase().then((caseObj) => {
			cy.createCase().then((caseObjToLink) => {
				cases = [caseObj, caseObjToLink];
				cy.assignCaseOfficerViaApi(caseObj);
				happyPathHelper.viewCaseDetails(caseObj);
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
					cases = [caseObj, firstcaseObjToLink, secondcaseObjToLink];
					cy.assignCaseOfficerViaApi(caseObj);
					happyPathHelper.viewCaseDetails(caseObj);
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
			cases = [caseObj];
			cy.assignCaseOfficerViaApi(caseObj);
			happyPathHelper.viewCaseDetails(caseObj);
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
				cases = [caseObj, caseObjToLink];
				//progress to be related appeal to validation
				cy.assignCaseOfficerViaApi(caseObjToLink);
				happyPathHelper.viewCaseDetails(caseObjToLink);
				caseDetailsPage.checkStatusOfCase('Validation', 0);
				//related appeal in validation status
				cy.assignCaseOfficerViaApi(caseObj);
				happyPathHelper.viewCaseDetails(caseObj);
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
				cases = [caseObj, caseObjToLink];
				//progress to be related appeal to final comments
				happyPathHelper.advanceTo(caseObjToLink, 'ASSIGN_CASE_OFFICER', 'FINAL_COMMENTS', 'S78');
				caseDetailsPage.checkStatusOfCase('Final comments', 0);
				//related appeal in validation status
				cy.assignCaseOfficerViaApi(caseObj);
				happyPathHelper.viewCaseDetails(caseObj);
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
				cases = [caseObj, caseObjToLink];
				//progress to be related appeal to final comments
				happyPathHelper.advanceTo(
					caseObjToLink,
					'ASSIGN_CASE_OFFICER',
					'EVENT_READY_TO_SETUP',
					'S78'
				);
				caseDetailsPage.checkStatusOfCase('Hearing ready to set up', 0);
				//related appeal in validation status
				cy.assignCaseOfficerViaApi(caseObj);
				happyPathHelper.viewCaseDetails(caseObj);
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
				cases = [caseObj, caseObjToLink];
				//progress to be related appeal to issue decision
				happyPathHelper.advanceTo(caseObjToLink, 'ASSIGN_CASE_OFFICER', 'ISSUE_DECISION', 'HAS');
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				//progress to be related appeal to issue decision
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'ISSUE_DECISION', 'HAS');
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
				cases = [caseObj, caseObjToLink];
				//progress to be related appeal to issue decision
				happyPathHelper.advanceTo(caseObjToLink, 'ASSIGN_CASE_OFFICER', 'ISSUE_DECISION', 'HAS');
				caseDetailsPage.checkStatusOfCase('Issue decision', 0);
				//progress to be related appeal to issue decision
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78', 'WRITTEN');
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
				cases = [caseObj, relatedCase];
				cy.assignCaseOfficerViaApi(relatedCase);
				cy.assignCaseOfficerViaApi(caseObj);
				happyPathHelper.viewCaseDetails(caseObj);

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
				cases = [caseObj, relatedCase];
				cy.assignCaseOfficerViaApi(relatedCase);
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'EVENT_READY_TO_SETUP', 'HAS');
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
			cases = [caseObj];
			cy.assignCaseOfficerViaApi(caseObj);
			happyPathHelper.viewCaseDetails(caseObj);
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
