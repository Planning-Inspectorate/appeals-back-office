// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('Create Test Data', () => {
	it('HAS', () => {
		cy.createCase().then((caseObj) => {
			cy.login(users.appeals.caseAdmin);
			cy.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'EVENT_READY_TO_SETUP', 'HAS');
		});
	});
	it('S78 Full Planning', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			cy.login(users.appeals.caseAdmin);
			cy.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'S78', 'written');
		});
	});
	it.only('S20 Listed Building', () => {
		cy.createCase({ caseType: 'Y' }).then((caseObj) => {
			cy.login(users.appeals.caseAdmin);
			cy.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'S20');
			happyPathHelper.viewCaseDetails(caseObj);
		});
	});

	it('Update Case', () => {
		const caseObj = { reference: '6000546' };
		cy.login(users.appeals.caseAdmin);
		cy.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'EVENT_READY_TO_SETUP');
		happyPathHelper.viewCaseDetails(caseObj);
	});
});

// STATUSES.ASSIGN_CASE_OFFICER,
// STATUSES.VALIDATION,
// STATUSES.READY_TO_START,
// STATUSES.LPA_QUESTIONNAIRE,
// STATUSES.STATEMENTS,
// STATUSES.FINAL_COMMENTS,
// STATUSES.EVENT_READY_TO_SETUP,
// STATUSES.AWAITING_EVENT,
// STATUSES.ISSUE_DECISION,
// STATUSES.COMPLETE
