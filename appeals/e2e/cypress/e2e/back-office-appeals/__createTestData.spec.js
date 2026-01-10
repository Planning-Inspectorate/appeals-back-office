// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const caseDetailsPage = new CaseDetailsPage();

describe('Create Test Data', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});
	it('HAS', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'HAS');
		});
	});
	it('S78 Written', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'S78', 'WRITTEN');
		});
	});
	it('S78 Hearing', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'S78', 'HEARING');
		});
	});
	it('S78 Inquiry', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			happyPathHelper.updateCase(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'AWAITING_EVENT',
				'S78',
				'INQUIRY'
			);
		});
	});
	it('S20 Listed Building', () => {
		cy.createCase({ caseType: 'Y' }).then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'S20');
		});
	});
	it('CAS Planning', () => {
		cy.createCase({ caseType: 'ZP' }).then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'CAS_PLANNING');
		});
	});
	it('CAS ADVERT', () => {
		cy.createCase({ caseType: 'ZA' }).then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'CAS_ADVERT');
		});
	});
	it('Full Advert', () => {
		cy.createCase({ caseType: 'H' }).then((caseObj) => {
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'COMPLETE', 'ADVERT');
		});
	});
	it.skip('Update Case', () => {
		const caseObj = { reference: '6003035' };
		happyPathHelper.updateCase(caseObj, 'LPA_QUESTIONNAIRE', 'COMPLETE', 'S78');
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
