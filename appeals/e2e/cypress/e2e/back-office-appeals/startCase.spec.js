// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';

describe('Start case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Start case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			// TODO Verify that the case has started
		});
	});
});
