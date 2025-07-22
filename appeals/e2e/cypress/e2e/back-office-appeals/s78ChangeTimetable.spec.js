// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { ListCasesPage } from '../../page_objects/listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('S78 - Case officer update pre populated timetable dates', () => {
	const timetableItems = [
		{
			row: 'lpa-questionnaire-due-date',
			editable: true
		},
		{
			row: 'lpa-statement-due-date',
			editable: true
		},
		{
			row: 'ip-comments-due-date',
			editable: true
		},
		{
			row: 'final-comments-due-date',
			editable: true
		}
	];
	const futureDate = { years: 1, days: 10 };
	let caseRef;

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		cy.intercept('POST', '**/timetable/edit/check', (req) => {
			req.continue((res) => {
				console.log('📤 Request body:', req.body);
				console.log('❌ Response body:', res.body);
				console.log('🔁 Status code:', res.statusCode);
			});
		}).as('timetableCheck');
	});

	it('should change due dates when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.clickAccordionByButton('Timetable');
			verifyDateChanges(0);
		});
	});

	it('should not accept current date when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.clickAccordionByButton('Timetable');
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[0].row);
			caseDetailsPage.changeTimetableDates(timetableItems, new Date(), 7);
			caseDetailsPage.checkErrorMessageDisplays(
				'The lpa questionnaire due date must be in the future'
			);
		});
	});

	it('should not accept non business date when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.clickAccordionByButton('Timetable');
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[0].row);
			const nextYear = new Date().getFullYear() + 1;
			const nonBusinessDate = new Date(nextYear, 0, 1);
			caseDetailsPage.changeTimetableDates(timetableItems, nonBusinessDate, 1);
			caseDetailsPage.checkErrorMessageDisplays(
				'The lpa questionnaire due date must be a business day'
			);
		});
	});

	// tests are flaky error only caused with automation
	it.skip('should move case status to statements and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.clickAccordionByButton('Timetable');
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			verifyDateChanges(1);
		});
	});

	it('should not accept current date when case status is statements', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.clickAccordionByButton('Timetable');
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[1].row);
			caseDetailsPage.changeTimetableDates(timetableItems, new Date(), 7);
			caseDetailsPage.checkErrorMessageDisplays(
				'Statements due date must be after the LPA questionnaire due date'
			);
		});
	});

	it('should not accept non business date when case status is statements', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.clickAccordionByButton('Timetable');
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[1].row);
			const nextYear = new Date().getFullYear() + 2;
			const nonBusinessDate = new Date(nextYear, 0, 1);
			caseDetailsPage.changeTimetableDates([timetableItems[1]], new Date(nextYear, 0, 1), 0);
			caseDetailsPage.checkErrorMessageDisplays('due date must be a business day');
		});
	});

	// tests are flaky error only caused with automation
	it.skip('should move case status to final_comments and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.navigateToAppealsService();
			listCasesPage.clickAppealByRef(caseRef);
			happyPathHelper.addThirdPartyComment(caseRef, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseRef, false);
			caseDetailsPage.clickBackLink();

			happyPathHelper.addLpaStatement(caseRef);
			cy.simulateStatementsDeadlineElapsed(caseRef);
			cy.reload();

			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkStatusOfCase('Final comments', 0);
			caseDetailsPage.clickAccordionByButton('Timetable');
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			timetableItems[1].editable = false; // statement due is not editbale
			timetableItems[2].editable = false; //
			verifyDateChanges(7);
		});
	});

	const getNextBusinessDay = (startDate, addedDays = 1) => {
		const date = new Date(startDate);
		date.setDate(date.getDate() + addedDays);

		while (
			date.getDay() === 0 || // Sunday
			date.getDay() === 6 || // Saturday
			(date.getDate() === 1 && date.getMonth() === 0) // Jan 1
		) {
			date.setDate(date.getDate() + 1);
		}

		return date;
	};

	const verifyDateChanges = (addedDays) => {
		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[3].row);

		const safeAddedDays = Math.max(addedDays, 1);
		const startDate = getNextBusinessDay(new Date(), safeAddedDays + 2); // buffer to avoid today/weekend

		caseDetailsPage.changeTimetableDates(timetableItems, startDate, 7);
		caseDetailsPage.clickUpdateTimetableDueDates();

		caseDetailsPage.verifyDatesChanged(timetableItems, startDate, 7);
		caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
	};
});
