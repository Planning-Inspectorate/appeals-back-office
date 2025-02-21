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

describe('Progress S78 to final comments', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it(`Final comments from 1 approved comment and LPA statement`, { tags: tag.smoke }, () => {
		let todaysDate = new Date();

		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkAppealStatus('Validation'.toUpperCase());
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkAppealStatus('Ready to start'.toUpperCase());
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.checkAppealStatus('LPA Questionnaire'.toUpperCase());
			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.checkAppealStatus('Statements'.toUpperCase());
			happyPathHelper.addThirdPartyComment(caseRef, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseRef, false);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addLpaStatement(caseRef);
			cy.simulateStatementsDeadlineElapsed(caseRef);
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseRef);
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkAppealStatus('Final comments'.toUpperCase());

			//adding an LPA final comment here, to be continued...
			//happyPathHelper.addLpaFinalComment(caseRef);
		});
	});
});
