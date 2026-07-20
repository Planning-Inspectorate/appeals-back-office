// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';

const caseDetailsPage = new CaseDetailsPage();

describe('Progress S78 to decision', () => {
	const expectedSections = [
		'Overview',
		'Site',
		'Timetable',
		'Documentation',
		'Costs',
		'Contacts',
		'Team',
		'Case management'
	];

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(`Checks a S78 appeal rolls back from invalid to validation and is then able to progress to start case`, () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('Planning appeal');

			happyPathHelper.reviewAppellantCaseAsInvalid(caseObj);
			caseDetailsPage.checkStatusOfCase('Invalid', 0);

			cy.rollbackToValidation(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

		});
	});

	it(`Checks an enforcement appeal rolls back from invalid to validation and is then able to progress to start case`, () => {
		cy.createCase({
			...appealsApiRequests.enforcementSubmission.casedata
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			caseDetailsPage.verifyAppealType('Enforcement notice appeal');

			happyPathHelper.reviewEnforcementAppellantCaseAsInvalid(caseObj);
			caseDetailsPage.checkStatusOfCase('Invalid', 0);

			cy.rollbackToValidation(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			happyPathHelper.reviewEnforcementAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

		});
	});
});
