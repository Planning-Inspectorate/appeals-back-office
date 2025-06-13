// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { ListCasesPage } from '../../page_objects/listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('S78 - Case officer update pre populated timetable dates', () => {
	const timetableItems = {
		lpaQuestionnaire: 'lpa-questionnaire-due-date',
		lpaStatement: 'lpa-statement-due-date',
		interestedParty: 'ip-comments-due-date',
		finalComments: 'final-comments-due-date'
	};

	const futureDate = { years: 1, days: 10 };
	let caseRef;

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('should change LPA questionnaire due date', () => {
		navigateToTimeTableSection();
		verifyDateChange(timetableItems.lpaQuestionnaire);
	});

	it('should change LPA statement due date', () => {
		navigateToTimeTableSection();
		verifyDateChange(timetableItems.lpaStatement);
	});

	it('should change interested party comments due date', () => {
		navigateToTimeTableSection();
		verifyDateChange(timetableItems.interestedParty);
	});

	it('should change final comments due date', () => {
		navigateToTimeTableSection();
		verifyDateChange(timetableItems.finalComments);
	});

	it('should not accept current date', () => {
		navigateToTimeTableSection();
		caseDetailsPage.checkTimetableDueDateIsDisplayed(timetableItems.lpaQuestionnaire);
		caseDetailsPage.clickRowChangeLink(timetableItems.lpaQuestionnaire);
		caseDetailsPage.changeTimetableDate(timetableItems.lpaQuestionnaire, new Date());
		caseDetailsPage.checkErrorMessageDisplays(
			'The lpa questionnaire due date must be in the future'
		);
	});

	it('should not accept non business date', () => {
		navigateToTimeTableSection();
		caseDetailsPage.checkTimetableDueDateIsDisplayed(timetableItems.interestedParty);
		caseDetailsPage.clickRowChangeLink(timetableItems.interestedParty);
		const nextYear = new Date().getFullYear() + 1;
		const nonBusinessDate = new Date(nextYear, 0, 1);
		caseDetailsPage.changeTimetableDate(timetableItems.interestedParty, nonBusinessDate);
		caseDetailsPage.checkErrorMessageDisplays(
			'The interested party comments due date must be a business day'
		);
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
		});
	};

	const navigateToTimeTableSection = () => {
		cy.clearAllSessionStorage();
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Timetable');
	};

	const verifyDateChange = (timetableItem) => {
		caseDetailsPage.checkTimetableDueDateIsDisplayed(timetableItem);
		caseDetailsPage.clickRowChangeLink(timetableItem);

		cy.getBusinessActualDate(
			new Date(new Date().getFullYear() + futureDate.years, 0, 1),
			futureDate.days
		).then((date) => {
			caseDetailsPage.changeTimetableDate(timetableItem, date);
			caseDetailsPage.clickButtonByText('Update timetable due dates');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
		});
	};
});
