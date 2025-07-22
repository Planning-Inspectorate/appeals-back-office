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
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			happyPathHelper.changeStartDate(caseRef);
			cy.getBusinessActualDate(new Date(), 0).then((newDate) => {
				caseDetailsPage.verifyDateChanges('start-date', newDate);
			});
		});
	});

	it('Change Start date - hearing', () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseRef, 'hearing');
			happyPathHelper.changeStartDate(caseRef);
			cy.getBusinessActualDate(new Date(), 0).then((newDate) => {
				caseDetailsPage.verifyDateChanges('start-date', newDate);
			});

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

			cy.checkNotifySent(caseRef, expectedNotifies);
		});
	});
});
