// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper';
import { DateTimeSection } from '../../page_objects/dateTimeSection';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Update LPAQ Due date', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('change lpaq due date from timetable', () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickChangeLpaqDueDate();
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Timetable updated');
			happyPathHelper.reviewLpaq(caseRef);
		});
	});

	it('change S78 lpaq due date from timetable', () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.clickChangeLpaqDueDate();
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateBannerMessage('Timetable updated');
			happyPathHelper.reviewS78Lpaq(caseRef);
		});
	});
});
