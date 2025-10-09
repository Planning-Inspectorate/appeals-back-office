// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();

describe('Change start date', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Change Start date', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
			happyPathHelper.changeStartDate(caseObj);
			let dueDate = new Date();
			caseDetailsPage.verifyDateChanges('start-date', dueDate);
		});
	});

	it('Change Start date - hearing', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'LPA_QUESTIONNAIRE',
				'S78',
				'HEARING'
			);
			happyPathHelper.changeStartDate(caseObj);
			let dueDate = new Date();
			caseDetailsPage.verifyDateChanges('start-date', dueDate);

			//Notify
			const expectedNotifies = [
				{
					template: 'appeal-start-date-change-appellant',
					recipient: 'appellant@test.com'
				},
				{
					template: 'appeal-start-date-change-lpa',
					recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
				}
			];

			cy.checkNotifySent(caseObj, expectedNotifies);
		});
	});
});
