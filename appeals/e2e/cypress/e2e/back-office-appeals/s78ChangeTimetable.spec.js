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

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('should change due dates when case status is lpa_questionnaire', () => {
		navigateToTimeTableSection();
		verifyDateChanges(0);
	});

	it('should not accept current date when case status is lpa_questionnaire', () => {
		navigateToTimeTableSection();
		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[0].row);
		caseDetailsPage.changeTimetableDates(timetableItems, new Date());
		caseDetailsPage.checkErrorMessageDisplays(
			'The lpa questionnaire due date must be in the future'
		);
	});

	it('should not accept non business date when case status is lpa_questionnaire', () => {
		navigateToTimeTableSection();
		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[0].row);
		const nextYear = new Date().getFullYear() + 1;
		const nonBusinessDate = new Date(nextYear, 0, 1);
		caseDetailsPage.changeTimetableDates(timetableItems, nonBusinessDate);
		caseDetailsPage.checkErrorMessageDisplays(
			'The lpa questionnaire due date must be a business day'
		);
	});

	it('should move case status to statements and update available due dates', () => {
		cy.addLpaqSubmissionToCase(caseRef);
		happyPathHelper.reviewS78Lpaq(caseRef);
		caseDetailsPage.checkStatusOfCase('Statements', 0);
		navigateToTimeTableSection();
		timetableItems[0].editable = false;
		verifyDateChanges(1);
	});

	it('should not accept current date when case status is statements', () => {
		navigateToTimeTableSection();
		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[1].row);
		caseDetailsPage.changeTimetableDates(timetableItems, new Date());
		caseDetailsPage.checkErrorMessageDisplays('The statements due date must be in the future');
	});

	it('should not accept non business date when case status is statements', () => {
		navigateToTimeTableSection();
		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[1].row);
		const nextYear = new Date().getFullYear() + 1;
		const nonBusinessDate = new Date(nextYear, 0, 1);
		caseDetailsPage.changeTimetableDates(timetableItems, nonBusinessDate);
		caseDetailsPage.checkErrorMessageDisplays('The statements due date must be a business day');
	});

	it('should move case status to final_comments and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.login(users.appeals.caseAdmin);
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

		navigateToTimeTableSection();
		timetableItems[1].editable = false;
		timetableItems[2].editable = false;
		verifyDateChanges(7);
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseRef = ref;
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
		});
	};

	const navigateToTimeTableSection = () => {
		cy.clearAllSessionStorage();
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Timetable');
	};

	const verifyDateChanges = (addedDays) => {
		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[3].row);

		cy.getBusinessActualDate(
			new Date(new Date().getFullYear() + futureDate.years, 0, 1),
			futureDate.days + addedDays
		).then((date) => {
			caseDetailsPage.changeTimetableDates(timetableItems, date);
			caseDetailsPage.clickUpdateTimetableDueDates();
			caseDetailsPage.verifyDatesChanged(timetableItems, date);
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
		});
	};
});
