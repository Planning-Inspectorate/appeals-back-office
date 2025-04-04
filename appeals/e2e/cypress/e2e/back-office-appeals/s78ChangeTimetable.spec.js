// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();

describe('S78 - Case officer update pre populated timetable dates', () => {
	const timetableItems = {
		lpaQuestionnaire: 'lpa-questionnaire-due-date',
		lpaStatement: 'lpa-statement-due-date',
		interestedParty: 'ip-comments-due-date',
		finalComments: 'final-comments-due-date'
	};

	const futureDate = { years: 1, days: 10 };

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);

		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseRef, 'written');
			cy.populateTimetable(caseRef);
			caseDetailsPage.clickAccordionByText('Timetable');
		});
	});

	const verifyDateChange = (timetableItem) => {
		caseDetailsPage.checkTimetableDueDateIsDisplayed(timetableItem);
		caseDetailsPage.clickTimetableChangeLink(timetableItem);

		cy.getBusinessActualDate(
			new Date(new Date().getFullYear() + futureDate.years, 0, 1),
			futureDate.days
		).then((date) => {
			caseDetailsPage.changeTimetableDate(date);
			caseDetailsPage.verifyDateChanges(timetableItem, date);
			caseDetailsPage.validateBannerMessage('Success', 'Timetable updated');
		});
	};

	it('should change LPA questionnaire due date', () => {
		verifyDateChange(timetableItems.lpaQuestionnaire);
	});

	it('should change LPA statement due date', () => {
		verifyDateChange(timetableItems.lpaStatement);
	});

	it('should change interested party comments due date', () => {
		verifyDateChange(timetableItems.interestedParty);
	});

	it('should change final comments due date', () => {
		verifyDateChange(timetableItems.finalComments);
	});

	it('should not accept current date', () => {
		caseDetailsPage.checkTimetableDueDateIsDisplayed(timetableItems.lpaQuestionnaire);
		caseDetailsPage.clickTimetableChangeLink(timetableItems.lpaQuestionnaire);

		caseDetailsPage.changeTimetableDate(new Date());
		caseDetailsPage.checkErrorMessageDisplays('Date must be in the future');
	});

	it('should not accept non business date', () => {
		caseDetailsPage.checkTimetableDueDateIsDisplayed(timetableItems.interestedParty);
		caseDetailsPage.clickTimetableChangeLink(timetableItems.interestedParty);

		const nextYear = new Date().getFullYear() + 1;
		const nonBusinessDate = new Date(nextYear, 0, 1);

		caseDetailsPage.changeTimetableDate(nonBusinessDate);
		caseDetailsPage.checkErrorMessageDisplays('Date must be a business day');
	});
});
