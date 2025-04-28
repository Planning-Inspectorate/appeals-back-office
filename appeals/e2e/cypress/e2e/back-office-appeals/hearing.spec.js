// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('Setup hearing', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it(`should display hearing section on the overview page`, () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseRef, 'hearing');
			caseDetailsPage.expandSectionAccordionHeader('Hearing');
			caseDetailsPage.verifyHearingSectionIsDisplayed();
		});
	});
});
