// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { happyPathHelper } from '../../support/happyPathHelper';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Update LPAQ Due date', () => {
	const lpaQuestionnaire = 'lpa-questionnaire-due-date';

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('change lpaq due date from timetable', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickChangeLpaqDueDate();
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterLpaqDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Update timetable due dates');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewLpaq(caseObj);
		});
	});

	it('change S78 lpaq due date from timetable', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.clickChangeLpaqDueDate();
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterLpaqDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Update timetable due dates');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewS78Lpaq(caseObj);
		});
	});
});
