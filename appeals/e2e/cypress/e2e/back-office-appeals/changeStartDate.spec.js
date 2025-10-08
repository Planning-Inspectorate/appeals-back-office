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

	it('Change Start date', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			happyPathHelper.changeStartDate(caseObj);
			let dueDate = new Date();
			caseDetailsPage.verifyDateChanges('start-date', dueDate);
		});
	});

	it('Change Start date - hearing', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseObj, 'hearing');
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
