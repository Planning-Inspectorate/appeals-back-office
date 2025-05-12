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
});
